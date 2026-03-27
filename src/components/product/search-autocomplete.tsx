'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ArrowRight, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PriceDisplay } from './price-display'
import type { ProductSearchResult } from '@/types/products'

interface SearchAutocompleteProps {
  onSearch?: (query: string) => void
  className?: string
}

export function SearchAutocomplete({ onSearch, className }: SearchAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<ProductSearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches')
    if (stored) {
      setRecentSearches(JSON.parse(stored))
    }
  }, [])

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      // TODO: Replace with actual API call to /api/products/search
      // For now, simulate search
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.products || [])
      }
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
    const totalItems = results.length + 1 // +1 for "View all results"

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
        if (selectedIndex === -1) {
          handleSearch()
        } else if (selectedIndex === results.length) {
          handleViewAllResults()
        } else {
          const product = results[selectedIndex]
          if (product) {
            window.location.href = `/products/${product.slug}`
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
      onSearch?.(query)
      setIsOpen(false)
    }
  }

  const handleViewAllResults = () => {
    if (query.trim()) {
      addRecentSearch(query)
      window.location.href = `/products?search=${encodeURIComponent(query)}`
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

  const showDropdown = isOpen && (query.length > 0 || recentSearches.length > 0)

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
          placeholder="Search products..."
          className={cn(
            'neo-inset w-full pl-10 pr-10 py-2.5 rounded-lg',
            'text-sm text-slate-100 placeholder:text-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-accent-primary'
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
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-100 transition-colors"
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
            className="absolute left-0 right-0 mt-2 neo-card overflow-hidden z-50"
            id="search-results"
            role="listbox"
          >
            {/* Loading state */}
            {isLoading && (
              <div className="p-4 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full mx-auto" />
              </div>
            )}

            {/* Results */}
            {!isLoading && query && results.length > 0 && (
              <div className="py-2 max-h-80 overflow-y-auto">
                {results.slice(0, 5).map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2 transition-colors',
                      index === selectedIndex
                        ? 'bg-accent-primary/20 text-accent-primary'
                        : 'hover:bg-surface-elevated'
                    )}
                    role="option"
                    aria-selected={index === selectedIndex}
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden neo-raised-sm flex-shrink-0">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-overlay" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-100 truncate">{product.name}</p>
                      <PriceDisplay amount={product.price} />
                    </div>
                  </Link>
                ))}

                {/* View all results */}
                <button
                  onClick={handleViewAllResults}
                  className={cn(
                    'w-full flex items-center gap-2 px-4 py-3 text-sm font-medium',
                    'border-t border-border-subtle mt-2',
                    selectedIndex === results.length
                      ? 'text-accent-primary'
                      : 'text-slate-300 hover:text-slate-100'
                  )}
                >
                  View all results for "{query}"
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* No results */}
            {!isLoading && query && results.length === 0 && (
              <div className="p-4 text-center text-slate-400">
                No products found for "{query}"
              </div>
            )}

            {/* Recent searches (when query is empty) */}
            {!query && recentSearches.length > 0 && (
              <div className="py-2">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-xs text-slate-400 uppercase tracking-wide">Recent Searches</span>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-slate-400 hover:text-slate-100 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={search}
                    onClick={() => {
                      setQuery(search)
                      inputRef.current?.focus()
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300',
                      'hover:bg-surface-elevated transition-colors'
                    )}
                  >
                    <Clock className="h-4 w-4 text-slate-500" />
                    {search}
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
