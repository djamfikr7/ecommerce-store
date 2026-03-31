'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  SlidersHorizontal,
  Star,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { CategoryWithCount } from '@/types/products'

export interface ShopFilters {
  categories: string[]
  priceRange: [number, number]
  minRating: number
  inStockOnly: boolean
  brands: string[]
}

interface ShopFiltersProps {
  filters: ShopFilters
  onFilterChange: (filters: ShopFilters) => void
  categories: CategoryWithCount[]
  brands?: string[]
  priceBounds?: { min: number; max: number }
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function ShopFilters({
  filters,
  onFilterChange,
  categories,
  brands = [],
  priceBounds = { min: 0, max: 100000 },
  isMobileOpen = false,
  onMobileClose,
}: ShopFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'category',
    'price',
    'rating',
    'brand',
  ])
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section],
    )
  }

  const toggleCategoryExpand = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
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

  const handleBrandChange = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand]
    onFilterChange({ ...filters, brands: newBrands })
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
      brands: [],
    })
  }

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.minRating > 0 ||
    filters.inStockOnly ||
    filters.brands.length > 0 ||
    filters.priceRange[0] > priceBounds.min ||
    filters.priceRange[1] < priceBounds.max

  const activeFilterCount =
    filters.categories.length +
    filters.brands.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.priceRange[0] > priceBounds.min || filters.priceRange[1] < priceBounds.max ? 1 : 0)

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category tree filter */}
      <FilterSection
        title="Category"
        badge={filters.categories.length > 0 ? filters.categories.length : undefined}
        isExpanded={expandedSections.includes('category')}
        onToggle={() => toggleSection('category')}
      >
        <div className="space-y-1">
          {categories.map((category) => (
            <CategoryTreeItem
              key={category.id}
              category={category}
              selectedCategories={filters.categories}
              expandedCategories={expandedCategories}
              onCategorySelect={handleCategoryChange}
              onToggleExpand={toggleCategoryExpand}
            />
          ))}
        </div>
      </FilterSection>

      {/* Price range filter */}
      <FilterSection
        title="Price Range"
        badge={
          filters.priceRange[0] > priceBounds.min || filters.priceRange[1] < priceBounds.max
            ? 1
            : undefined
        }
        isExpanded={expandedSections.includes('price')}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-xs font-medium text-slate-400">Min Price</label>
              <div className="neo-pressed-sm rounded-lg p-3">
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  step={100}
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange(0, parseInt(e.target.value))}
                  className="h-2 w-full rounded-full accent-accent-primary"
                />
              </div>
              <span className="mt-1 block text-sm font-medium text-slate-100">
                ${(filters.priceRange[0] / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col items-center pt-6">
              <div className="h-px w-8 bg-slate-600" />
              <span className="my-1 text-xs text-slate-500">to</span>
              <div className="h-px w-8 bg-slate-600" />
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-xs font-medium text-slate-400">Max Price</label>
              <div className="neo-pressed-sm rounded-lg p-3">
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  step={100}
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange(1, parseInt(e.target.value))}
                  className="h-2 w-full rounded-full accent-accent-primary"
                />
              </div>
              <span className="mt-1 block text-sm font-medium text-slate-100">
                ${(filters.priceRange[1] / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Rating filter */}
      <FilterSection
        title="Rating"
        badge={filters.minRating > 0 ? 1 : undefined}
        isExpanded={expandedSections.includes('rating')}
        onToggle={() => toggleSection('rating')}
      >
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className={cn(
                'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all duration-200',
                filters.minRating === rating
                  ? 'neo-pressed bg-accent-primary/20 border-accent-primary/30 border text-accent-primary'
                  : 'neo-raised-sm hover:neo-glow-hover text-slate-300 hover:text-slate-100',
              )}
            >
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'h-4 w-4',
                      star <= rating ? 'fill-accent-warning text-accent-warning' : 'text-slate-600',
                    )}
                  />
                ))}
              </div>
              <span className="text-slate-400">& Up</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Brand filter */}
      {brands.length > 0 && (
        <FilterSection
          title="Brand"
          badge={filters.brands.length > 0 ? filters.brands.length : undefined}
          isExpanded={expandedSections.includes('brand')}
          onToggle={() => toggleSection('brand')}
        >
          <div className="max-h-48 space-y-2 overflow-y-auto pr-2">
            {brands.map((brand) => (
              <label key={brand} className="group flex cursor-pointer items-center gap-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                    className="peer sr-only"
                  />
                  <div className="neo-pressed-sm border-border-default peer-checked:bg-accent-primary/20 h-5 w-5 rounded border transition-colors peer-checked:border-accent-primary">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity peer-checked:opacity-100">
                      <svg className="h-3 w-3 text-accent-primary" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6l3 3 5-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-slate-300 transition-colors group-hover:text-slate-100">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* In stock toggle */}
      <div className="border-border-subtle border-t pt-2">
        <label className="flex cursor-pointer items-center justify-between">
          <span className="text-sm font-medium text-slate-300">In Stock Only</span>
          <button
            onClick={handleInStockToggle}
            className={cn(
              'relative h-6 w-12 rounded-full transition-all duration-200',
              filters.inStockOnly
                ? 'neo-glow bg-accent-primary'
                : 'neo-pressed-sm bg-surface-overlay',
            )}
            role="switch"
            aria-checked={filters.inStockOnly}
          >
            <span
              className={cn(
                'absolute top-1 h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200',
                filters.inStockOnly ? 'translate-x-7' : 'translate-x-1',
              )}
            />
          </button>
        </label>
      </div>

      {/* Clear all */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          onClick={clearAllFilters}
          className="hover:bg-accent-danger/10 w-full text-accent-danger hover:text-accent-danger"
        >
          <X className="mr-2 h-4 w-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-72 flex-shrink-0 lg:block">
        <div className="neo-card sticky top-24 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-accent-primary" />
              <h2 className="text-lg font-semibold text-slate-100">Filters</h2>
            </div>
            {activeFilterCount > 0 && <Badge variant="default">{activeFilterCount}</Badge>}
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
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={onMobileClose}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-full overflow-y-auto bg-surface-base lg:hidden"
            >
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-accent-primary" />
                    <h2 className="text-lg font-semibold text-slate-100">Filters</h2>
                  </div>
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
    </>
  )
}

// Category tree item component
interface CategoryTreeItemProps {
  category: CategoryWithCount
  selectedCategories: string[]
  expandedCategories: string[]
  onCategorySelect: (slug: string) => void
  onToggleExpand: (id: string) => void
  depth?: number
}

function CategoryTreeItem({
  category,
  selectedCategories,
  expandedCategories,
  onCategorySelect,
  onToggleExpand,
  depth = 0,
}: CategoryTreeItemProps) {
  const hasChildren = category.children && category.children.length > 0
  const isExpanded = expandedCategories.includes(category.id)
  const isSelected = selectedCategories.includes(category.slug)

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg px-2 py-2 transition-all duration-150',
          'hover:bg-surface-elevated',
          isSelected && 'bg-accent-primary/10',
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => onToggleExpand(category.id)}
            className="rounded p-0.5 transition-colors hover:bg-surface-overlay"
          >
            <ChevronRight
              className={cn(
                'h-4 w-4 text-slate-400 transition-transform duration-200',
                isExpanded && 'rotate-90',
              )}
            />
          </button>
        ) : (
          <div className="w-5" />
        )}

        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
          <div className="relative flex-shrink-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onCategorySelect(category.slug)}
              className="peer sr-only"
            />
            <div className="neo-pressed-sm border-border-default peer-checked:bg-accent-primary/20 h-4 w-4 rounded border transition-colors peer-checked:border-accent-primary">
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity peer-checked:opacity-100">
                <svg className="h-2.5 w-2.5 text-accent-primary" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l3 3 5-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
          <span
            className={cn(
              'truncate text-sm transition-colors',
              isSelected
                ? 'font-medium text-accent-primary'
                : 'text-slate-300 hover:text-slate-100',
            )}
          >
            {category.name}
          </span>
          <span className="ml-auto flex-shrink-0 text-xs text-slate-500">
            ({category.productCount})
          </span>
        </label>
      </div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {category.children!.map((child) => (
              <CategoryTreeItem
                key={child.id}
                category={child}
                selectedCategories={selectedCategories}
                expandedCategories={expandedCategories}
                onCategorySelect={onCategorySelect}
                onToggleExpand={onToggleExpand}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Filter section component
interface FilterSectionProps {
  title: string
  badge?: number | undefined
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function FilterSection({ title, badge, isExpanded, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border-border-subtle border-b pb-4 last:border-0">
      <button
        onClick={onToggle}
        className="group mb-3 flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-100 transition-colors group-hover:text-accent-primary">
            {title}
          </span>
          {badge !== undefined && badge > 0 && (
            <Badge variant="default" className="px-1.5 py-0 text-xs">
              {badge}
            </Badge>
          )}
        </div>
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
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Active filter chips component
interface ActiveFilterChipsProps {
  filters: ShopFilters
  categories: CategoryWithCount[]
  onRemove: (type: string, value?: string) => void
  onClearAll: () => void
}

export function ActiveFilterChips({
  filters,
  categories,
  onRemove,
  onClearAll,
}: ActiveFilterChipsProps) {
  const chips: { label: string; type: string; value?: string }[] = []

  // Collect all category names from slugs
  const findCategoryName = (cats: CategoryWithCount[], slug: string): string | undefined => {
    for (const cat of cats) {
      if (cat.slug === slug) return cat.name
      if (cat.children) {
        const found = findCategoryName(cat.children, slug)
        if (found) return found
      }
    }
    return undefined
  }

  filters.categories.forEach((slug) => {
    const categoryName = findCategoryName(categories, slug)
    if (categoryName) {
      chips.push({ label: categoryName, type: 'category', value: slug })
    }
  })

  if (filters.minRating > 0) {
    chips.push({ label: `${filters.minRating}+ Stars`, type: 'rating' })
  }

  if (filters.inStockOnly) {
    chips.push({ label: 'In Stock', type: 'inStock' })
  }

  filters.brands.forEach((brand) => {
    chips.push({ label: brand, type: 'brand', value: brand })
  })

  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) {
    chips.push({
      label: `$${(filters.priceRange[0] / 100).toFixed(0)} - $${(filters.priceRange[1] / 100).toFixed(0)}`,
      type: 'price',
    })
  }

  if (chips.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-wrap gap-2"
    >
      {chips.map((chip) => (
        <motion.div
          key={`${chip.type}-${chip.value || ''}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <Badge
            variant="secondary"
            className="flex items-center gap-2 rounded-xl py-1.5 pl-3 pr-1"
          >
            <span className="text-sm">{chip.label}</span>
            <button
              onClick={() => onRemove(chip.type, chip.value)}
              className="ml-1 rounded-lg p-1 transition-colors hover:bg-surface-overlay"
              aria-label={`Remove ${chip.label} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </motion.div>
      ))}
      <button
        onClick={onClearAll}
        className="text-sm text-slate-400 underline underline-offset-2 transition-colors hover:text-accent-danger"
      >
        Clear all
      </button>
    </motion.div>
  )
}

// Mobile filter button
interface MobileFilterButtonProps {
  activeFilterCount: number
  onClick: () => void
}

export function MobileFilterButton({ activeFilterCount, onClick }: MobileFilterButtonProps) {
  return (
    <Button
      variant="outline"
      className="neo-raised-lg fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-2xl px-6 lg:hidden"
      onClick={onClick}
    >
      <SlidersHorizontal className="mr-2 h-4 w-4" />
      Filters
      {activeFilterCount > 0 && (
        <Badge variant="default" className="ml-2">
          {activeFilterCount}
        </Badge>
      )}
    </Button>
  )
}
