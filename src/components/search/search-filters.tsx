'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { SearchFilters } from '@/lib/actions/search'
import type { CategoryWithCount } from '@/types/products'

interface SearchFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  categories?: CategoryWithCount[]
  className?: string
}

export function SearchFiltersComponent({
  filters,
  onFiltersChange,
  categories = [],
  className,
}: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    rating: true,
    availability: true,
  })

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const handleResetFilters = () => {
    const resetFilters: SearchFilters = { sort: 'relevance' }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  const activeFilterCount = Object.keys(filters).filter(
    (key) => key !== 'sort' && filters[key as keyof SearchFilters] !== undefined,
  ).length

  return (
    <div className={cn('relative', className)}>
      {/* Mobile Filter Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="w-full justify-between lg:hidden"
      >
        <span className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-accent-primary px-2 py-0.5 text-xs text-white">
              {activeFilterCount}
            </span>
          )}
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {/* Desktop Filters - Always visible */}
      <div className="hidden lg:block">
        <FilterContent
          localFilters={localFilters}
          setLocalFilters={setLocalFilters}
          categories={categories}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
      </div>

      {/* Mobile Filters - Slide-in panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />

            {/* Filter Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-sm overflow-y-auto bg-surface-base lg:hidden"
            >
              <div className="border-border-subtle sticky top-0 flex items-center justify-between border-b bg-surface-base p-4">
                <h2 className="text-lg font-semibold text-slate-100">Filters</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 transition-colors hover:bg-surface-elevated"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4">
                <FilterContent
                  localFilters={localFilters}
                  setLocalFilters={setLocalFilters}
                  categories={categories}
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                  onApply={handleApplyFilters}
                  onReset={handleResetFilters}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

interface FilterContentProps {
  localFilters: SearchFilters
  setLocalFilters: (filters: SearchFilters) => void
  categories: CategoryWithCount[]
  expandedSections: Record<string, boolean>
  toggleSection: (section: string) => void
  onApply: () => void
  onReset: () => void
}

function FilterContent({
  localFilters,
  setLocalFilters,
  categories,
  expandedSections,
  toggleSection,
  onApply,
  onReset,
}: FilterContentProps) {
  return (
    <div className="space-y-6">
      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="neo-card p-4">
          <button
            onClick={() => toggleSection('category')}
            className="mb-3 flex w-full items-center justify-between"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-100">
              Category
            </h3>
            {expandedSections.category ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.category && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2"
              >
                <label className="group flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="category"
                    checked={!localFilters.category}
                    onChange={() => {
                      const { category, ...rest } = localFilters
                      setLocalFilters(rest)
                    }}
                    className="h-4 w-4 text-accent-primary focus:ring-accent-primary"
                  />
                  <span className="text-sm text-slate-300 transition-colors group-hover:text-slate-100">
                    All Categories
                  </span>
                </label>
                {categories.map((category) => (
                  <label key={category.id} className="group flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="category"
                      checked={localFilters.category === category.slug}
                      onChange={() => setLocalFilters({ ...localFilters, category: category.slug })}
                      className="h-4 w-4 text-accent-primary focus:ring-accent-primary"
                    />
                    <span className="flex-1 text-sm text-slate-300 transition-colors group-hover:text-slate-100">
                      {category.name}
                    </span>
                    <span className="text-xs text-slate-500">{category.productCount}</span>
                  </label>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Price Range Filter */}
      <div className="neo-card p-4">
        <button
          onClick={() => toggleSection('price')}
          className="mb-3 flex w-full items-center justify-between"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-100">
            Price Range
          </h3>
          {expandedSections.price ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>

        <AnimatePresence>
          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Min Price</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={localFilters.minPrice ?? ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setLocalFilters({ ...localFilters, minPrice: Number(e.target.value) })
                      } else {
                        const { minPrice, ...rest } = localFilters
                        setLocalFilters(rest)
                      }
                    }}
                    className="neo-inset w-full rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Max Price</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Any"
                    value={localFilters.maxPrice ?? ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setLocalFilters({ ...localFilters, maxPrice: Number(e.target.value) })
                      } else {
                        const { maxPrice, ...rest } = localFilters
                        setLocalFilters(rest)
                      }
                    }}
                    className="neo-inset w-full rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  />
                </div>
              </div>

              {/* Quick price ranges */}
              <div className="space-y-2">
                {[
                  { label: 'Under $50', max: 50 },
                  { label: '$50 - $100', min: 50, max: 100 },
                  { label: '$100 - $200', min: 100, max: 200 },
                  { label: '$200 - $500', min: 200, max: 500 },
                  { label: 'Over $500', min: 500 },
                ].map((range) => (
                  <button
                    key={range.label}
                    onClick={() => {
                      const newFilters = { ...localFilters }
                      if (range.min !== undefined) {
                        newFilters.minPrice = range.min
                      } else {
                        delete newFilters.minPrice
                      }
                      if (range.max !== undefined) {
                        newFilters.maxPrice = range.max
                      } else {
                        delete newFilters.maxPrice
                      }
                      setLocalFilters(newFilters)
                    }}
                    className={cn(
                      'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                      localFilters.minPrice === range.min && localFilters.maxPrice === range.max
                        ? 'bg-accent-primary/20 text-accent-primary'
                        : 'text-slate-300 hover:bg-surface-elevated',
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rating Filter */}
      <div className="neo-card p-4">
        <button
          onClick={() => toggleSection('rating')}
          className="mb-3 flex w-full items-center justify-between"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-100">Rating</h3>
          {expandedSections.rating ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>

        <AnimatePresence>
          {expandedSections.rating && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              {[4, 3, 2, 1].map((rating) => (
                <label key={rating} className="group flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="rating"
                    checked={localFilters.minRating === rating}
                    onChange={() => setLocalFilters({ ...localFilters, minRating: rating })}
                    className="h-4 w-4 text-accent-primary focus:ring-accent-primary"
                  />
                  <span className="flex items-center gap-1 text-sm text-slate-300 transition-colors group-hover:text-slate-100">
                    {rating}
                    <span className="text-yellow-400">★</span>
                    <span className="text-slate-500">& up</span>
                  </span>
                </label>
              ))}
              <label className="group flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="rating"
                  checked={!localFilters.minRating}
                  onChange={() => {
                    const { minRating, ...rest } = localFilters
                    setLocalFilters(rest)
                  }}
                  className="h-4 w-4 text-accent-primary focus:ring-accent-primary"
                />
                <span className="text-sm text-slate-300 transition-colors group-hover:text-slate-100">
                  All Ratings
                </span>
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Availability Filter */}
      <div className="neo-card p-4">
        <button
          onClick={() => toggleSection('availability')}
          className="mb-3 flex w-full items-center justify-between"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-100">
            Availability
          </h3>
          {expandedSections.availability ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>

        <AnimatePresence>
          {expandedSections.availability && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <label className="group flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={localFilters.inStock ?? false}
                  onChange={(e) => setLocalFilters({ ...localFilters, inStock: e.target.checked })}
                  className="h-4 w-4 rounded text-accent-primary focus:ring-accent-primary"
                />
                <span className="text-sm text-slate-300 transition-colors group-hover:text-slate-100">
                  In Stock Only
                </span>
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={onReset} variant="outline" className="flex-1">
          Reset
        </Button>
        <Button onClick={onApply} className="flex-1">
          Apply Filters
        </Button>
      </div>
    </div>
  )
}
