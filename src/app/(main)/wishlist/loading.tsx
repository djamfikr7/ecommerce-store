import { motion } from 'framer-motion'
import { SkeletonBase } from '@/components/ui/skeleton-loaders'

function WishlistCardSkeleton() {
  return (
    <div className="neo-card space-y-4 rounded-2xl p-4">
      <SkeletonBase className="aspect-square w-full rounded-xl" />
      <SkeletonBase className="h-3 w-16" />
      <SkeletonBase className="h-5 w-3/4" />
      <div className="flex items-center gap-2">
        <SkeletonBase className="h-4 w-20" />
        <SkeletonBase className="h-4 w-14" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <SkeletonBase className="h-7 w-24" />
        <div className="flex items-center gap-2">
          <SkeletonBase className="h-9 w-9 rounded-lg" />
          <SkeletonBase className="h-9 w-9 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default function WishlistLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] via-[#1a1a2e] to-[#16213e] py-12">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header skeleton */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <SkeletonBase className="mb-4 h-4 w-36" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <SkeletonBase className="h-12 w-12 rounded-2xl" />
              <div className="space-y-2">
                <SkeletonBase className="h-8 w-40" />
                <SkeletonBase className="h-4 w-24" />
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <SkeletonBase className="h-8 w-24 rounded-lg" />
              <SkeletonBase className="h-8 w-32 rounded-lg" />
              <SkeletonBase className="h-8 w-24 rounded-lg" />
            </motion.div>
          </div>
        </motion.div>

        {/* Wishlist Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <WishlistCardSkeleton />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <SkeletonBase className="h-6 w-40" />
              <SkeletonBase className="h-4 w-64" />
            </div>
            <SkeletonBase className="h-10 w-32 rounded-lg" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
