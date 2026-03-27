'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ThumbsUp, CheckCircle, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ReviewWithUser } from '@/types/reviews'

interface ReviewCardProps {
  review: ReviewWithUser
  onHelpful?: (reviewId: string) => Promise<void>
}

export function ReviewCard({ review, onHelpful }: ReviewCardProps) {
  const [isHelpful, setIsHelpful] = useState(false)
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  // Mock review images for demo (in real app, would come from review.images)
  const reviewImages = [
    'https://picsum.photos/seed/review1/400/400',
    'https://picsum.photos/seed/review2/400/400',
  ]

  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const handleHelpful = async () => {
    if (isHelpful || !onHelpful) return

    setIsLoading(true)
    setIsHelpful(true)
    setHelpfulCount((prev) => prev + 1)

    try {
      await onHelpful(review.id)
    } catch {
      setIsHelpful(false)
      setHelpfulCount((prev) => prev - 1)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={cn(
              'w-4 h-4',
              star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
            )}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="neo-card p-6"
        aria-label={`Review by ${review.user.name || 'Anonymous'}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={review.user.image}
              alt={review.user.name || 'User'}
              size="md"
              fallback={review.user.name?.charAt(0) || 'U'}
            />
            <div>
              <p className="font-medium text-slate-100">
                {review.user.name || 'Anonymous'}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {renderStars(review.rating)}
                {review.verifiedPurchase && (
                  <Badge variant="success" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified Purchase
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <time className="text-sm text-slate-400" dateTime={review.createdAt.toString()}>
            {formattedDate}
          </time>
        </div>

        {/* Title */}
        {review.title && (
          <h3 className="text-lg font-semibold text-slate-100 mb-2">
            {review.title}
          </h3>
        )}

        {/* Content */}
        {review.content && (
          <p className="text-slate-300 leading-relaxed mb-4">
            {review.content}
          </p>
        )}

        {/* Review Images */}
        {reviewImages.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {reviewImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className="relative w-20 h-20 rounded-lg overflow-hidden neo-raised-sm flex-shrink-0 hover:ring-2 hover:ring-accent-primary transition-all"
                aria-label={`View review image ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={`Review image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Helpful Button */}
        <div className="flex items-center gap-4 pt-4 border-t border-border-subtle">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHelpful}
            disabled={isHelpful || isLoading}
            className={cn(
              'gap-2',
              isHelpful && 'text-accent-primary'
            )}
            aria-pressed={isHelpful}
          >
            <ThumbsUp className={cn('w-4 h-4', isHelpful && 'fill-current')} />
            Helpful ({helpfulCount})
          </Button>
        </div>
      </motion.article>

      {/* Image Lightbox */}
      {selectedImageIndex !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedImageIndex(null)}
          role="dialog"
          aria-label="Review image viewer"
          aria-modal="true"
        >
          <button
            onClick={() => setSelectedImageIndex((prev) =>
              prev !== null ? (prev === 0 ? reviewImages.length - 1 : prev - 1) : null
            )}
            className="absolute left-4 p-2 rounded-full neo-raised-sm hover:bg-white/10 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <div className="relative w-full max-w-3xl h-[70vh] mx-16">
            <Image
              src={reviewImages[selectedImageIndex]}
              alt={`Review image ${selectedImageIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 1280px) 100vw, 768px"
            />
          </div>

          <button
            onClick={() => setSelectedImageIndex((prev) =>
              prev !== null ? (prev === reviewImages.length - 1 ? 0 : prev + 1) : null
            )}
            className="absolute right-4 p-2 rounded-full neo-raised-sm hover:bg-white/10 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 p-2 rounded-full neo-raised-sm hover:bg-white/10 transition-colors"
            aria-label="Close viewer"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </motion.div>
      )}
    </>
  )
}

export function ReviewCardSkeleton() {
  return (
    <div className="neo-card p-6 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-surface-overlay" />
        <div className="flex-1">
          <div className="h-4 w-24 bg-surface-overlay rounded mb-2" />
          <div className="h-3 w-32 bg-surface-overlay rounded" />
        </div>
        <div className="h-3 w-20 bg-surface-overlay rounded" />
      </div>
      <div className="h-5 w-3/4 bg-surface-overlay rounded mb-3" />
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full bg-surface-overlay rounded" />
        <div className="h-3 w-5/6 bg-surface-overlay rounded" />
        <div className="h-3 w-4/6 bg-surface-overlay rounded" />
      </div>
      <div className="flex gap-2">
        <div className="w-20 h-20 bg-surface-overlay rounded-lg" />
        <div className="w-20 h-20 bg-surface-overlay rounded-lg" />
      </div>
    </div>
  )
}
