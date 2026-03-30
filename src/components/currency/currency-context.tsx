'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { convertCurrency } from '@/lib/currency/conversion'

export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'JPY' | 'CNY'

export interface CurrencyInfo {
  code: SupportedCurrency
  symbol: string
  name: string
  flag: string
  decimalPlaces: number
  locale: string
}

export const supportedCurrencies: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: 'US', decimalPlaces: 2, locale: 'en-US' },
  { code: 'EUR', symbol: '\u20AC', name: 'Euro', flag: 'EU', decimalPlaces: 2, locale: 'de-DE' },
  {
    code: 'GBP',
    symbol: '\u00A3',
    name: 'British Pound',
    flag: 'GB',
    decimalPlaces: 2,
    locale: 'en-GB',
  },
  {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    flag: 'CA',
    decimalPlaces: 2,
    locale: 'en-CA',
  },
  {
    code: 'JPY',
    symbol: '\u00A5',
    name: 'Japanese Yen',
    flag: 'JP',
    decimalPlaces: 0,
    locale: 'ja-JP',
  },
  {
    code: 'CNY',
    symbol: '\u00A5',
    name: 'Chinese Yuan',
    flag: 'CN',
    decimalPlaces: 2,
    locale: 'zh-CN',
  },
]

export const defaultCurrency: SupportedCurrency = 'USD'

const CURRENCY_COOKIE = 'preferred-currency'

interface CurrencyContextType {
  currency: SupportedCurrency
  currencyInfo: CurrencyInfo
  setCurrency: (currency: SupportedCurrency) => void
  formatPrice: (cents: number, options?: FormatPriceOptions) => string
  convertFromBase: (cents: number) => number
  isLoading: boolean
}

interface FormatPriceOptions {
  showCurrency?: boolean
  locale?: string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

function setCookie(name: string, value: string, days: number = 365) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

function getCurrencyInfo(code: SupportedCurrency): CurrencyInfo {
  return (
    supportedCurrencies.find((c) => c.code === code) ?? (supportedCurrencies[0] as CurrencyInfo)
  )
}

function detectCurrency(): SupportedCurrency {
  const cookieCurrency = getCookie(CURRENCY_COOKIE) as SupportedCurrency | null
  if (cookieCurrency && supportedCurrencies.some((c) => c.code === cookieCurrency)) {
    return cookieCurrency
  }

  // Try to detect from browser locale
  if (typeof navigator !== 'undefined') {
    const browserLocale = navigator.language

    if (browserLocale.startsWith('en')) return 'USD'
    if (
      browserLocale.startsWith('de') ||
      browserLocale.startsWith('fr') ||
      browserLocale.startsWith('es') ||
      browserLocale.startsWith('it')
    )
      return 'EUR'
    if (browserLocale.startsWith('ja')) return 'JPY'
    if (browserLocale.startsWith('zh')) return 'CNY'
    if (browserLocale.startsWith('en-GB')) return 'GBP'
  }

  return defaultCurrency
}

interface CurrencyProviderProps {
  children: ReactNode
  initialCurrency?: SupportedCurrency
}

export function CurrencyProvider({ children, initialCurrency }: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(
    initialCurrency || defaultCurrency,
  )
  const [isLoading, setIsLoading] = useState(!initialCurrency)

  useEffect(() => {
    if (initialCurrency) {
      setCurrencyState(initialCurrency)
      setIsLoading(false)
    } else {
      const detected = detectCurrency()
      setCurrencyState(detected)
      setIsLoading(false)
    }
  }, [initialCurrency])

  const currencyInfo = getCurrencyInfo(currency)

  const setCurrency = useCallback((newCurrency: SupportedCurrency) => {
    setCurrencyState(newCurrency)
    setCookie(CURRENCY_COOKIE, newCurrency)
  }, [])

  const convertFromBase = useCallback(
    (cents: number): number => {
      try {
        return convertCurrency(cents, 'USD', currency)
      } catch {
        return cents
      }
    },
    [currency],
  )

  const formatPrice = useCallback(
    (cents: number, options: FormatPriceOptions = {}): string => {
      const { showCurrency = true, locale } = options

      // Convert from base USD to target currency
      const convertedCents = convertFromBase(cents)

      const formatter = new Intl.NumberFormat(locale || currencyInfo.locale, {
        style: showCurrency ? 'currency' : 'decimal',
        currency: currency,
        minimumFractionDigits: currencyInfo.decimalPlaces,
        maximumFractionDigits: currencyInfo.decimalPlaces,
      })

      // For currencies like JPY that don't use decimal places
      if (currencyInfo.decimalPlaces === 0) {
        return formatter.format(convertedCents / 100)
      }

      return formatter.format(convertedCents / 100)
    },
    [currency, currencyInfo, convertFromBase],
  )

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyInfo,
        setCurrency,
        formatPrice,
        convertFromBase,
        isLoading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
