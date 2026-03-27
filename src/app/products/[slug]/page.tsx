import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductInfo } from '@/components/product/product-info'
import { ProductTabs } from '@/components/product/product-tabs'
import { ProductGrid } from '@/components/product/product-grid'
import { Breadcrumb } from '@/components/product/breadcrumb'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { ReviewList } from '@/components/reviews/review-list'
import { RelatedProductsSection } from '@/components/recommendations/recommendations-section'
import { TrendingSection } from '@/components/recommendations/recommendations-section'
import type { ProductWithRelations, RelatedProduct } from '@/types/products'
import type { ProductReviewsResponse } from '@/types/reviews'

interface ProductPageProps {
  params: { slug: string }
}

// Server-side data fetching (placeholder - will be replaced by phase3-backend-catalog)
async function getProduct(slug: string): Promise<ProductWithRelations | null> {
  // TODO: Replace with actual API call or database query
  // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`)
  // if (!response.ok) return null
  // return response.json()
  return null
}

async function getRelatedProducts(productId: string): Promise<RelatedProduct[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/related`)
  // return response.json()
  return []
}

async function getProductReviews(productId: string): Promise<ProductReviewsResponse | null> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/reviews`)
  // if (!response.ok) return null
  // return response.json()

  // Mock data for demonstration
  return {
    reviews: [
      {
        id: '1',
        userId: 'user-1',
        productId: productId,
        orderItemId: 'order-1',
        rating: 5,
        title: 'Excellent product!',
        content: 'This product exceeded my expectations. Great quality and fast shipping. Highly recommended!',
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
        productId: productId,
        orderItemId: 'order-2',
        rating: 4,
        title: 'Very good',
        content: 'Good value for money. Would recommend to others. The only minor issue was the packaging.',
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
    pageSize: 5,
    totalPages: 26,
    averageRating: 4.5,
    ratingDistribution: {
      1: 5,
      2: 8,
      3: 15,
      4: 40,
      5: 60,
    },
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.name} | Store`,
    description: product.description || `View ${product.name} at Store.`,
    openGraph: {
      title: product.name,
      description: product.description || `${product.name} - Premium quality product`,
      images: product.images[0] ? [{ url: product.images[0].url }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || `${product.name} - Premium quality product`,
      images: product.images[0] ? [product.images[0].url] : [],
    },
  }
}

// JSON-LD structured data for SEO
function ProductSchema({ product }: { product: ProductWithRelations }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.images.map((img) => img.url),
    brand: {
      '@type': 'Brand',
      name: 'Store',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.price / 100,
      availability: product.stockQuantity > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Store',
      },
    },
    aggregateRating: product.averageRating
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.averageRating,
          reviewCount: product.reviewCount,
        }
      : undefined,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.id)
  const reviewsData = await getProductReviews(product.id)

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    ...(product.category ? [{ label: product.category.name, href: `/category/${product.category.slug}` }] : []),
    { label: product.name, href: `/products/${product.slug}` },
  ]

  return (
    <>
      <ProductSchema product={product} />

      <div className="min-h-screen py-8">
        <Container>
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb items={breadcrumbs} />
          </div>

          {/* Main product layout */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
            {/* Gallery */}
            <div>
              <ProductGallery images={product.images} productName={product.name} />
            </div>

            {/* Product info */}
            <div>
              <ProductInfo product={product} />
            </div>
          </div>

          {/* Product tabs */}
          <div className="mb-16">
            <ProductTabs
              description={product.description}
              reviewCount={product.reviewCount || 0}
              reviewAverage={product.averageRating}
            />
          </div>

          {/* Reviews Section */}
          {reviewsData && reviewsData.total > 0 && (
            <section id="reviews" className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-100">
                  Customer Reviews
                </h2>
                <Link href={`/products/${product.slug}/reviews`}>
                  <Button variant="outline" size="sm">
                    View All {reviewsData.total} Reviews
                  </Button>
                </Link>
              </div>
              <ReviewList
                reviews={reviewsData.reviews}
                averageRating={reviewsData.averageRating}
                totalReviews={reviewsData.total}
                ratingDistribution={reviewsData.ratingDistribution}
              />
            </section>
          )}

          {/* Related products - using carousel */}
          <section className="mb-16">
            <RelatedProductsSection
              productId={product.id}
              limit={8}
              className="container-neo"
            />
          </section>

          {/* Trending products */}
          <section className="mb-16">
            <TrendingSection limit={10} />
          </section>
        </Container>
      </div>
    </>
  )
}
