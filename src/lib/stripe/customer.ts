import stripe from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export interface CreateCustomerParams {
  userId: string
  email: string
  name?: string
  phone?: string
  address?: {
    line1: string
    line2?: string
    city: string
    state?: string
    postal_code: string
    country: string
  }
}

export interface UpdateCustomerParams {
  email?: string
  name?: string
  phone?: string
  address?: {
    line1: string
    line2?: string
    city: string
    state?: string
    postal_code: string
    country: string
  }
}

export async function createStripeCustomer(params: CreateCustomerParams): Promise<Stripe.Customer> {
  if (!stripe) {
    throw new Error('Stripe is not initialized')
  }

  const existing = await findCustomerByEmail(params.email)
  if (existing) {
    return existing
  }

  const createParams: Stripe.CustomerCreateParams = {
    email: params.email,
    metadata: {
      userId: params.userId,
    },
  }

  if (params.name) createParams.name = params.name
  if (params.phone) createParams.phone = params.phone
  if (params.address) createParams.address = params.address

  const customer = await stripe.customers.create(createParams)

  console.log(`[Stripe] Customer created: ${customer.id} for user ${params.userId}`)

  return customer
}

export async function getOrCreateCustomer(
  userId: string,
  email: string,
  name?: string | undefined,
): Promise<Stripe.Customer> {
  if (!stripe) {
    throw new Error('Stripe is not initialized')
  }

  const customers = await stripe.customers.list({
    email,
    limit: 1,
  })

  const existing = customers.data[0]
  if (existing) {
    return existing
  }

  const params: CreateCustomerParams = { userId, email }
  if (name) params.name = name

  return createStripeCustomer(params)
}

export async function findCustomerByEmail(email: string): Promise<Stripe.Customer | null> {
  if (!stripe) return null

  const customers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (customers.data.length === 0) return null
  return customers.data[0] as Stripe.Customer
}

export async function findCustomerByUserId(userId: string): Promise<Stripe.Customer | null> {
  if (!stripe) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })

  if (!user) return null

  return findCustomerByEmail(user.email)
}

export async function updateStripeCustomer(
  customerId: string,
  params: UpdateCustomerParams,
): Promise<Stripe.Customer> {
  if (!stripe) {
    throw new Error('Stripe is not initialized')
  }

  const updateData: Stripe.CustomerUpdateParams = {}

  if (params.email) updateData.email = params.email
  if (params.name) updateData.name = params.name
  if (params.phone) updateData.phone = params.phone
  if (params.address) updateData.address = params.address

  const customer = await stripe.customers.update(customerId, updateData)

  console.log(`[Stripe] Customer updated: ${customerId}`)

  return customer
}

export async function deleteStripeCustomer(customerId: string): Promise<Stripe.DeletedCustomer> {
  if (!stripe) {
    throw new Error('Stripe is not initialized')
  }

  const deleted = await stripe.customers.del(customerId)

  console.log(`[Stripe] Customer deleted: ${customerId}`)

  return deleted
}

export async function listCustomerPaymentMethods(
  customerId: string,
): Promise<Stripe.PaymentMethod[]> {
  if (!stripe) return []

  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  })

  return paymentMethods.data
}

export async function handleCustomerCreated(customer: Stripe.Customer): Promise<void> {
  console.log(`[Stripe Webhook] customer.created: ${customer.id}`)

  const userId = customer.metadata?.userId
  const email = customer.email

  if (!email) {
    console.warn('[Stripe] Customer created without email:', customer.id)
    return
  }

  if (!userId) {
    console.log(`[Stripe] Guest customer created: ${customer.id} (${email})`)
    return
  }

  console.log(`[Stripe] Customer ${customer.id} linked to user ${userId} (${email})`)
}
