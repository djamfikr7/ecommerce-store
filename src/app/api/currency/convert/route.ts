import { NextRequest, NextResponse } from 'next/server'
import {
  convertCurrency,
  getExchangeRate,
  isSupportedCurrency,
} from '@/lib/currency/conversion'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const amount = searchParams.get('amount')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    // Validate required parameters
    if (!amount || !from || !to) {
      return NextResponse.json(
        {
          error: 'Missing required parameters',
          required: ['amount', 'from', 'to'],
        },
        { status: 400 }
      )
    }

    // Parse and validate amount
    const amountNum = parseInt(amount, 10)
    if (isNaN(amountNum) || amountNum < 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be a non-negative integer.' },
        { status: 400 }
      )
    }

    // Validate currency codes
    const fromUpper = from.toUpperCase()
    const toUpper = to.toUpperCase()

    if (!isSupportedCurrency(fromUpper)) {
      return NextResponse.json(
        { error: `Unsupported currency: ${fromUpper}` },
        { status: 400 }
      )
    }

    if (!isSupportedCurrency(toUpper)) {
      return NextResponse.json(
        { error: `Unsupported currency: ${toUpper}` },
        { status: 400 }
      )
    }

    // Perform conversion
    const exchangeRate = getExchangeRate(fromUpper, toUpper)
    const convertedAmount = convertCurrency(amountNum, fromUpper, toUpper)

    return NextResponse.json({
      originalAmount: amountNum,
      originalCurrency: fromUpper,
      convertedAmount,
      convertedCurrency: toUpper,
      exchangeRate,
      formatted: {
        original: `${fromUpper} ${(amountNum / 100).toFixed(2)}`,
        converted: `${toUpper} ${(convertedAmount / 100).toFixed(2)}`,
      },
    })
  } catch (error) {
    console.error('Error converting currency:', error)
    return NextResponse.json(
      { error: 'Failed to convert currency' },
      { status: 500 }
    )
  }
}
