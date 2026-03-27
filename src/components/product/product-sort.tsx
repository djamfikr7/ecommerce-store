'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProductSortOption } from '@/types/products'

const sortOptions: { value: ProductSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
]

interface ProductSortProps {
  value: ProductSortOption
  onChange: (value: ProductSortOption) => void
}

export function ProductSort({ value, onChange }: ProductSortProps) {
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
          'neo-raised-sm px-4 py-2 rounded-lg',
          'flex items-center gap-2 text-sm text-slate-300',
          'hover:text-slate-100 transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <ArrowUpDown className="h-4 w-4" />
        <span>Sort by:</span>
        <span className="font-medium text-slate-100">{selectedOption?.label}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 neo-card p-2 z-50"
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
                  'w-full px-3 py-2 rounded-lg text-sm text-left',
                  'transition-colors',
                  option.value === value
                    ? 'bg-accent-primary/20 text-accent-primary neo-pressed-sm'
                    : 'text-slate-300 hover:bg-surface-elevated hover:text-slate-100'
                )}
                role="option"
                aria-selected={option.value === value}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
