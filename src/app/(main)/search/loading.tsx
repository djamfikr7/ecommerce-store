import { motion } from 'framer-motion'
import { SkeletonBase, ProductGridSkeleton } from '@/components/ui/skeleton-loaders'

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Search bar skeleton */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="neo-card mb-8 p-6"
        >
          <div className="flex items-center gap-4">
            <SkeletonBase className="h-5 w-5" />
            <SkeletonBase className="h-12 flex-1 rounded-xl" />
            <SkeletonBase className="h-12 w-28 rounded-xl" />
          </div>
        </motion.div>

        {/* Filters skeleton */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-wrap items-center gap-3"
        >
          <SkeletonBase className="h-9 w-24 rounded-lg" />
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBase key={i} className="h-9 w-28 rounded-lg" />
          ))}
        </motion.div>

        {/* Results info skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-6 flex items-center justify-between"
        >
          <SkeletonBase className="h-4 w-48" />
          <div className="flex items-center gap-2">
            <SkeletonBase className="h-4 w-16" />
            <SkeletonBase className="h-10 w-36 rounded-lg" />
          </div>
        </motion.div>

        {/* Results grid skeleton */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <ProductGridSkeleton count={12} />
        </motion.div>

        {/* Pagination skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex items-center justify-center gap-2"
        >
          <SkeletonBase className="h-10 w-24 rounded-xl" />
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBase key={i} className="h-10 w-10 rounded-xl" />
            ))}
          </div>
          <SkeletonBase className="h-10 w-24 rounded-xl" />
        </motion.div>
      </div>
    </div>
  )
}
