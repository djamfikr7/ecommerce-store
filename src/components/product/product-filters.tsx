'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, ChevronUp, SlidersHorizontal, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { CategoryWithCount } from '@/types/products'

export interface ActiveFilters {
  categories: string[]
  priceRange: [number, number]
  minRating: number
  inStockOnly: boolean
}

interface ProductFiltersProps {
  filters: ActiveFilters
  onFilterChange: (filters: ActiveFilters) => void
  categories: CategoryWithCount[]
  priceBounds?: { min: number; max: number }
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function ProductFilters({
  filters,
  onFilterChange,
  categories,
  priceBounds = { min: 0, max: 100000 },
  isMobileOpen = false,
  onMobileClose,
}: ProductFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['category', 'price'])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    )
  }

  const handleCategoryChange = (categorySlug: string) => {
    const newCategories = filters.categories.includes(categorySlug)
      ? filters.categories.filter((c) => c !== categorySlug)
      : [...filters.categories, categorySlug]
    onFilterChange({ ...filters, categories: newCategories })
  }

  const handlePriceChange = (index: 0 | 1, value: number) => {
    const newRange: [number, number] = [...filters.priceRange] as [number, number]
    newRange[index] = value
    if (index === 0 && value > filters.priceRange[1]) {
      newRange[1] = value
    }
    if (index === 1 && value < filters.priceRange[0]) {
      newRange[0] = value
    }
    onFilterChange({ ...filters, priceRange: newRange })
  }

  const handleRatingChange = (rating: number) => {
    onFilterChange({
      ...filters,
      minRating: filters.minRating === rating ? 0 : rating,
    })
  }

  const handleInStockToggle = () => {
    onFilterChange({ ...filters, inStockOnly: !filters.inStockOnly })
  }

  const clearAllFilters = () => {
    onFilterChange({
      categories: [],
      priceRange: [priceBounds.min, priceBounds.max],
      minRating: 0,
      inStockOnly: false,
    })
  }

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.minRating > 0 ||
    filters.inStockOnly ||
    filters.priceRange[0] > priceBounds.min ||
    filters.priceRange[1] < priceBounds.max

  const activeFilterCount =
    filters.categories.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.priceRange[0] > priceBounds.min || filters.priceRange[1] < priceBounds.max ? 1 : 0)

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category filter */}
      <FilterSection
        title="Category"
        isExpanded={expandedSections.includes('category')}
        onToggle={() => toggleSection('category')}
      >
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category.slug)}
                  onChange={() => handleCategoryChange(category.slug)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 rounded neo-pressed-sm border border-border-default peer-checked:border-accent-primary peer-checked:bg-accent-primary/20 transition-colors">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                    <svg className="w-3 h-3 text-accent-primary" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
              <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">
                {category.name}
              </span>
              <span className="text-xs text-slate-500 ml-auto">
                ({category.productCount})
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price range filter */}
      <FilterSection
        title="Price Range"
        isExpanded={expandedSections.includes('price')}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs text-slate-400 mb-1 block">Min</label>
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step={100}
                value={filters.priceRange[0]}
                onChange={(e) => handlePriceChange(0, parseInt(e.target.value))}
                className="w-full accent-accent-primary"
              />
              <span className="text-sm text-slate-300">
                ${(filters.priceRange[0] / 100).toFixed(2)}
              </span>
            </div>
            <span className="text-slate-500">-</span>
            <div className="flex-1">
              <label className="text-xs text-slate-400 mb-1 block">Max</label>
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step={100}
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceChange(1, parseInt(e.target.value))}
                className="w-full accent-accent-primary"
              />
              <span className="text-sm text-slate-300">
                ${(filters.priceRange[1] / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Rating filter */}
      <FilterSection
        title="Rating"
        isExpanded={expandedSections.includes('rating')}
        onToggle={() => toggleSection('rating')}
      >
        <div className="flex gap-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className={cn(
                'flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-all',
                filters.minRating === rating
                  ? 'neo-pressed bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                  : 'neo-raised-sm hover:neo-glow-hover text-slate-300 hover:text-slate-100'
              )}
            >
              <Star className="h-4 w-4 fill-current" />
              <span>{rating}+</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* In stock toggle */}
      <div>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-slate-300">In Stock Only</span>
          <button
            onClick={handleInStockToggle}
            className={cn(
              'relative w-12 h-6 rounded-full transition-colors',
              filters.inStockOnly ? 'bg-accent-primary' : 'bg-surface-overlay'
            )}
            role="switch"
            aria-checked={filters.inStockOnly}
          >
            <span
              className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                filters.inStockOnly ? 'translate-x-7' : 'translate-x-1'
              )}
            />
          </button>
        </label>
      </div>

      {/* Clear all */}
      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearAllFilters} className="w-full">
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="neo-card p-6 sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-100">Filters</h2>
            {activeFilterCount > 0 && (
              <Badge variant="default">{activeFilterCount}</Badge>
            )}
          </div>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-80 max-w-full bg-surface-base z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-100">Filters</h2>
                  <Button variant="ghost" size="icon" onClick={onMobileClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <FilterContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile filter button */}
      <Button
        variant="outline"
        className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30 neo-raised-lg"
        onClick={() => {}}
      >
        <SlidersHorizontal className="h-4 w-4 mr-2" />
        Filters
        {activeFilterCount > 0 && (
          <Badge variant="default" className="ml-2">{activeFilterCount}</Badge>
        )}
      </Button>
    </>
  )
}

interface FilterSectionProps {
  title: string
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function FilterSection({ title, isExpanded, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border-b border-border-subtle pb-4 last:border-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <span className="text-sm font-medium text-slate-100">{title}</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ActiveFilterChips({
  filters,
  categories,
  onRemove,
  onClearAll,
}: {
  filters: ActiveFilters
  categories: CategoryWithCount[]
  onRemove: (type: string, value?: string) => void
  onClearAll: () => void
}) {
  const chips: { label: string; type: string; value?: string }[] = []

  filters.categories.forEach((slug) => {
    const category = categories.find((c) => c.slug === slug)
    if (category) {
      chips.push({ label: category.name, type: 'category', value: slug })
    }
  })

  if (filters.minRating > 0) {
    chips.push({ label: `${filters.minRating}+ Stars`, type: 'rating' })
  }

  if (filters.inStockOnly) {
    chips.push({ label: 'In Stock', type: 'inStock' })
  }

  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) {
    chips.push({
      label: `$${(filters.priceRange[0] / 100).toFixed(0)} - $${(filters.priceRange[1] / 100).toFixed(0)}`,
      type: 'price',
    })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {chips.map((chip) => (
        <Badge
          key={`${chip.type}-${chip.value || ''}`}
          variant="secondary"
          className="pl-2 pr-1 py-1 flex items-center gap-2"
        >
          <span>{chip.label}</span>
          <button
            onClick={() => onRemove(chip.type, chip.value)}
            className="ml-1 p-0.5 rounded hover:bg-surface-overlay transition-colors"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <button
        onClick={onClearAll}
        className="text-sm text-slate-400 hover:text-slate-100 transition-colors underline"
      >
        Clear all
      </button>
    </div>
  )
}
