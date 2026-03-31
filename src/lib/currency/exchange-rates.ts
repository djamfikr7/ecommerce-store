import Decimal from 'decimal.js'

export interface ExchangeRateData {
  base: string
  rates: Record<string, number>
  updatedAt: number
  source: string
}

interface CacheEntry {
  data: ExchangeRateData
  timestamp: number
}

const CACHE_KEY = 'exchange-rates-cache'
const CACHE_TTL_MS = 60 * 60 * 1000

const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  JPY: 149.5,
  CNY: 7.24,
  AUD: 1.53,
}

let memoryCache: CacheEntry | null = null

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD'] as const
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

export interface CurrencyMeta {
  code: SupportedCurrency
  symbol: string
  name: string
  decimalPlaces: number
  locale: string
  flag: string
}

export const CURRENCY_META: Record<SupportedCurrency, CurrencyMeta> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimalPlaces: 2,
    locale: 'en-US',
    flag: '🇺🇸',
  },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimalPlaces: 2, locale: 'de-DE', flag: '🇪🇺' },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimalPlaces: 2,
    locale: 'en-GB',
    flag: '🇬🇧',
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    decimalPlaces: 2,
    locale: 'en-CA',
    flag: '🇨🇦',
  },
}

function readSessionCache(): CacheEntry | null {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CacheEntry
  } catch {
    return null
  }
}

function writeSessionCache(entry: CacheEntry): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry))
  } catch {
    // storage full or unavailable
  }
}

function isCacheValid(entry: CacheEntry | null): entry is CacheEntry {
  if (!entry) return false
  return Date.now() - entry.timestamp < CACHE_TTL_MS
}

async function fetchRatesFromAPI(): Promise<ExchangeRateData | null> {
  if (typeof window === 'undefined') return null

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return {
      base: 'USD',
      rates: data.rates,
      updatedAt: Date.now(),
      source: 'open.er-api.com',
    }
  } catch {
    return null
  }
}

function buildFallbackData(): ExchangeRateData {
  return {
    base: 'USD',
    rates: { ...FALLBACK_RATES },
    updatedAt: Date.now(),
    source: 'fallback',
  }
}

export async function getExchangeRates(): Promise<ExchangeRateData> {
  if (isCacheValid(memoryCache)) return memoryCache.data

  const sessionEntry = readSessionCache()
  if (isCacheValid(sessionEntry)) {
    memoryCache = sessionEntry
    return sessionEntry.data
  }

  const apiData = await fetchRatesFromAPI()
  if (apiData) {
    const entry: CacheEntry = { data: apiData, timestamp: Date.now() }
    memoryCache = entry
    writeSessionCache(entry)
    return apiData
  }

  const fallback = buildFallbackData()
  const entry: CacheEntry = { data: fallback, timestamp: Date.now() }
  memoryCache = entry
  writeSessionCache(entry)
  return fallback
}

export function getRateSync(from: string, to: string): number {
  const rates = memoryCache?.data.rates ?? FALLBACK_RATES
  const f = from.toUpperCase()
  const t = to.toUpperCase()
  if (f === t) return 1.0
  const fromRate = rates[f]
  const toRate = rates[t]
  if (!fromRate || !toRate) return 1.0
  return new Decimal(toRate).dividedBy(fromRate).toNumber()
}

export function convertAmount(amountCents: number, from: string, to: string): number {
  if (amountCents === 0) return 0
  const f = from.toUpperCase()
  const t = to.toUpperCase()
  if (f === t) return amountCents

  const rate = getRateSync(f, t)
  const meta = CURRENCY_META[t as SupportedCurrency]
  const decimals = meta?.decimalPlaces ?? 2

  return new Decimal(amountCents)
    .dividedBy(100)
    .times(rate)
    .toDecimalPlaces(decimals)
    .times(100)
    .toDecimalPlaces(0)
    .toNumber()
}

export function isCurrencySupported(code: string): code is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(code as SupportedCurrency)
}
