import { CURRENCY_META, type SupportedCurrency } from './exchange-rates'

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  ja: 'ja-JP',
  zh: 'zh-CN',
  ar: 'ar-SA',
}

export function getLocaleForCurrency(currency: SupportedCurrency): string {
  return CURRENCY_META[currency]?.locale ?? 'en-US'
}

export function getLocaleForLang(lang: string): string {
  return LOCALE_MAP[lang] ?? lang
}

export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = 'USD',
  locale?: string,
): string {
  const meta = CURRENCY_META[currency]
  const intlLocale = locale ?? meta?.locale ?? 'en-US'

  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: meta?.decimalPlaces ?? 2,
    maximumFractionDigits: meta?.decimalPlaces ?? 2,
  }).format(amount)
}

export function formatCents(
  cents: number,
  currency: SupportedCurrency = 'USD',
  locale?: string,
): string {
  const meta = CURRENCY_META[currency]
  const decimals = meta?.decimalPlaces ?? 2
  const amount = cents / Math.pow(10, decimals)
  return formatCurrency(amount, currency, locale)
}

export function formatNumber(
  value: number,
  locale: string = 'en-US',
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value)
}

export function formatCompactNumber(value: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value)
}

export function formatPercent(
  value: number,
  locale: string = 'en-US',
  decimals: number = 0,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100)
}

export function formatDate(
  date: Date | string | number,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }

  return new Intl.DateTimeFormat(locale, defaultOptions).format(d)
}

export function formatRelativeTime(date: Date | string | number, locale: string = 'en-US'): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date

  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHr = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHr / 24)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (diffSec < 60) return rtf.format(-diffSec, 'second')
  if (diffMin < 60) return rtf.format(-diffMin, 'minute')
  if (diffHr < 24) return rtf.format(-diffHr, 'hour')
  if (diffDay < 30) return rtf.format(-diffDay, 'day')
  if (diffDay < 365) return rtf.format(-Math.round(diffDay / 30), 'month')
  return rtf.format(-Math.round(diffDay / 365), 'year')
}

export function parseFormattedNumber(formatted: string, locale: string = 'en-US'): number {
  const parts = new Intl.NumberFormat(locale).formatToParts(1234.56)
  const groupSep = parts.find((p) => p.type === 'group')?.value ?? ','
  const decimalSep = parts.find((p) => p.type === 'decimal')?.value ?? '.'

  const cleaned = formatted
    .replace(new RegExp(`\\${groupSep}`, 'g'), '')
    .replace(decimalSep, '.')
    .replace(/[^\d.\-]/g, '')

  return parseFloat(cleaned)
}
