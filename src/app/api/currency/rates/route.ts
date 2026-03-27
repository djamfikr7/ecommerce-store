import { NextResponse } from 'next/server'
import { getExchangeRates, getSupportedCurrencies } from '@/lib/currency/conversion'

export const runtime = 'edge'

export async function GET() {
  try {
    const rates = getExchangeRates()
    const currencies = getSupportedCurrencies()

    return NextResponse.json({
      base: 'USD',
      rates,
      currencies,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching currency rates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch currency rates' },
      { status: 500 }
    )
  }
}
