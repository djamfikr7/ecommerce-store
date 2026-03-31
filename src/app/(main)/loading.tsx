import { motion } from 'framer-motion'
import { SkeletonBase } from '@/components/ui/skeleton-loaders'

export default function HomepageLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero SkeletonBase */}
      <section className="relative flex min-h-[600px] items-center justify-center overflow-hidden bg-gradient-to-br from-surface-base via-surface-elevated to-surface-base">
        <div className="container-neo relative z-10 mx-auto px-4 py-20 text-center">
          <SkeletonBase className="mx-auto mb-6 h-16 w-3/4 max-w-2xl" />
          <SkeletonBase className="mx-auto mb-8 h-6 w-1/2 max-w-xl" />
          <div className="flex items-center justify-center gap-4">
            <SkeletonBase className="h-12 w-36 rounded-xl" />
            <SkeletonBase className="h-12 w-36 rounded-xl" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </section>

      {/* Featured Products SkeletonBase */}
      <section className="py-16 md:py-24">
        <div className="container-neo">
          <div className="mb-12">
            <SkeletonBase className="mb-3 h-8 w-64" />
            <SkeletonBase className="h-5 w-48" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="neo-card space-y-4 p-4">
                <SkeletonBase className="aspect-square rounded-xl" />
                <SkeletonBase className="h-3 w-16" />
                <SkeletonBase className="h-5 w-3/4" />
                <div className="flex items-center gap-2">
                  <SkeletonBase className="h-4 w-20" />
                  <SkeletonBase className="h-4 w-14" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <SkeletonBase className="h-7 w-24" />
                  <SkeletonBase className="h-9 w-9 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories SkeletonBase */}
      <section className="bg-surface-base/30 py-16 md:py-24">
        <div className="container-neo">
          <div className="mb-12 text-center">
            <SkeletonBase className="mx-auto mb-4 h-8 w-64" />
            <SkeletonBase className="mx-auto h-5 w-96" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonBase key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </div>
      </section>

      {/* Stats SkeletonBase */}
      <section className="py-16 md:py-24">
        <div className="container-neo">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="neo-card flex flex-col items-center gap-3 p-6">
                <SkeletonBase className="h-10 w-10 rounded-full" />
                <SkeletonBase className="h-8 w-20" />
                <SkeletonBase className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials SkeletonBase */}
      <section className="bg-surface-base/30 py-16 md:py-24">
        <div className="container-neo">
          <div className="mb-12 text-center">
            <SkeletonBase className="mx-auto mb-4 h-8 w-64" />
            <SkeletonBase className="mx-auto h-5 w-96" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="neo-card space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <SkeletonBase className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <SkeletonBase className="h-4 w-24" />
                    <SkeletonBase className="h-3 w-16" />
                  </div>
                </div>
                <SkeletonBase className="h-3 w-20" />
                <div className="space-y-2">
                  <SkeletonBase className="h-3 w-full" />
                  <SkeletonBase className="h-3 w-full" />
                  <SkeletonBase className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter SkeletonBase */}
      <section className="py-16 md:py-24">
        <div className="container-neo">
          <div className="neo-card mx-auto max-w-2xl space-y-6 p-8 text-center">
            <SkeletonBase className="mx-auto h-8 w-48" />
            <SkeletonBase className="mx-auto h-5 w-80" />
            <div className="flex items-center gap-3">
              <SkeletonBase className="h-12 flex-1 rounded-xl" />
              <SkeletonBase className="h-12 w-28 rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
