'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Search, Sparkles, ArrowRight, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NoResultsProps {
  query: string
  suggestions?: string[]
  onSuggestionClick?: (suggestion: string) => void
  onClearFilters?: () => void
}

const COMMON_CATEGORIES = [
  { label: 'Electronics', slug: 'electronics' },
  { label: 'Clothing', slug: 'clothing' },
  { label: 'Home & Garden', slug: 'home-garden' },
  { label: 'Sports', slug: 'sports' },
  { label: 'Books', slug: 'books' },
  { label: 'Toys', slug: 'toys' },
]

const SEARCH_TIPS = [
  'Check for typos or spelling errors',
  'Try using fewer or different keywords',
  'Try more general search terms',
  'Remove filters to broaden your search',
]

function generateSuggestions(query: string): string[] {
  const words = query.toLowerCase().trim().split(/\s+/)
  const suggestions: string[] = []

  const commonTerms = [
    'laptop',
    'phone',
    'headphones',
    'camera',
    'watch',
    'tablet',
    'keyboard',
    'mouse',
    'monitor',
    'speaker',
    'charger',
    'case',
    'shirt',
    'shoes',
    'jacket',
    'pants',
    'dress',
    'bag',
    'desk',
    'chair',
    'lamp',
    'plant',
    'book',
    'game',
  ]

  for (const word of words) {
    for (const term of commonTerms) {
      if (term.startsWith(word.slice(0, 3)) && !suggestions.includes(term)) {
        suggestions.push(term)
        if (suggestions.length >= 5) break
      }
    }
    if (suggestions.length >= 5) break
  }

  if (suggestions.length < 3) {
    const fallbacks = ['laptop', 'headphones', 'smartphone', 'camera', 'watch']
    for (const fb of fallbacks) {
      if (!suggestions.includes(fb)) {
        suggestions.push(fb)
        if (suggestions.length >= 5) break
      }
    }
  }

  return suggestions.slice(0, 5)
}

export function NoResults({
  query,
  suggestions: providedSuggestions = [],
  onSuggestionClick,
  onClearFilters,
}: NoResultsProps) {
  const suggestions = useMemo(
    () => (providedSuggestions.length > 0 ? providedSuggestions : generateSuggestions(query)),
    [providedSuggestions, query],
  )

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="space-y-8"
    >
      {/* Main no results card */}
      <div className="neo-card p-12 text-center">
        <div className="neo-raised mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-surface-elevated">
          <Search className="h-12 w-12 text-slate-400" />
        </div>

        <h2 className="mb-2 text-2xl font-semibold text-slate-100">No results found</h2>
        <p className="mx-auto max-w-md text-slate-400">
          We couldn&apos;t find any products matching{' '}
          <span className="font-medium text-slate-200">&quot;{query}&quot;</span>
        </p>

        {/* Clear filters button */}
        {onClearFilters && (
          <div className="mt-6">
            <Button variant="outline" onClick={onClearFilters}>
              <XCircle className="mr-2 h-4 w-4" />
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      {/* Did you mean? suggestions */}
      {suggestions.length > 0 && (
        <div className="neo-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent-primary" />
            <h3 className="text-lg font-semibold text-slate-100">Did you mean?</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="neo-raised-sm rounded-lg px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-surface-elevated hover:text-accent-primary"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search tips */}
      <div className="neo-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-100">Search tips</h3>
        <ul className="space-y-3">
          {SEARCH_TIPS.map((tip, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
              <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-primary" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Popular categories */}
      <div className="neo-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-100">Browse categories</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {COMMON_CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/shop?category=${category.slug}`}
              className="neo-raised-sm rounded-lg px-4 py-3 text-center text-sm text-slate-200 transition-colors hover:bg-surface-elevated hover:text-accent-primary"
            >
              {category.label}
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
