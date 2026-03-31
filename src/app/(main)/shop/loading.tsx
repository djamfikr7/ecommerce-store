import { motion } from 'framer-motion'
import { SkeletonBase, ProductGridSkeleton } from '@/components/ui/skeleton-loaders'

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header skeleton */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <SkeletonBase className="mb-2 h-10 w-48" />
          <SkeletonBase className="h-5 w-96" />
        </motion.div>

        {/* Search bar skeleton */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <SkeletonBase className="h-12 max-w-2xl rounded-xl" />
        </motion.div>

        {/* Toolbar skeleton */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <SkeletonBase className="h-10 w-24 rounded-lg lg:hidden" />
            <SkeletonBase className="h-4 w-32" />
          </div>
          <SkeletonBase className="h-10 w-36 rounded-lg" />
        </motion.div>

        {/* Active filters skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mb-6 flex flex-wrap gap-2"
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBase key={i} className="h-7 w-24 rounded-full" />
          ))}
        </motion.div>

        {/* Main content: sidebar + grid */}
        <div className="flex gap-8">
          {/* Filter sidebar skeleton */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="hidden w-72 shrink-0 space-y-6 lg:block"
          >
            <div className="neo-card space-y-6 rounded-xl p-6">
              {/* Categories filter */}
              <div className="space-y-3">
                <SkeletonBase className="h-5 w-24" />
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <SkeletonBase className="h-4 w-4 rounded" />
                    <SkeletonBase className="h-4 flex-1" />
                    <SkeletonBase className="h-3 w-6" />
                  </div>
                ))}
              </div>

              {/* Price range filter */}
              <div className="space-y-3">
                <SkeletonBase className="h-5 w-24" />
                <SkeletonBase className="h-2 w-full rounded-full" />
                <div className="flex items-center justify-between">
                  <SkeletonBase className="h-4 w-16" />
                  <SkeletonBase className="h-4 w-16" />
                </div>
              </div>

              {/* Rating filter */}
              <div className="space-y-3">
                <SkeletonBase className="h-5 w-20" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <SkeletonBase className="h-4 w-4 rounded" />
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <SkeletonBase key={j} className="h-4 w-4" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Stock filter */}
              <div className="flex items-center gap-3">
                <SkeletonBase className="h-5 w-9 rounded-full" />
                <SkeletonBase className="h-4 w-24" />
              </div>
            </div>
          </motion.aside>

          {/* Product grid skeleton */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="min-w-0 flex-1"
          >
            <ProductGridSkeleton count={12} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
