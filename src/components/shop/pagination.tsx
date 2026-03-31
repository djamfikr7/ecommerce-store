'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  pageSize?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 20,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems || 0)

  return (
    <div className="space-y-4">
      {/* Result count */}
      {totalItems !== undefined && (
        <div className="text-center text-sm text-slate-400">
          Showing {startItem} - {endItem} of {totalItems} products
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center justify-center gap-2">
        {/* First page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          aria-label="First page"
          className="hidden sm:flex"
        >
          <ChevronFirst className="h-4 w-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            page === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className="flex h-10 w-10 items-center justify-center text-slate-500"
              >
                ...
              </span>
            ) : (
              <motion.div key={page} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className={cn('h-10 w-10 rounded-xl', currentPage === page && 'neo-glow')}
                >
                  {page}
                </Button>
              </motion.div>
            ),
          )}
        </div>

        {/* Next page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          aria-label="Last page"
          className="hidden sm:flex"
        >
          <ChevronLast className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Load more button component
interface LoadMoreProps {
  currentPage: number
  totalPages: number
  onLoadMore: () => void
  isLoading?: boolean
}

export function LoadMore({
  currentPage,
  totalPages,
  onLoadMore,
  isLoading = false,
}: LoadMoreProps) {
  if (currentPage >= totalPages) return null

  return (
    <div className="flex justify-center pt-8">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          size="lg"
          onClick={onLoadMore}
          loading={isLoading}
          className="rounded-xl px-8"
        >
          {isLoading ? 'Loading...' : 'Load More Products'}
        </Button>
      </motion.div>
    </div>
  )
}
