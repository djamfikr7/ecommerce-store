import { Suspense } from 'react'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { CategoryGrid } from '@/components/home/category-grid'
import { Testimonials } from '@/components/home/testimonials'
import { Newsletter } from '@/components/home/newsletter'
import { StatsSection } from '@/components/home/stats-section'
import { getFeaturedProducts, getCategories } from '@/lib/db-actions/products'
import { prisma } from '@/lib/prisma'
import { Skeleton } from '@/components/ui/skeleton'

async function getStoreStats() {
  const [productCount, orderCount, reviewCount] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.review.count(),
  ])

  const avgRating = await prisma.review.aggregate({
    _avg: { rating: true },
  })

  return {
    productCount,
    customerCount: Math.max(orderCount * 2, 500),
    reviewCount,
    averageRating: avgRating._avg.rating ?? 4.8,
  }
}

const FALLBACK_TESTIMONIALS = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    role: 'Fashion Enthusiast',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    rating: 5,
    content:
      'Absolutely love this store! The quality of products is outstanding and the delivery is always on time. My go-to shopping destination.',
  },
  {
    id: '2',
    name: 'James Carter',
    role: 'Tech Professional',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    rating: 5,
    content:
      'Best prices I found online for electronics. The customer support team is incredibly helpful and responsive. Highly recommended!',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Interior Designer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    rating: 4,
    content:
      'Great selection of home decor items. The packaging was perfect and everything arrived in pristine condition. Will definitely shop again.',
  },
  {
    id: '4',
    name: 'Michael Thompson',
    role: 'Fitness Coach',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    rating: 5,
    content:
      'Premium quality sports gear at competitive prices. The fast shipping and easy returns policy make it a no-brainer for athletes.',
  },
]

function FeaturedProductsSkeleton() {
  return (
    <section className="py-16 md:py-24">
      <div className="container-neo">
        <div className="mb-12">
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[280px] flex-none md:w-[320px]">
              <Skeleton className="aspect-square rounded-xl" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CategoryGridSkeleton() {
  return (
    <section className="bg-surface-base/30 py-16 md:py-24">
      <div className="container-neo">
        <div className="mb-12 text-center">
          <Skeleton className="mx-auto mb-4 h-8 w-64" />
          <Skeleton className="mx-auto h-5 w-96" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  )
}

async function FeaturedProductsWrapper() {
  const products = await getFeaturedProducts(8)
  return <FeaturedProducts products={products} />
}

async function CategoryGridWrapper() {
  const categories = await getCategories()
  const formattedCategories = categories
    .filter((c) => !c.parentId && c.productCount > 0)
    .slice(0, 8)
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image ?? 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
      productCount: c.productCount,
    }))
  return <CategoryGrid categories={formattedCategories} />
}

async function StatsWrapper() {
  const stats = await getStoreStats()
  return <StatsSection stats={stats} />
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />

      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProductsWrapper />
      </Suspense>

      <Suspense fallback={<CategoryGridSkeleton />}>
        <CategoryGridWrapper />
      </Suspense>

      <Suspense
        fallback={
          <section className="py-16 md:py-24">
            <div className="container-neo">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            </div>
          </section>
        }
      >
        <StatsWrapper />
      </Suspense>

      <Testimonials testimonials={FALLBACK_TESTIMONIALS} />
      <Newsletter />
    </div>
  )
}
