// Email sending utility using Resend
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { OrderConfirmationEmail } from './emails/order-confirmation'
import { OrderShippedEmail } from './emails/order-shipped'
import { OrderDeliveredEmail } from './emails/order-delivered'
import { OrderCancelledEmail } from './emails/order-cancelled'
import { OrderStatusUpdateEmail } from './emails/order-status-update'
import { WelcomeEmail } from './emails/welcome'
import { PasswordResetEmail } from './emails/password-reset'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'VoltStore <noreply@voltstore.com>'
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voltstore.com'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

interface SendEmailOptions {
  to: string
  subject: string
  react: React.ReactElement
  cc?: string
  bcc?: string
  replyTo?: string
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function sendEmailWithRetry(
  options: SendEmailOptions,
  attempt = 1
): Promise<{ id: string }> {
  try {
    const { data, error } = await resend.sendEmail({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      react: options.react,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data?.id) {
      throw new Error('No email ID returned from Resend')
    }

    console.log(`Email sent successfully: ${data.id}`)
    return { id: data.id }
  } catch (error) {
    console.error(`Email send attempt ${attempt} failed:`, error)

    if (attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * attempt
      console.log(`Retrying in ${delay}ms...`)
      await sleep(delay)
      return sendEmailWithRetry(options, attempt + 1)
    }

    throw error
  }
}

export async function sendEmail(
  options: SendEmailOptions
): Promise<{ id: string }> {
  // Validate API key at startup
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured')
    throw new Error('Email service not configured')
  }

  console.log(`Sending email to ${options.to}: ${options.subject}`)

  return sendEmailWithRetry(options)
}

// Fetch order with all related data for emails
async function getOrderWithDetails(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          referralCode: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
      },
      shippingAddress: true,
      billingAddress: true,
    },
  })
}

// Order confirmation email
export async function sendOrderConfirmation(orderId: string): Promise<void> {
  const order = await getOrderWithDetails(orderId)

  if (!order) {
    throw new Error(`Order not found: ${orderId}`)
  }

  const email = OrderConfirmationEmail({
    orderNumber: order.orderNumber,
    customerName: order.user.name || 'Valued Customer',
    customerEmail: order.user.email,
    orderDate: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.product.name,
      image: item.product.images[0]?.url || null,
      quantity: item.quantity,
      price: Number(item.price),
    })),
    subtotal: Number(order.subtotal),
    taxAmount: Number(order.taxAmount || 0),
    shippingAmount: Number(order.shippingAmount || 0),
    total: Number(order.total),
    currency: order.currency,
    shippingAddress: {
      name: order.shippingAddress.name,
      line1: order.shippingAddress.line1,
      line2: order.shippingAddress.line2 || undefined,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      postalCode: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
    },
    paymentMethod: order.paymentMethod,
  })

  await sendEmail({
    to: order.user.email,
    subject: `Order Confirmed: #${order.orderNumber}`,
    react: email,
  })

  console.log(`Order confirmation email sent for order: ${order.orderNumber}`)
}

// Order shipped email
export async function sendOrderShipped(orderId: string): Promise<void> {
  const order = await getOrderWithDetails(orderId)

  if (!order) {
    throw new Error(`Order not found: ${orderId}`)
  }

  if (!order.trackingNumber || !order.carrier) {
    throw new Error('Order does not have tracking information')
  }

  const carrierTrackingUrls: Record<string, string> = {
    usps: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.trackingNumber}`,
    ups: `https://www.ups.com/track?tracknum=${order.trackingNumber}`,
    fedex: `https://www.fedex.com/fedextrack/?trknbr=${order.trackingNumber}`,
    dhl: `https://www.dhl.com/en/express/tracking.html?AWB=${order.trackingNumber}`,
  }

  const trackingUrl = carrierTrackingUrls[order.carrier.toLowerCase()]
    || `${baseUrl}/track/${order.trackingNumber}`

  const email = OrderShippedEmail({
    orderNumber: order.orderNumber,
    customerName: order.user.name || 'Valued Customer',
    customerEmail: order.user.email,
    trackingNumber: order.trackingNumber,
    carrier: order.carrier.charAt(0).toUpperCase() + order.carrier.slice(1),
    trackingUrl,
    estimatedDelivery: order.estimatedDelivery || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    items: order.items.map((item) => ({
      id: item.id,
      name: item.product.name,
      image: item.product.images[0]?.url || null,
      quantity: item.quantity,
      price: Number(item.price),
    })),
    shippingAddress: {
      name: order.shippingAddress.name,
      line1: order.shippingAddress.line1,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      postalCode: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
    },
  })

  await sendEmail({
    to: order.user.email,
    subject: `Your Order Has Shipped: #${order.orderNumber}`,
    react: email,
  })

  console.log(`Order shipped email sent for order: ${order.orderNumber}`)
}

// Order delivered email
export async function sendOrderDelivered(orderId: string): Promise<void> {
  const order = await getOrderWithDetails(orderId)

  if (!order) {
    throw new Error(`Order not found: ${orderId}`)
  }

  const email = OrderDeliveredEmail({
    orderNumber: order.orderNumber,
    customerName: order.user.name || 'Valued Customer',
    customerEmail: order.user.email,
    deliveredAt: new Date(),
    items: order.items.map((item) => ({
      id: item.id,
      name: item.product.name,
      image: item.product.images[0]?.url || null,
      quantity: item.quantity,
      productId: item.product.id,
    })),
    referralCode: order.user.referralCode || undefined,
  })

  await sendEmail({
    to: order.user.email,
    subject: `Your Order Has Arrived: #${order.orderNumber}`,
    react: email,
  })

  console.log(`Order delivered email sent for order: ${order.orderNumber}`)
}

// Order cancelled email
export async function sendOrderCancelled(
  orderId: string,
  reason: string
): Promise<void> {
  const order = await getOrderWithDetails(orderId)

  if (!order) {
    throw new Error(`Order not found: ${orderId}`)
  }

  // Calculate refund (if applicable)
  const refundAmount = Number(order.total)
  const refundDate = new Date()
  refundDate.setDate(refundDate.getDate() + 7) // Expected 7 days from now

  const email = OrderCancelledEmail({
    orderNumber: order.orderNumber,
    customerName: order.user.name || 'Valued Customer',
    customerEmail: order.user.email,
    cancelledAt: new Date(),
    reason,
    refundAmount: order.paymentStatus === 'paid' ? refundAmount : undefined,
    refundDate: order.paymentStatus === 'paid' ? refundDate : undefined,
    currency: order.currency,
  })

  await sendEmail({
    to: order.user.email,
    subject: `Order Cancelled: #${order.orderNumber}`,
    react: email,
  })

  console.log(`Order cancelled email sent for order: ${order.orderNumber}`)
}

// Welcome email for new users
export async function sendWelcomeEmail(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      referralCode: true,
    },
  })

  if (!user) {
    throw new Error(`User not found: ${userId}`)
  }

  const email = WelcomeEmail({
    userName: user.name || 'New User',
    userEmail: user.email,
    referralCode: user.referralCode || undefined,
  })

  await sendEmail({
    to: user.email,
    subject: 'Welcome to VoltStore!',
    react: email,
  })

  console.log(`Welcome email sent to user: ${user.email}`)
}

// Password reset email
export async function sendPasswordReset(
  email: string,
  token: string
): Promise<void> {
  // Fetch user to get their name
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true },
  })

  if (!user) {
    // Don't reveal that user doesn't exist
    console.log(`Password reset requested for non-existent email: ${email}`)
    return
  }

  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour expiry

  const emailTemplate = PasswordResetEmail({
    userName: user.name || 'Valued Customer',
    userEmail: email,
    resetUrl,
    expiresAt,
  })

  await sendEmail({
    to: email,
    subject: 'Reset Your VoltStore Password',
    react: emailTemplate,
  })

  console.log(`Password reset email sent to: ${email}`)
}

// Order status update email
export async function sendOrderStatusUpdate(
  orderId: string,
  oldStatus: string,
  newStatus: string
): Promise<void> {
  const order = await getOrderWithDetails(orderId)

  if (!order) {
    throw new Error(`Order not found: ${orderId}`)
  }

  const carrierTrackingUrls: Record<string, string> = {
    usps: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.trackingNumber}`,
    ups: `https://www.ups.com/track?tracknum=${order.trackingNumber}`,
    fedex: `https://www.fedex.com/fedextrack/?trknbr=${order.trackingNumber}`,
    dhl: `https://www.dhl.com/en/express/tracking.html?AWB=${order.trackingNumber}`,
  }

  const trackingUrl = order.carrier && order.trackingNumber
    ? carrierTrackingUrls[order.carrier.toLowerCase()]
    : undefined

  const email = OrderStatusUpdateEmail({
    orderNumber: order.orderNumber,
    customerName: order.user.name || 'Valued Customer',
    customerEmail: order.user.email,
    oldStatus,
    newStatus,
    updatedAt: new Date(),
    trackingNumber: order.trackingNumber || undefined,
    carrier: order.carrier || undefined,
    trackingUrl,
    estimatedDelivery: order.estimatedDelivery || undefined,
  })

  await sendEmail({
    to: order.user.email,
    subject: `Order Update: #${order.orderNumber} is now ${newStatus.replace('_', ' ')}`,
    react: email,
  })

  console.log(`Status update email sent for order: ${order.orderNumber}`)
}

// Validate email configuration
export function validateEmailConfig(): boolean {
  if (!process.env.RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY')
    return false
  }

  if (!process.env.EMAIL_FROM) {
    console.warn('Missing EMAIL_FROM, using default')
  }

  return true
}

// Initialize email service validation
if (process.env.NODE_ENV === 'development') {
  validateEmailConfig()
}
