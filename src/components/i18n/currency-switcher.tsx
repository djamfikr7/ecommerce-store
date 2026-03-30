'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, ChevronDown, Check } from 'lucide-react'
import {
  CURRENCY_META,
  SUPPORTED_CURRENCIES,
  type SupportedCurrency,
  type CurrencyMeta,
} from '@/lib/currency/exchange-rates'
import { cn } from '@/lib/utils'

const CURRENCY_COOKIE = 'preferred-currency'
const COOKIE_MAX_AGE = 31536000

interface CurrencySwitcherProps {
  currentCurrency?: SupportedCurrency
  className?: string
  onCurrencyChange?: (currency: SupportedCurrency) => void
}

function getCookieCurrency(): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${CURRENCY_COOKIE}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null
  return null
}

function setCookieCurrency(currency: string): void {
  document.cookie = `${CURRENCY_COOKIE}=${currency};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`
}

function detectCurrency(): SupportedCurrency {
  const cookie = getCookieCurrency()
  if (cookie && SUPPORTED_CURRENCIES.includes(cookie as SupportedCurrency)) {
    return cookie as SupportedCurrency
  }

  if (typeof navigator !== 'undefined') {
    const lang = navigator.language
    if (lang.startsWith('en-GB')) return 'GBP'
    if (lang.startsWith('en-CA') || lang.startsWith('fr-CA')) return 'CAD'
    if (
      lang.startsWith('de') ||
      lang.startsWith('fr') ||
      lang.startsWith('es') ||
      lang.startsWith('it')
    )
      return 'EUR'
  }

  return 'USD'
}

export function CurrencySwitcher({
  currentCurrency,
  className,
  onCurrencyChange,
}: CurrencySwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currency, setCurrency] = useState<SupportedCurrency>(currentCurrency ?? detectCurrency())
  const dropdownRef = useRef<HTMLDivElement>(null)

  const meta: CurrencyMeta = CURRENCY_META[currency]

  useEffect(() => {
    if (currentCurrency) setCurrency(currentCurrency)
  }, [currentCurrency])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  const handleSelect = useCallback(
    (code: SupportedCurrency) => {
      setCurrency(code)
      setCookieCurrency(code)
      setIsOpen(false)
      onCurrencyChange?.(code)
    },
    [onCurrencyChange],
  )

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2',
          'neo-raised text-sm text-slate-300',
          'hover:text-white hover:shadow-lg',
          'transition-all duration-200',
          'focus:ring-accent-primary/50 focus:outline-none focus:ring-2',
          isOpen && 'ring-accent-primary/50 ring-2',
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select currency"
      >
        <DollarSign className="h-4 w-4 text-accent-primary" />
        <span className="font-medium">{meta.symbol}</span>
        <span className="hidden text-xs text-slate-500 sm:inline">{currency}</span>
        <ChevronDown
          className={cn('h-3 w-3 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute end-0 mt-2 w-56 rounded-xl py-2',
              'neo-inset glass border border-white/10',
              'shadow-xl shadow-black/20',
              'z-50',
            )}
            role="listbox"
            aria-label="Currency options"
          >
            <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
              Select Currency
            </div>

            {SUPPORTED_CURRENCIES.map((code) => {
              const curr = CURRENCY_META[code]
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleSelect(code)}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2.5 text-start',
                    'transition-colors duration-150',
                    'hover:bg-white/5',
                    currency === code && 'bg-accent-primary/10',
                  )}
                  role="option"
                  aria-selected={currency === code}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-sm font-bold">
                    {curr.symbol}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-200">{curr.name}</span>
                    <span className="ms-2 text-xs text-slate-500">{code}</span>
                  </div>
                  <span className="text-sm">{curr.flag}</span>
                  {currency === code && <Check className="h-4 w-4 text-accent-primary" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
