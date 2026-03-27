import Decimal from 'decimal.js'

/**
 * Format price in cents to currency string
 */
export function formatPrice(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

/**
 * Convert cents to decimal for display
 */
export function centsToDecimal(cents: number): number {
  return new Decimal(cents).dividedBy(100).toNumber()
}

/**
 * Convert decimal to cents for storage
 */
export function decimalToCents(amount: number): number {
  return new Decimal(amount).times(100).toInteger().toNumber()
}

/**
 * Add two prices in cents without floating point errors
 */
export function addPrices(a: number, b: number): number {
  return new Decimal(a).plus(b).toInteger().toNumber()
}

/**
 * Subtract two prices in cents without floating point errors
 */
export function subtractPrices(a: number, b: number): number {
  return new Decimal(a).minus(b).toInteger().toNumber()
}

/**
 * Multiply price by quantity
 */
export function multiplyPrice(price: number, quantity: number): number {
  return new Decimal(price).times(quantity).toInteger().toNumber()
}

/**
 * Calculate percentage of price
 */
export function percentageOf(price: number, percent: number): number {
  return new Decimal(price).times(percent).dividedBy(100).toInteger().toNumber()
}

/**
 * Round price to currency precision
 */
export function roundPrice(cents: number, decimalPlaces = 2): number {
  const factor = new Decimal(10).pow(decimalPlaces).toNumber()
  return Math.round(cents / factor) * factor
}
