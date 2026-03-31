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
  params: Promise<{
    slug: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

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

  const schemaProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} - Premium quality product`,
    image: product.images.map((img) => img.url),
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'E-Commerce Store',
    },
    offers: {
      '@type': 'Offer',
      url: `https://example.com/shop/${product.slug}`,
      priceCurrency: 'USD',
      price: product.price,
      availability:
        product.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(product.averageRating &&
      product.reviewCount && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.averageRating,
          reviewCount: product.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaProduct) }}
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} />

          {/* Product main section */}
          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Gallery */}
            <div>
              <ProductGallery
                media={product.images.map((img, i) => ({
                  id: img.id,
                  url: img.url,
                  alt: img.alt,
                  width: img.width,
                  height: img.height,
                  sortOrder: img.sortOrder ?? i,
                }))}
                productName={product.name}
              />
            </div>

            {/* Product info */}
            <div>
              <ProductInfo product={product} />
            </div>
          </div>

          {/* Product tabs (description, specs, reviews) */}
          <div className="mb-12">
            <ProductTabs
              description={product.description}
              specifications={undefined}
              reviewCount={product.reviewCount || 0}
              reviewAverage={product.averageRating}
            />
          </div>

          {/* Reviews section */}
          {product.reviewCount && product.reviewCount > 0 ? (
            <div className="mb-12">
              <h2 className="mb-6 text-2xl font-bold text-slate-100">Customer Reviews</h2>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <RatingSummary
                    averageRating={product.averageRating || 0}
                    totalReviews={product.reviewCount}
                    size="lg"
                  />
                </div>
                <div className="lg:col-span-2">
                  <Suspense fallback={<ReviewListSkeleton />}>
                    <ReviewList
                      reviews={product.reviews.map((r) => ({
                        id: r.id,
                        rating: r.rating,
                        title: '',
                        content: '',
                        helpfulCount: 0,
                        isVerified: false,
                        createdAt: new Date(),
                        user: {
                          id: '',
                          name: r.user.name || 'Anonymous',
                          image: null,
                        },
                        images: [],
                      }))}
                      averageRating={product.averageRating || 0}
                      totalReviews={product.reviewCount}
                      ratingDistribution={{
                        5: 0,
                        4: 0,
                        3: 0,
                        2: 0,
                        1: 0,
                      }}
                    />
                  </Suspense>
                </div>
              </div>
            </div>
          ) : null}

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="mb-6 text-2xl font-bold text-slate-100">You May Also Like</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={{
                      ...relatedProduct,
                      variants: [],
                    }}
                    variant="grid"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
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
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.name} | E-Commerce Store`,
    description: product.description || `Buy ${product.name} at the best price`,
    openGraph: {
      title: product.name,
      description: product.description || `Buy ${product.name} at the best price`,
      images: product.images.length > 0 ? [product.images[0].url] : [],
      type: 'website',
    },
  }
}
