import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getProductBySlug } from '@/lib/db-actions/products'
import { getProductReviews } from '@/lib/db-actions/reviews'
import { auth } from '@/lib/auth'
import { Breadcrumb } from '@/components/product/breadcrumb'
import { ReviewsClient } from './reviews-client'

interface ReviewsPageProps {
  params: {
    slug: string
  }
  searchParams: {
    page?: string
    sort?: string
  }
}

export default async function ReviewsPage({ params, searchParams }: ReviewsPageProps) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  const session = await auth()
  const page = parseInt(searchParams.page || '1', 10)
  const pageSize = 10

  // Fetch reviews with pagination
  const reviewsData = await getProductReviews(product.id, page, pageSize)

  // Check if user can review (must be logged in and purchased)
  const canReview = !!session?.user?.id
  const existingReview = canReview
    ? reviewsData.reviews.find((r) => r.userId === session.user.id)
    : undefined

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/shop' },
    ...(product.category
      ? [{ label: product.category.name, href: `/categories/${product.category.slug}` }]
      : []),
    { label: product.name, href: `/shop/${product.slug}` },
    { label: 'Reviews', href: `/shop/${product.slug}/reviews` },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Back to Product */}
        <Link
          href={`/shop/${product.slug}`}
          className="mb-6 inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-slate-100"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {product.name}
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-slate-100">Customer Reviews</h1>
          <p className="text-slate-400">Read what customers are saying about {product.name}</p>
        </div>

        <ReviewsClient
          productId={product.id}
          productName={product.name}
          reviews={reviewsData.reviews}
          averageRating={reviewsData.averageRating}
          totalReviews={reviewsData.total}
          ratingDistribution={reviewsData.ratingDistribution}
          canReview={canReview}
          existingReview={existingReview}
        />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: ReviewsPageProps) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.name} Reviews | E-Commerce Store`,
    description: `Read customer reviews and ratings for ${product.name}. See what others think before you buy.`,
  }
}
