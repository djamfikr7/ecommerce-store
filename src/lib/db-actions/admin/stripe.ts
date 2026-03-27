'use server'

import stripe from '@/lib/stripe'
import type {
  StripeBalance,
  StripePayoutInfo,
  StripeTransaction,
  StripeTransactionParams,
} from '@/types/admin'

/**
 * Get Stripe account balance
 */
export async function getStripeBalance(): Promise<StripeBalance> {
  try {
    const balance = await stripe.balance.retrieve()

    // Get available and pending amounts in USD (or default currency)
    const available = balance.available.reduce((sum, b) => sum + b.amount, 0)
    const pending = balance.pending.reduce((sum, b) => sum + b.amount, 0)
    const currency = balance.available[0]?.currency || balance.pending[0]?.currency || 'usd'

    return {
      available,
      pending,
      currency: currency.toUpperCase(),
    }
  } catch (error) {
    console.error('Error fetching Stripe balance:', error)
    throw new Error('Failed to fetch Stripe balance')
  }
}

/**
 * Get Stripe payout schedule
 */
export async function getStripePayoutSchedule(): Promise<StripePayoutInfo> {
  try {
    // Get account info
    const account = await stripe.account.retrieve()

    // Get balance transactions to determine payout schedule
    const balanceTransactions = await stripe.balanceTransactions.list({
      limit: 100,
    })

    // Get recent payouts
    const payouts = await stripe.payouts.list({
      limit: 10,
    })

    // Determine payout schedule from account settings or payouts
    const schedule = account.settings?.payouts?.schedule
    const lastPayout = payouts.data[0]

    // Determine interval
    let interval: 'daily' | 'weekly' | 'monthly' = 'daily'
    let weekday: number | undefined
    let dayOfMonth: number | undefined

    if (schedule?.interval === 'weekly') {
      interval = 'weekly'
      weekday = schedule.weekly_anchor || 0
    } else if (schedule?.interval === 'monthly') {
      interval = 'monthly'
      dayOfMonth = schedule.monthly_anchor || 1
    } else if (schedule?.interval === 'manual') {
      // Manual payouts - use last payout date
      interval = 'daily'
    }

    // Calculate next payout date
    let nextPayoutDate: Date
    if (lastPayout?.arrival_date) {
      nextPayoutDate = new Date(lastPayout.arrival_date * 1000)

      if (interval === 'daily') {
        nextPayoutDate.setDate(nextPayoutDate.getDate() + 1)
      } else if (interval === 'weekly') {
        // Assuming weekly on Monday (weekday 1)
        while (nextPayoutDate.getDay() !== ((weekday || 0) + 1) % 7) {
          nextPayoutDate.setDate(nextPayoutDate.getDate() + 1)
        }
      } else if (interval === 'monthly') {
        nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1)
        nextPayoutDate.setDate(dayOfMonth || 1)
      }
    } else {
      // Default to tomorrow
      nextPayoutDate = new Date()
      nextPayoutDate.setDate(nextPayoutDate.getDate() + 1)
    }

    return {
      nextPayoutDate: nextPayoutDate.toISOString(),
      nextPayoutAmount: lastPayout?.amount || 0,
      interval,
      weekday,
      dayOfMonth,
    }
  } catch (error) {
    console.error('Error fetching Stripe payout schedule:', error)
    throw new Error('Failed to fetch Stripe payout schedule')
  }
}

/**
 * Get Stripe transaction history
 */
export async function getStripeTransactionHistory(
  params: StripeTransactionParams = {}
): Promise<StripeTransaction[]> {
  try {
    const { limit = 50, startingAfter, endingBefore } = params

    // Get balance transactions
    const balanceTransactions = await stripe.balanceTransactions.list({
      limit,
      ...(startingAfter && { starting_after: startingAfter }),
      ...(endingBefore && { ending_before: endingBefore }),
    })

    // Get related charges, refunds, and payouts
    const transactions: StripeTransaction[] = []

    for (const bt of balanceTransactions.data) {
      let description: string | undefined
      let orderId: string | undefined
      let type: 'charge' | 'refund' | 'payout' | 'fee'

      if (bt.type === 'charge') {
        type = 'charge'
        try {
          const charge = await stripe.charges.retrieve(bt.source as string)
          description = `Charge - ${charge.description || charge.id}`
          orderId = charge.metadata?.orderId
        } catch {
          description = `Charge - ${bt.id}`
        }
      } else if (bt.type === 'refund') {
        type = 'refund'
        try {
          const refund = await stripe.refunds.retrieve(bt.source as string)
          description = `Refund - ${refund.reason || 'Customer request'}`
          orderId = refund.metadata?.orderId
        } catch {
          description = `Refund - ${bt.id}`
        }
      } else if (bt.type === 'payout') {
        type = 'payout'
        try {
          const payout = await stripe.payouts.retrieve(bt.source as string)
          description = `Payout to ${payout.destination || 'bank account'}`
        } catch {
          description = `Payout - ${bt.id}`
        }
      } else {
        type = 'fee'
        description = `Fee - ${bt.description || bt.type}`
      }

      transactions.push({
        id: bt.id,
        type,
        amount: bt.amount,
        currency: bt.currency.toUpperCase(),
        status: bt.status,
        description,
        created: new Date(bt.created * 1000).toISOString(),
        orderId,
      })
    }

    return transactions
  } catch (error) {
    console.error('Error fetching Stripe transactions:', error)
    throw new Error('Failed to fetch Stripe transactions')
  }
}

/**
 * Get Stripe account statistics
 */
export async function getStripeAccountStats(): Promise<{
  totalRevenue: number
  totalRefunds: number
  totalFees: number
  netRevenue: number
}> {
  try {
    const balance = await stripe.balance.retrieve()

    let totalRevenue = 0
    let totalRefunds = 0
    let totalFees = 0

    // Calculate from available and pending (gross amounts before fees)
    for (const available of balance.available) {
      if (available.type === 'charge') {
        totalRevenue += available.amount
      } else if (available.type === 'refund') {
        totalRefunds += available.amount
      } else if (available.type === 'fee') {
        totalFees += available.amount
      }
    }

    for (const pending of balance.pending) {
      if (pending.type === 'charge') {
        totalRevenue += pending.amount
      } else if (pending.type === 'refund') {
        totalRefunds += pending.amount
      } else if (pending.type === 'fee') {
        totalFees += pending.amount
      }
    }

    return {
      totalRevenue,
      totalRefunds,
      totalFees,
      netRevenue: totalRevenue - totalRefunds - totalFees,
    }
  } catch (error) {
    console.error('Error fetching Stripe stats:', error)
    throw new Error('Failed to fetch Stripe stats')
  }
}
