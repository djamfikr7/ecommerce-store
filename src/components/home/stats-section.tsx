'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Package, Users, Star, Award } from 'lucide-react'

interface StoreStats {
  productCount: number
  customerCount: number
  reviewCount: number
  averageRating: number
}

interface StatsSectionProps {
  stats: StoreStats
}

function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${(num / 1000).toFixed(0)}K+`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K+`
  }
  return num.toString()
}

const statItems = [
  {
    key: 'products',
    icon: Package,
    color: 'from-accent-primary to-indigo-400',
    bgColor: 'bg-accent-primary/15',
    iconColor: 'text-accent-primary',
    label: 'Products',
    getValue: (stats: StoreStats) => formatNumber(stats.productCount),
  },
  {
    key: 'customers',
    icon: Users,
    color: 'from-accent-secondary to-purple-400',
    bgColor: 'bg-accent-secondary/15',
    iconColor: 'text-accent-secondary',
    label: 'Happy Customers',
    getValue: (stats: StoreStats) => formatNumber(stats.customerCount),
  },
  {
    key: 'reviews',
    icon: Star,
    color: 'from-accent-warning to-amber-400',
    bgColor: 'bg-accent-warning/15',
    iconColor: 'text-accent-warning',
    label: 'Reviews',
    getValue: (stats: StoreStats) => formatNumber(stats.reviewCount),
  },
  {
    key: 'rating',
    icon: Award,
    color: 'from-accent-success to-emerald-400',
    bgColor: 'bg-accent-success/15',
    iconColor: 'text-accent-success',
    label: 'Avg Rating',
    getValue: (stats: StoreStats) => stats.averageRating.toFixed(1),
  },
]

export function StatsSection({ stats }: StatsSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-16 md:py-24">
      <div className="container-neo">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4"
        >
          {statItems.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="neo-card group relative overflow-hidden p-6 text-center md:p-8"
            >
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div
                  className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${item.color} opacity-20 blur-2xl`}
                />
              </div>

              <div className="relative space-y-3">
                <div
                  className={`neo-raised-sm inline-flex h-14 w-14 items-center justify-center rounded-2xl ${item.bgColor}`}
                >
                  <item.icon className={`h-7 w-7 ${item.iconColor}`} />
                </div>

                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2, type: 'spring' }}
                  className={`bg-gradient-to-r ${item.color} bg-clip-text text-4xl font-bold text-transparent md:text-5xl`}
                >
                  {item.getValue(stats)}
                </motion.div>

                <p className="text-sm font-medium text-slate-400 md:text-base">{item.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
