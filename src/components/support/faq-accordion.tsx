'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface FAQItem {
  id: string
  question: string
  answer: string
}

interface FAQCategory {
  name: string
  icon: React.ReactNode
  items: FAQItem[]
}

interface FaqAccordionProps {
  categories: FAQCategory[]
}

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="neo-card overflow-hidden">
      <button
        onClick={onToggle}
        className="hover:bg-surface-elevated/50 flex w-full items-center justify-between px-6 py-4 text-left transition-colors"
        aria-expanded={isOpen}
      >
        <span className="pr-4 font-medium text-slate-100">{item.question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-slate-400"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
            className="overflow-hidden"
          >
            <div className="border-border-subtle border-t px-6 py-4 text-sm leading-relaxed text-slate-400">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FaqAccordion({ categories }: FaqAccordionProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(categories[0]?.name ?? null)
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.question.toLowerCase().includes(search.toLowerCase()) ||
          item.answer.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.items.length > 0)

  const displayedCategories = search
    ? filteredCategories
    : filteredCategories.filter((cat) => cat.name === activeCategory)

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <Input
          type="search"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="neo-pressed h-12 pl-12"
        />
      </div>

      {/* Category Tabs */}
      {!search && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                activeCategory === cat.name
                  ? 'neo-raised-sm bg-accent-primary/20 text-accent-primary'
                  : 'neo-flat text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.icon}
              {cat.name}
              <Badge variant="secondary" className="ml-1">
                {cat.items.length}
              </Badge>
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {search && (
        <p className="text-sm text-slate-400">
          Found {filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0)} results for
          &ldquo;{search}&rdquo;
        </p>
      )}

      {/* FAQ Lists */}
      <div className="space-y-8">
        {displayedCategories.map((cat) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {search && (
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-200">
                {cat.icon}
                {cat.name}
              </h3>
            )}
            <div className="space-y-3">
              {cat.items.map((item) => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  isOpen={openItems.has(item.id)}
                  onToggle={() => toggleItem(item.id)}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {displayedCategories.length === 0 && (
        <div className="neo-card py-12 text-center">
          <p className="text-slate-400">No questions found matching your search.</p>
        </div>
      )}
    </div>
  )
}
