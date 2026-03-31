import { motion } from 'framer-motion'
import { SkeletonBase } from '@/components/ui/skeleton-loaders'

export default function ProfileLoading() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto w-full max-w-4xl space-y-6 py-8"
    >
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="neo-card flex items-center gap-6 rounded-2xl p-6"
      >
        <SkeletonBase className="h-20 w-20 rounded-full" />
        <div className="flex-1 space-y-3">
          <SkeletonBase className="h-8 w-48" />
          <SkeletonBase className="h-4 w-64" />
        </div>
        <SkeletonBase className="hidden h-10 w-36 rounded-lg sm:block" />
      </motion.div>

      {/* Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="neo-card space-y-6 rounded-2xl p-6">
          <SkeletonBase className="h-6 w-32" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <SkeletonBase className="h-4 w-20" />
                <SkeletonBase className="h-11 w-full rounded-lg" />
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <SkeletonBase className="h-10 w-32 rounded-lg" />
          </div>
        </div>
      </motion.div>

      {/* Password Change */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="neo-card space-y-6 rounded-2xl p-6">
          <SkeletonBase className="h-6 w-36" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <SkeletonBase className="h-4 w-32" />
                <SkeletonBase className="h-11 w-full rounded-lg" />
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <SkeletonBase className="h-10 w-36 rounded-lg" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
