'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, ChevronDown, Check } from 'lucide-react'
import { useCurrency, supportedCurrencies, type SupportedCurrency } from './currency-context'
import { cn } from '@/lib/utils'

interface CurrencySelectorProps {
  className?: string
}

export function CurrencySelector({ className }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { currency, currencyInfo, setCurrency } = useCurrency()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const handleSelect = (newCurrency: SupportedCurrency) => {
    setCurrency(newCurrency)
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'neo-raised text-sm text-slate-300',
          'hover:text-white hover:shadow-lg',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-accent-primary/50',
          isOpen && 'ring-2 ring-accent-primary/50'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select currency"
      >
        <DollarSign className="h-4 w-4 text-accent-primary" />
        <span className="font-medium">{currencyInfo.symbol}</span>
        <span className="hidden sm:inline text-xs text-slate-500">
          {currency}
        </span>
        <ChevronDown
          className={cn(
            'h-3 w-3 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
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
              'absolute right-0 mt-2 w-56 py-2 rounded-xl',
              'neo-inset glass border border-white/10',
              'shadow-xl shadow-black/20',
              'z-50'
            )}
            role="listbox"
            aria-label="Currency options"
          >
            <div className="px-3 py-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
              Select Currency
            </div>

            {supportedCurrencies.map((curr) => (
              <button
                key={curr.code}
                type="button"
                onClick={() => handleSelect(curr.code)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 text-left',
                  'transition-colors duration-150',
                  'hover:bg-white/5',
                  currency === curr.code && 'bg-accent-primary/10'
                )}
                role="option"
                aria-selected={currency === curr.code}
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm font-bold">
                  {curr.symbol}
                </div>
                <div className="flex-1">
                  <span className="text-sm text-slate-200 font-medium">
                    {curr.name}
                  </span>
                  <span className="text-xs text-slate-500 ml-2">
                    {curr.code}
                  </span>
                </div>
                {currency === curr.code && (
                  <Check className="h-4 w-4 text-accent-primary" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
