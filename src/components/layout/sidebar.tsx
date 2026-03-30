'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Sidebar({ open, onClose, title, children }: SidebarProps) {
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: open ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw]',
          'neo-card overflow-y-auto',
          'transition-shadow duration-200',
          open && 'neo-glow',
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Sidebar'}
        aria-hidden={!open}
      >
        <div className="border-border-subtle flex items-center justify-between border-b p-4">
          {title && <h2 className="font-semibold text-slate-100">{title}</h2>}
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </motion.aside>
    </>
  )
}

export interface CategoryItem {
  slug: string
  name: string
  count?: number
  children?: CategoryItem[]
}

interface CategorySidebarProps {
  open: boolean
  onClose: () => void
  categories: CategoryItem[]
  activeCategory?: string
}

export function CategorySidebar({
  open,
  onClose,
  categories,
  activeCategory,
}: CategorySidebarProps) {
  return (
    <Sidebar open={open} onClose={onClose} title="Categories">
      <nav aria-label="Product categories">
        <CategoryList
          categories={categories}
          activeCategory={activeCategory}
          onNavigate={onClose}
          depth={0}
        />
      </nav>
    </Sidebar>
  )
}

interface CategoryListProps {
  categories: CategoryItem[]
  activeCategory: string | undefined
  onNavigate: () => void
  depth: number
}

function CategoryList({ categories, activeCategory, onNavigate, depth }: CategoryListProps) {
  return (
    <ul
      className={cn('space-y-0.5', depth > 0 && 'mt-1 pl-3')}
      role={depth === 0 ? 'list' : 'group'}
    >
      {categories.map((cat) => (
        <CategoryNode
          key={cat.slug}
          category={cat}
          activeCategory={activeCategory}
          onNavigate={onNavigate}
          depth={depth}
        />
      ))}
    </ul>
  )
}

interface CategoryNodeProps {
  category: CategoryItem
  activeCategory: string | undefined
  onNavigate: () => void
  depth: number
}

function CategoryNode({ category, activeCategory, onNavigate, depth }: CategoryNodeProps) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = category.children && category.children.length > 0
  const isActive = activeCategory === category.slug

  return (
    <li role="treeitem" aria-expanded={hasChildren ? expanded : undefined}>
      <div className="flex items-center">
        <Link
          href={`/categories/${category.slug}`}
          className={cn(
            'flex flex-1 items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
            isActive
              ? 'bg-accent-primary/20 font-medium text-accent-primary'
              : 'text-slate-300 hover:bg-surface-elevated hover:text-slate-100',
          )}
          onClick={onNavigate}
          aria-current={isActive ? 'page' : undefined}
        >
          <span className={cn(depth > 0 && 'pl-2')}>{category.name}</span>
          {category.count !== undefined && (
            <span className="ml-2 text-xs text-slate-500">{category.count}</span>
          )}
        </Link>

        {hasChildren && (
          <motion.button
            type="button"
            onClick={() => setExpanded(!expanded)}
            whileTap={{ scale: 0.9 }}
            className={cn(
              'ml-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md',
              'text-slate-400 transition-colors hover:bg-surface-elevated hover:text-slate-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary',
            )}
            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${category.name}`}
          >
            <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          </motion.button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
            className="overflow-hidden"
          >
            <div className="border-border-subtle ml-4 border-l">
              <CategoryList
                categories={category.children!}
                activeCategory={activeCategory}
                onNavigate={onNavigate}
                depth={depth + 1}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}
