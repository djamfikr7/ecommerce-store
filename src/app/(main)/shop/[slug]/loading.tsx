import { motion } from 'framer-motion'
import { SkeletonBase, ProductCardSkeleton } from '@/components/ui/skeleton-loaders'

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb skeleton */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2 text-sm"
        >
          <SkeletonBase className="h-4 w-12" />
          <SkeletonBase className="h-3 w-3" />
          <SkeletonBase className="h-4 w-16" />
          <SkeletonBase className="h-3 w-3" />
          <SkeletonBase className="h-4 w-20" />
          <SkeletonBase className="h-3 w-3" />
          <SkeletonBase className="h-4 w-24" />
        </motion.nav>

        {/* Product main section */}
        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Gallery skeleton */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <SkeletonBase className="aspect-square w-full rounded-2xl" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBase key={i} className="h-20 w-20 shrink-0 rounded-xl" />
              ))}
            </div>
          </motion.div>

          {/* Product info skeleton */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <SkeletonBase className="h-4 w-24" />
              <SkeletonBase className="h-10 w-3/4" />
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonBase key={i} className="h-5 w-5" />
                  ))}
                </div>
                <SkeletonBase className="h-4 w-20" />
              </div>
            </div>

            <div className="space-y-2">
              <SkeletonBase className="h-8 w-32" />
              <SkeletonBase className="h-4 w-24" />
            </div>

            <div className="border-border-subtle border-t" />

            <div className="space-y-3">
              <SkeletonBase className="h-5 w-16" />
              <div className="flex gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonBase key={i} className="h-10 w-10 rounded-lg" />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <SkeletonBase className="h-5 w-20" />
              <div className="flex gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonBase key={i} className="h-10 w-16 rounded-lg" />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <SkeletonBase className="h-14 w-full max-w-[160px] rounded-xl" />
              <SkeletonBase className="h-14 flex-1 rounded-xl" />
              <SkeletonBase className="h-14 w-14 rounded-xl" />
            </div>

            <div className="space-y-3 pt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonBase className="h-5 w-5" />
                  <SkeletonBase className="h-4 w-40" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabs skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-12"
        >
          <div className="border-border-subtle mb-6 flex gap-6 border-b">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBase key={i} className="h-6 w-24" />
            ))}
          </div>
          <div className="neo-card space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBase key={i} className={`h-4 ${i === 4 ? 'w-3/4' : 'w-full'}`} />
            ))}
          </div>
        </motion.div>

        {/* Reviews section skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <SkeletonBase className="mb-6 h-7 w-48" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="neo-card flex flex-col items-center gap-4 p-6 lg:col-span-1">
              <SkeletonBase className="h-16 w-16 rounded-full" />
              <SkeletonBase className="h-5 w-20" />
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonBase key={i} className="h-5 w-5" />
                ))}
              </div>
              <SkeletonBase className="h-4 w-24" />
            </div>

            <div className="space-y-4 lg:col-span-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="neo-card p-6">
                  <div className="flex items-start gap-4">
                    <SkeletonBase className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <SkeletonBase className="h-4 w-28" />
                        <SkeletonBase className="h-3 w-20" />
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <SkeletonBase key={j} className="h-4 w-4" />
                        ))}
                      </div>
                      <SkeletonBase className="h-4 w-full" />
                      <SkeletonBase className="h-4 w-5/6" />
                      <SkeletonBase className="h-4 w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Related products skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <SkeletonBase className="mb-6 h-8 w-48" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
