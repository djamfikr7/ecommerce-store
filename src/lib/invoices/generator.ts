// PDF invoice generation using Puppeteer
import puppeteer from 'puppeteer'
import { prisma } from '@/lib/prisma'
import { renderToStaticMarkup } from 'react-dom/server'
import { InvoiceTemplate } from './template'
import fs from 'fs/promises'
import path from 'path'

export interface InvoiceData {
  invoiceNumber: string
  invoiceDate: Date
  dueDate: Date | null
  orderId: string
  orderNumber: string
  customerEmail: string
  customerName: string
  billingAddress: {
    name: string
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  shippingAddress: {
    name: string
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  lineItems: Array<{
    id: string
    productName: string
    variantName?: string
    sku: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  currency: string
  paymentMethod: string
  paymentStatus: string
  notes?: string
}

// Generate unique invoice number
function generateInvoiceNumber(orderNumber: string): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `INV-${year}${month}${day}-${orderNumber.replace('ORD-', '')}`
}

// Fetch order data and transform to invoice format
export async function generateInvoiceData(orderId: string): Promise<InvoiceData | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
              sku: true,
            },
          },
          variant: {
            select: {
              name: true,
              sku: true,
            },
          },
        },
      },
    },
  })

  if (!order) return null

  const billingAddress = order.billingAddress as any
  const shippingAddress = order.shippingAddress as any

  const invoiceData: InvoiceData = {
    invoiceNumber: generateInvoiceNumber(order.orderNumber),
    invoiceDate: order.createdAt,
    dueDate: null,
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerEmail: order.user?.email || '',
    customerName: order.user?.name || 'Guest Customer',
    billingAddress: {
      name: billingAddress.name || billingAddress.firstName + ' ' + billingAddress.lastName,
      line1: billingAddress.line1 || billingAddress.addressLine1,
      line2: billingAddress.line2 || billingAddress.addressLine2,
      city: billingAddress.city,
      state: billingAddress.state,
      postalCode: billingAddress.postalCode,
      country: billingAddress.country,
    },
    shippingAddress: {
      name: shippingAddress.name || shippingAddress.firstName + ' ' + shippingAddress.lastName,
      line1: shippingAddress.line1 || shippingAddress.addressLine1,
      line2: shippingAddress.line2 || shippingAddress.addressLine2,
      city: shippingAddress.city,
      state: shippingAddress.state,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country,
    },
    lineItems: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      variantName: item.variantName || undefined,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.price / 100, // Convert cents to dollars
      total: item.total / 100,
    })),
    subtotal: order.subtotal / 100,
    tax: order.tax / 100,
    shipping: order.shippingCost / 100,
    discount: 0,
    total: order.total / 100,
    currency: order.currency,
    paymentMethod: order.paymentMethod || 'N/A',
    paymentStatus: order.paymentStatus,
    notes: order.notes || undefined,
  }

  return invoiceData
}

// Generate PDF from invoice data
export async function generateInvoicePDF(invoiceData: InvoiceData): Promise<Buffer> {
  // Render React component to HTML
  const html = renderToStaticMarkup(InvoiceTemplate({ invoice: invoiceData }))

  // Wrap in full HTML document
  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoiceData.invoiceNumber}</title>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `

  // Launch Puppeteer and generate PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
  })

  try {
    const page = await browser.newPage()
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}

// Main function to generate invoice PDF from order ID
export async function getInvoicePDF(orderId: string): Promise<Buffer | null> {
  const invoiceData = await generateInvoiceData(orderId)
  if (!invoiceData) return null

  return generateInvoicePDF(invoiceData)
}

// Store invoice to filesystem
export async function storeInvoice(orderId: string, pdfBuffer: Buffer): Promise<string> {
  const invoicesDir = path.join(process.cwd(), 'storage', 'invoices')

  // Ensure directory exists
  await fs.mkdir(invoicesDir, { recursive: true })

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { orderNumber: true },
  })

  if (!order) throw new Error('Order not found')

  const filename = `invoice-${order.orderNumber}.pdf`
  const filepath = path.join(invoicesDir, filename)

  await fs.writeFile(filepath, pdfBuffer)

  return filepath
}

// Get stored invoice path
export async function getStoredInvoicePath(orderId: string): Promise<string | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { orderNumber: true },
  })

  if (!order) return null

  const filepath = path.join(
    process.cwd(),
    'storage',
    'invoices',
    `invoice-${order.orderNumber}.pdf`,
  )

  try {
    await fs.access(filepath)
    return filepath
  } catch {
    return null
  }
}
