import Decimal from 'decimal.js'

// Exchange rates (relative to USD = 1.0)
// In production: fetch from Open Exchange Rates API
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CNY: 7.24,
  CAD: 1.36,
  AUD: 1.53,
}

// Currency information for supported currencies
export interface CurrencyInfo {
  code: string
  symbol: string
  name: string
  decimalPlaces: number
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', decimalPlaces: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro', decimalPlaces: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound', decimalPlaces: 2 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimalPlaces: 0 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimalPlaces: 2 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimalPlaces: 2 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimalPlaces: 2 },
]

/**
 * Get currency info by code
 */
export function getCurrencyInfo(code: string): CurrencyInfo | undefined {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code.toUpperCase())
}

/**
 * Get all supported currencies
 */
export function getSupportedCurrencies(): CurrencyInfo[] {
  return SUPPORTED_CURRENCIES
}

/**
 * Get exchange rate between two currencies
 */
export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  const from = fromCurrency.toUpperCase()
  const to = toCurrency.toUpperCase()

  if (from === to) return 1.0

  const fromRate = EXCHANGE_RATES[from]
  const toRate = EXCHANGE_RATES[to]

  if (!fromRate || !toRate) {
    throw new Error(`Unsupported currency: ${!fromRate ? from : to}`)
  }

  // Convert from source to USD, then from USD to target
  return new Decimal(toRate).dividedBy(fromRate).toNumber()
}

/**
 * Convert amount (in cents) from one currency to another
 * Returns the result in cents with proper rounding
 */
export function convertCurrency(
  amountCents: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (amountCents === 0) return 0

  const from = fromCurrency.toUpperCase()
  const to = toCurrency.toUpperCase()

  if (from === to) return amountCents

  const rate = getExchangeRate(from, to)
  const currencyInfo = getCurrencyInfo(to)

  if (!currencyInfo) {
    throw new Error(`Unsupported currency: ${to}`)
  }

  // Convert cents to decimal, apply rate, then convert back to cents
  const decimalPlaces = currencyInfo.decimalPlaces
  const factor = new Decimal(10).pow(decimalPlaces)

  const result = new Decimal(amountCents)
    .dividedBy(100) // Convert cents to decimal amount
    .times(rate) // Apply exchange rate
    .times(factor) // Scale for target decimal places
    .toInteger() // Round to integer
    .dividedBy(factor) // Convert back to cents representation
    .times(100) // Convert to cents

  return result.toNumber()
}

/**
 * Get all exchange rates relative to USD
 */
export function getExchangeRates(): Record<string, number> {
  return { ...EXCHANGE_RATES }
}

/**
 * Format amount in cents for a specific locale and currency
 * Uses Intl.NumberFormat for proper locale formatting
 */
export function formatForLocale(
  amountCents: number,
  currency: string,
  locale: string
): string {
  const amount = new Decimal(amountCents).dividedBy(100).toNumber()

  // Map app locales to Intl locales
  const localeMap: Record<string, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    ja: 'ja-JP',
    zh: 'zh-CN',
  }

  const intlLocale = localeMap[locale] || locale

  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Validate if a currency code is supported
 */
export function isSupportedCurrency(code: string): boolean {
  return code.toUpperCase() in EXCHANGE_RATES
}
