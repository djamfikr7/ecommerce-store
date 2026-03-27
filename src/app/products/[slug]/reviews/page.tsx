import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/currency'
import { ReviewList } from '@/components/reviews/review-list'
import { ReviewForm } from '@/components/reviews/review-form'
import type { ProductReviewsResponse } from '@/types/reviews'
import type { ProductWithRelations } from '@/types/products'

// This would be replaced with actual API/database call
async function getProductReviews(productSlug: string): Promise<{
  product: ProductWithRelations
  reviewsData: ProductReviewsResponse
  canReview: boolean
} | null> {
  // Mock data for demonstration
  const mockProduct: ProductWithRelations = {
    id: '1',
    name: 'Sample Product',
    slug: productSlug,
    description: 'A great product for everyone.',
    price: 9999,
    sku: 'SAMPLE-001',
    stockQuantity: 50,
    isFeatured: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [
      {
        id: '1',
        url: 'https://picsum.photos/seed/product/800/800',
        alt: 'Product image',
        sortOrder: 0,
      },
    ],
    variants: [],
    tags: [],
    reviews: [],
    averageRating: 4.5,
    reviewCount: 128,
  }

  const mockReviews: ProductReviewsResponse = {
    reviews: [
      {
        id: '1',
        userId: 'user-1',
        productId: '1',
        orderItemId: 'order-1',
        rating: 5,
        title: 'Excellent product!',
        content: 'This product exceeded my expectations. Great quality and fast shipping.',
        verifiedPurchase: true,
        helpfulCount: 45,
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-02-15'),
        user: {
          id: 'user-1',
          name: 'John D.',
          image: null,
        },
      },
      {
        id: '2',
        userId: 'user-2',
        productId: '1',
        orderItemId: 'order-2',
        rating: 4,
        title: 'Very good',
        content: 'Good value for money. Would recommend to others.',
        verifiedPurchase: true,
        helpfulCount: 23,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10'),
        user: {
          id: 'user-2',
          name: 'Sarah M.',
          image: null,
        },
      },
    ],
    total: 128,
    page: 1,
    pageSize: 10,
    totalPages: 13,
    averageRating: 4.5,
    ratingDistribution: {
      1: 5,
      2: 8,
      3: 15,
      4: 40,
      5: 60,
    },
  }

  return {
    product: mockProduct,
    reviewsData: mockReviews,
    canReview: true,
  }
}

interface ProductReviewsPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: ProductReviewsPageProps): Promise<Metadata> {
  const { slug } = await params
  const data = await getProductReviews(slug)

  if (!data) {
    return {
      title: 'Reviews Not Found',
    }
  }

  return {
    title: `Reviews for ${data.product.name}`,
    description: `Read ${data.reviewsData.total} reviews for ${data.product.name}`,
  }
}

export default async function ProductReviewsPage({
  params,
}: ProductReviewsPageProps) {
  const { slug } = await params
  const data = await getProductReviews(slug)

  if (!data) {
    notFound()
  }

  const { product, reviewsData, canReview } = data
  const primaryImage = product.images[0]

  return (
    <div className="min-h-screen py-8">
      <div className="container-neo max-w-4xl">
        {/* Back Link */}
        <Link
          href={`/products/${product.slug}`}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-100 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {product.name}
        </Link>

        {/* Product Summary Card */}
        <div className="neo-card p-6 mb-8">
          <div className="flex gap-6">
            {/* Product Image */}
            <div className="relative w-24 h-24 rounded-xl overflow-hidden neo-raised-sm flex-shrink-0">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.alt || product.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="w-full h-full bg-surface-overlay" />
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-100 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-xl font-semibold text-accent">
                  {formatPrice(product.price)}
                </p>
                {product.reviewCount !== undefined && product.averageRating !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(product.averageRating!)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-slate-400">
                      {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="space-y-8" id="reviews">
          <ReviewList
            reviews={reviewsData.reviews}
            averageRating={reviewsData.averageRating}
            totalReviews={reviewsData.total}
            ratingDistribution={reviewsData.ratingDistribution}
          />

          {/* Write Review Form */}
          <div className="mt-8">
            <ReviewForm
              productId={product.id}
              productName={product.name}
              canReview={canReview}
              onSubmit={async (data) => {
                'use server'
                // Handle review submission
                console.log('Review submitted:', data)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
