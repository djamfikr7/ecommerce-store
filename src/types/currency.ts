// Currency types for the e-commerce platform

export interface CurrencyInfo {
  code: string
  symbol: string
  name: string
  decimalPlaces: number
}

export interface CurrencyRates {
  base: 'USD'
  rates: Record<string, number>
  updatedAt: string
}

export interface ConversionRequest {
  amount: number
  from: string
  to: string
}

export interface ConversionResponse {
  originalAmount: number
  originalCurrency: string
  convertedAmount: number
  convertedCurrency: string
  exchangeRate: number
}

export interface PriceBreakdown {
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  currency: string
}
