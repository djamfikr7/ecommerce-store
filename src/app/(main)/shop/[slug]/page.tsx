import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getProductBySlug, getRelatedProducts } from '@/lib/db-actions/products'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductInfo } from '@/components/product/product-info'
import { ProductTabs } from '@/components/product/product-tabs'
import { Breadcrumb } from '@/components/product/breadcrumb'
import { ReviewList } from '@/components/reviews/review-list'
import { RatingSummary } from '@/components/reviews/rating-summary'
import { ProductCard } from '@/components/product/product-card'
import { Skeleton } from '@/components/ui/skeleton'

interface ProductPageProps {
  params: {
    slug: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.id, 4)

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/shop' },
    ...(product.category
      ? [{ label: product.category.name, href: `/categories/${product.category.slug}` }]
      : []),
    { label: product.name, href: `/shop/${product.slug}` },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Product main section */}
        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Gallery */}
          <div>
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Product info */}
          <div>
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Product tabs (description, specs, reviews) */}
        <div className="mb-12">
          <ProductTabs product={product} />
        </div>

        {/* Reviews section */}
        {product.reviewCount && product.reviewCount > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-slate-100">Customer Reviews</h2>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <RatingSummary
                  averageRating={product.averageRating || 0}
                  reviewCount={product.reviewCount}
                  reviews={product.reviews}
                />
              </div>
              <div className="lg:col-span-2">
                <Suspense fallback={<ReviewListSkeleton />}>
                  <ReviewList productId={product.id} reviews={product.reviews} />
                </Suspense>
              </div>
            </div>
          </div>
        )}

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="mb-6 text-2xl font-bold text-slate-100">You May Also Like</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} variant="grid" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ReviewListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="neo-card p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.name} | E-Commerce Store`,
    description: product.description || `Buy ${product.name} at the best price`,
  }
}
