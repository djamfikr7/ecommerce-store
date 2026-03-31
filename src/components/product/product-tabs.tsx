'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, FileText, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductTabsProps {
  description?: string | null
  specifications?: Record<string, string | number>
  reviewCount?: number
  reviewAverage?: number
}

export function ProductTabs({
  description,
  specifications,
  reviewCount = 0,
  reviewAverage,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>(
    'description',
  )

  const tabs = [
    {
      id: 'description' as const,
      label: 'Description',
      icon: FileText,
      count: null,
    },
    {
      id: 'specifications' as const,
      label: 'Specifications',
      icon: ClipboardList,
      count: specifications ? Object.keys(specifications).length : null,
    },
    {
      id: 'reviews' as const,
      label: 'Reviews',
      icon: MessageSquare,
      count: reviewCount,
    },
  ]

  return (
    <div className="neo-card">
      {/* Tab buttons */}
      <div className="border-border-subtle flex border-b" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors',
              'relative focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary',
              activeTab === tab.id ? 'text-accent-primary' : 'text-slate-400 hover:text-slate-300',
            )}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span
                className={cn(
                  'ml-1 rounded-full px-2 py-0.5 text-xs',
                  activeTab === tab.id
                    ? 'bg-accent-primary/20 text-accent-primary'
                    : 'bg-surface-elevated text-slate-400',
                )}
              >
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="p-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === 'description' && <DescriptionPanel description={description} />}

          {activeTab === 'specifications' && (
            <SpecificationsPanel specifications={specifications} />
          )}

          {activeTab === 'reviews' && (
            <ReviewsPanel reviewCount={reviewCount} reviewAverage={reviewAverage} />
          )}
        </motion.div>
      </div>
    </div>
  )
}

function DescriptionPanel({ description }: { description?: string | null }) {
  if (!description) {
    return (
      <div className="py-8 text-center text-slate-400">
        No description available for this product.
      </div>
    )
  }

  const formattedDescription = description.split('\n').map((line, i) => {
    if (line.startsWith('### ')) {
      return (
        <h4 key={i} className="mb-3 mt-6 text-lg font-semibold text-slate-100 first:mt-0">
          {line.replace('### ', '')}
        </h4>
      )
    }
    if (line.startsWith('## ')) {
      return (
        <h3 key={i} className="mb-4 mt-8 text-xl font-semibold text-slate-100 first:mt-0">
          {line.replace('## ', '')}
        </h3>
      )
    }
    if (line.startsWith('# ')) {
      return (
        <h2 key={i} className="mb-4 mt-8 text-2xl font-bold text-slate-100 first:mt-0">
          {line.replace('# ', '')}
        </h2>
      )
    }
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    return (
      <p key={i} className="mb-4 leading-relaxed text-slate-300">
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={j} className="font-semibold text-slate-100">
                {part.replace(/\*\*/g, '')}
              </strong>
            )
          }
          return part
        })}
      </p>
    )
  })

  return <div className="prose prose-invert max-w-none">{formattedDescription}</div>
}

function SpecificationsPanel({
  specifications,
}: {
  specifications?: Record<string, string | number>
}) {
  if (!specifications || Object.keys(specifications).length === 0) {
    return (
      <div className="py-8 text-center text-slate-400">
        No specifications available for this product.
      </div>
    )
  }

  const entries = Object.entries(specifications)

  return (
    <table className="w-full">
      <tbody>
        {entries.map(([key, value], index) => (
          <motion.tr
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={index !== entries.length - 1 ? 'border-border-subtle border-b' : ''}
          >
            <td className="w-1/3 py-4 pr-4 text-sm text-slate-400">{key}</td>
            <td className="py-4 text-sm font-medium text-slate-100">{value}</td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  )
}

function ReviewsPanel({
  reviewCount,
  reviewAverage,
}: {
  reviewCount: number
  reviewAverage?: number
}) {
  return (
    <div className="py-8 text-center">
      {reviewCount === 0 ? (
        <div className="space-y-4">
          <p className="text-slate-400">No reviews yet for this product.</p>
          <a
            href="#reviews"
            className="inline-flex items-center gap-2 text-accent-primary transition-colors hover:text-accent-primary-hover"
          >
            Be the first to write a review
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <div className="text-4xl font-bold text-slate-100">{reviewAverage?.toFixed(1)}</div>
            <div className="text-left">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(reviewAverage || 0)
                        ? 'fill-accent-warning text-accent-warning'
                        : 'text-slate-600'
                    }`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="mt-1 text-sm text-slate-400">{reviewCount} reviews</p>
            </div>
          </div>
          <a
            href="#reviews"
            className="mt-4 inline-block text-accent-primary transition-colors hover:text-accent-primary-hover"
          >
            Read all reviews
          </a>
        </div>
      )}
    </div>
  )
}
