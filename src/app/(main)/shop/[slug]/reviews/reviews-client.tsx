'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ReviewList } from '@/components/reviews/review-list'
import { ReviewForm } from '@/components/reviews/review-form'
import type { ReviewWithUser, RatingDistribution } from '@/types/reviews'

interface ReviewsClientProps {
  productId: string
  productName: string
  reviews: ReviewWithUser[]
  averageRating: number
  totalReviews: number
  ratingDistribution: RatingDistribution
  canReview: boolean
  existingReview?: ReviewWithUser
}

export function ReviewsClient({
  productId,
  productName,
  reviews: initialReviews,
  averageRating,
  totalReviews,
  ratingDistribution,
  canReview,
  existingReview,
}: ReviewsClientProps) {
  const router = useRouter()
  const [reviews, setReviews] = useState(initialReviews)

  const handleReviewSubmit = async (data: {
    rating: number
    title?: string
    content?: string
    images: string[]
  }) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          rating: data.rating,
          title: data.title,
          content: data.content,
          images: data.images,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit review')
      }

      const newReview = await response.json()

      // Add new review to the list
      setReviews((prev) => [newReview, ...prev])

      // Refresh the page to update stats
      router.refresh()
    } catch (error) {
      console.error('Error submitting review:', error)
      throw error
    }
  }

  const handleHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to mark review as helpful')
      }

      // Update the review in the list
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId ? { ...review, helpfulCount: review.helpfulCount + 1 } : review,
        ),
      )
    } catch (error) {
      console.error('Error marking review as helpful:', error)
      throw error
    }
  }

  const handleLoadMore = async () => {
    // In a real implementation, this would fetch more reviews
    // For now, we'll just show more from the existing list
    return Promise.resolve()
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Main Content - Reviews List */}
      <div className="order-2 lg:order-1 lg:col-span-2">
        <ReviewList
          reviews={reviews}
          averageRating={averageRating}
          totalReviews={totalReviews}
          ratingDistribution={ratingDistribution}
          initialSort="newest"
          onHelpful={handleHelpful}
          onLoadMore={handleLoadMore}
        />
      </div>

      {/* Sidebar - Write Review Form */}
      <div className="order-1 lg:order-2 lg:col-span-1">
        <div className="sticky top-8">
          <ReviewForm
            productId={productId}
            productName={productName}
            {...(existingReview && { existingReview })}
            canReview={canReview}
            onSubmit={handleReviewSubmit}
          />
        </div>
      </div>
    </div>
  )
}
