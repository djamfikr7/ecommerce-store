'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ArrowUpDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ShopSortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular'

const sortOptions: { value: ShopSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
]

interface ShopSortProps {
  value: ShopSortOption
  onChange: (value: ShopSortOption) => void
}

export function ShopSort({ value, onChange }: ShopSortProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = sortOptions.find((opt) => opt.value === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'neo-raised-sm rounded-xl px-4 py-2.5',
          'flex items-center gap-2 text-sm text-slate-300',
          'transition-all duration-200 hover:text-slate-100',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary',
          isOpen && 'neo-pressed-sm',
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <ArrowUpDown className="h-4 w-4 text-accent-primary" />
        <span className="hidden sm:inline">Sort by:</span>
        <span className="font-medium text-slate-100">{selectedOption?.label}</span>
        <ChevronDown
          className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="neo-card absolute right-0 z-50 mt-2 w-56 p-2"
            role="listbox"
          >
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={cn(
                  'w-full rounded-lg px-3 py-2.5 text-left text-sm',
                  'flex items-center justify-between transition-all duration-150',
                  option.value === value
                    ? 'bg-accent-primary/20 neo-pressed-sm text-accent-primary'
                    : 'text-slate-300 hover:bg-surface-elevated hover:text-slate-100',
                )}
                role="option"
                aria-selected={option.value === value}
              >
                {option.label}
                {option.value === value && <Check className="h-4 w-4" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
