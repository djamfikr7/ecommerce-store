'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type SkeletonVariant = 'text' | 'card' | 'avatar' | 'image' | 'list'

interface LoadingSkeletonProps {
  variant?: SkeletonVariant
  count?: number
  className?: string
}

const shimmer = {
  hidden: { backgroundPosition: '-200% 0' },
  visible: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

function SkeletonBase({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-lg bg-gradient-to-r from-gray-800/50 via-gray-700/50 to-gray-800/50',
        'shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.05)]',
        className,
      )}
      initial="hidden"
      animate="visible"
      variants={shimmer}
      style={{
        backgroundSize: '200% 100%',
      }}
    />
  )
}

function TextSkeleton() {
  return (
    <div className="space-y-3">
      <SkeletonBase className="h-4 w-full" />
      <SkeletonBase className="h-4 w-5/6" />
      <SkeletonBase className="h-4 w-4/6" />
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-xl bg-gray-900/50 p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.02)]">
      <SkeletonBase className="mb-4 h-48 w-full" />
      <SkeletonBase className="mb-3 h-6 w-3/4" />
      <SkeletonBase className="mb-2 h-4 w-full" />
      <SkeletonBase className="mb-4 h-4 w-5/6" />
      <div className="flex items-center justify-between">
        <SkeletonBase className="h-8 w-24" />
        <SkeletonBase className="h-8 w-8 rounded-full" />
      </div>
    </div>
  )
}

function AvatarSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <SkeletonBase className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <SkeletonBase className="h-4 w-32" />
        <SkeletonBase className="h-3 w-24" />
      </div>
    </div>
  )
}

function ImageSkeleton() {
  return <SkeletonBase className="aspect-video w-full" />
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg bg-gray-900/30 p-4">
          <SkeletonBase className="h-16 w-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <SkeletonBase className="h-4 w-3/4" />
            <SkeletonBase className="h-3 w-1/2" />
          </div>
          <SkeletonBase className="h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

export function LoadingSkeleton({ variant = 'text', count = 1, className }: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return <CardSkeleton />
      case 'avatar':
        return <AvatarSkeleton />
      case 'image':
        return <ImageSkeleton />
      case 'list':
        return <ListSkeleton />
      case 'text':
      default:
        return <TextSkeleton />
    }
  }

  return (
    <div className={cn('space-y-6', className)} role="status" aria-label="Loading content">
      {[...Array(count)].map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
      <span className="sr-only">Loading content...</span>
    </div>
  )
}
