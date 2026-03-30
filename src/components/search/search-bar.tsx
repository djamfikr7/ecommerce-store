'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ArrowRight, Clock, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PriceDisplay } from '@/components/product/price-display'
import { searchProductsAutocomplete, getPopularSearches } from '@/lib/actions/search'
import type { ProductSearchResult } from '@/types/products'

interface SearchBarProps {
  onSearch?: (query: string) => void
  className?: string
  placeholder?: string
  autoFocus?: boolean
}

export function SearchBar({
  onSearch,
  className,
  placeholder = 'Search products...',
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<ProductSearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [popularSearches, setPopularSearches] = useState<string[]>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const router = useRouter()

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches')
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored))
      } catch {
        setRecentSearches([])
      }
    }

    // Load popular searches
    getPopularSearches(5)
      .then(setPopularSearches)
      .catch(() => {
        setPopularSearches([])
      })
  }, [])

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const products = await searchProductsAutocomplete(searchQuery, 5)
      setResults(products)
    } catch {
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, performSearch])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = results.length + (query.trim() ? 1 : 0) // +1 for "View all results"

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % totalItems)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex === -1 || selectedIndex === results.length) {
          handleSearch()
        } else {
          const product = results[selectedIndex]
          if (product) {
            router.push(`/products/${product.slug}`)
            setIsOpen(false)
          }
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  const handleSearch = () => {
    if (query.trim()) {
      addRecentSearch(query)
      if (onSearch) {
        onSearch(query)
      } else {
        router.push(`/search?q=${encodeURIComponent(query)}`)
      }
      setIsOpen(false)
    }
  }

  const handleViewAllResults = () => {
    if (query.trim()) {
      addRecentSearch(query)
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setIsOpen(false)
    }
  }

  const addRecentSearch = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  const handleRecentSearchClick = (search: string) => {
    setQuery(search)
    setIsOpen(true)
    inputRef.current?.focus()
  }

  const showDropdown =
    isOpen && (query.length > 0 || recentSearches.length > 0 || popularSearches.length > 0)

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'neo-inset w-full rounded-lg py-2.5 pl-10 pr-10',
            'text-sm text-slate-100 placeholder:text-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-accent-primary',
            'transition-all duration-200',
          )}
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-controls="search-results"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 transition-colors hover:text-slate-100"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="neo-card absolute left-0 right-0 z-50 mt-2 max-h-[500px] overflow-hidden overflow-y-auto"
            id="search-results"
            role="listbox"
          >
            {/* Loading state */}
            {isLoading && (
              <div className="p-4 text-center">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
              </div>
            )}

            {/* Results */}
            {!isLoading && query && results.length > 0 && (
              <div className="py-2">
                {results.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => {
                      addRecentSearch(query)
                      setIsOpen(false)
                    }}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 transition-colors',
                      index === selectedIndex
                        ? 'bg-accent-primary/20 text-accent-primary'
                        : 'hover:bg-surface-elevated',
                    )}
                    role="option"
                    aria-selected={index === selectedIndex}
                  >
                    <div className="neo-raised-sm relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-surface-overlay">
                          <Search className="h-5 w-5 text-slate-600" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-100">{product.name}</p>
                      <PriceDisplay amount={product.price} className="text-xs" />
                    </div>
                  </Link>
                ))}

                {/* View all results */}
                <button
                  onClick={handleViewAllResults}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium',
                    'border-border-subtle mt-2 border-t',
                    selectedIndex === results.length
                      ? 'text-accent-primary'
                      : 'text-slate-300 hover:text-slate-100',
                    'transition-colors',
                  )}
                >
                  View all results for "{query}"
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* No results */}
            {!isLoading && query && results.length === 0 && (
              <div className="p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated">
                  <Search className="h-6 w-6 text-slate-500" />
                </div>
                <p className="mb-1 text-sm text-slate-400">No products found</p>
                <p className="text-xs text-slate-500">Try different keywords</p>
              </div>
            )}

            {/* Recent searches (when query is empty) */}
            {!query && recentSearches.length > 0 && (
              <div className="py-2">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Recent Searches
                  </span>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-slate-400 transition-colors hover:text-slate-100"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => handleRecentSearchClick(search)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-300 transition-colors hover:bg-surface-elevated"
                  >
                    <Clock className="h-4 w-4 flex-shrink-0 text-slate-500" />
                    <span className="flex-1 truncate">{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Popular searches (when query is empty and no recent searches) */}
            {!query && recentSearches.length === 0 && popularSearches.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Popular Searches
                  </span>
                </div>
                {popularSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => handleRecentSearchClick(search)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-300 transition-colors hover:bg-surface-elevated"
                  >
                    <TrendingUp className="h-4 w-4 flex-shrink-0 text-slate-500" />
                    <span className="flex-1 truncate">{search}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
