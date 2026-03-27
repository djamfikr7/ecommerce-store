'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Star, Upload, X, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { ReviewWithUser } from '@/types/reviews'
import { z } from 'zod'

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters').optional(),
  content: z.string().min(10, 'Review must be at least 10 characters').max(5000, 'Review must be less than 5000 characters').optional(),
})

interface ReviewFormProps {
  productId: string
  productName: string
  existingReview?: ReviewWithUser
  canReview: boolean
  onSubmit: (data: { rating: number; title?: string; content?: string; images: string[] }) => Promise<void>
  className?: string
}

export function ReviewForm({
  productId,
  productName,
  existingReview,
  canReview,
  onSubmit,
  className,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState(existingReview?.title || '')
  const [content, setContent] = useState(existingReview?.content || '')
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // In a real app, you'd upload to a server/cloud storage
    // For demo, we'll create object URLs
    const newImages = Array.from(files)
      .slice(0, 5 - images.length)
      .map((file) => URL.createObjectURL(file))

    setImages((prev) => [...prev, ...newImages].slice(0, 5))
  }, [images.length])

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      const data = reviewSchema.parse({
        rating,
        title: title || undefined,
        content: content || undefined,
      })

      setIsSubmitting(true)
      await onSubmit({
        ...data,
        images,
      })
      setSubmitSuccess(true)

      // Reset form if not editing
      if (!existingReview) {
        setRating(0)
        setTitle('')
        setContent('')
        setImages([])
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(fieldErrors)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Not purchased state
  if (!canReview && !existingReview) {
    return (
      <div className={cn('neo-card p-6', className)}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
          <h3 className="text-lg font-semibold text-slate-100 mb-2">
            Purchase to Review
          </h3>
          <p className="text-slate-400">
            You need to purchase this product before you can write a review.
          </p>
        </div>
      </div>
    )
  }

  // Already reviewed (and not editing)
  if (existingReview && !existingReview.title && !existingReview.content) {
    return (
      <div className={cn('neo-card p-6', className)}>
        <div className="text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-accent-success" />
          <h3 className="text-lg font-semibold text-slate-100 mb-2">
            Thanks for Your Review!
          </h3>
          <p className="text-slate-400">
            You have already reviewed {productName}.
          </p>
        </div>
      </div>
    )
  }

  // Success state
  if (submitSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn('neo-card p-6', className)}
      >
        <div className="text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-accent-success" />
          <h3 className="text-lg font-semibold text-slate-100 mb-2">
            {existingReview ? 'Review Updated!' : 'Review Submitted!'}
          </h3>
          <p className="text-slate-400 mb-4">
            Thank you for sharing your experience with {productName}.
          </p>
          <Button variant="outline" onClick={() => setSubmitSuccess(false)}>
            Write Another Review
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('neo-card p-6', className)}
    >
      <h3 className="text-xl font-semibold text-slate-100 mb-6">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Your Rating <span className="text-accent-danger">*</span>
          </label>
          <div
            className="flex items-center gap-1"
            role="radiogroup"
            aria-label="Product rating"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary rounded"
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
                aria-checked={rating === star}
                role="radio"
              >
                <Star
                  className={cn(
                    'w-8 h-8 transition-colors',
                    star <= (hoverRating || rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-600'
                  )}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-slate-400">
                {rating === 5 && 'Excellent!'}
                {rating === 4 && 'Great'}
                {rating === 3 && 'Good'}
                {rating === 2 && 'Fair'}
                {rating === 1 && 'Poor'}
              </span>
            )}
          </div>
          {errors.rating && (
            <p className="mt-1 text-sm text-accent-danger">{errors.rating}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="review-title" className="block text-sm font-medium text-slate-300 mb-2">
            Review Title
          </label>
          <Input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            maxLength={100}
            className={cn(errors.title && 'border-accent-danger')}
          />
          <div className="flex justify-between mt-1">
            {errors.title ? (
              <p className="text-sm text-accent-danger">{errors.title}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-slate-500">{title.length}/100</span>
          </div>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="review-content" className="block text-sm font-medium text-slate-300 mb-2">
            Your Review
          </label>
          <textarea
            id="review-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts about the product..."
            rows={5}
            maxLength={5000}
            className={cn(
              'neo-inset w-full px-4 py-3 text-slate-100 placeholder-slate-500 rounded-lg resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary',
              errors.content && 'border border-accent-danger'
            )}
          />
          <div className="flex justify-between mt-1">
            {errors.content ? (
              <p className="text-sm text-accent-danger">{errors.content}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-slate-500">{content.length}/5000</span>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Add Photos (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative w-20 h-20 rounded-lg overflow-hidden neo-raised-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 p-1 rounded-full bg-accent-danger text-white"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {images.length < 5 && (
              <label
                className="w-20 h-20 rounded-lg neo-inset flex flex-col items-center justify-center cursor-pointer hover:bg-surface-elevated transition-colors"
                aria-label="Upload review image"
              >
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs text-slate-500">{images.length}/5</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="sr-only"
                />
              </label>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Upload up to 5 images (JPEG, PNG, WebP)
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </span>
                Submitting...
              </>
            ) : existingReview ? (
              'Update Review'
            ) : (
              'Submit Review'
            )}
          </Button>
          {existingReview && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRating(existingReview.rating)
                setTitle(existingReview.title || '')
                setContent(existingReview.content || '')
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </form>
    </motion.div>
  )
}

export function ReviewFormSkeleton() {
  return (
    <div className="neo-card p-6 animate-pulse">
      <div className="h-6 w-48 bg-surface-overlay rounded mb-6" />
      <div className="space-y-6">
        <div className="h-20 bg-surface-overlay rounded" />
        <div className="h-10 bg-surface-overlay rounded" />
        <div className="h-32 bg-surface-overlay rounded" />
        <div className="h-24 bg-surface-overlay rounded" />
        <div className="h-10 w-32 bg-surface-overlay rounded" />
      </div>
    </div>
  )
}
