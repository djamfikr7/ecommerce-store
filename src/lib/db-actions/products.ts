'use server'

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type {
  ProductListParams,
  ProductWithRelations,
  ProductCard,
  FeaturedProduct,
  RelatedProduct,
  CategoryWithCount,
  ProductSearchResult,
} from '@/types/products'

// ============================================
// Type helpers for Prisma queries
// ============================================

type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    category: {
      select: {
        id: true
        name: true
        slug: true
      }
    }
    images: {
      orderBy: { sortOrder: 'asc' }
      select: {
        id: true
        url: true
        alt: true
        width: true
        height: true
        sortOrder: true
      }
    }
    variants: {
      select: {
        id: true
        price: true
        stockQuantity: true
      }
    }
    reviews: {
      select: {
        id: true
        rating: true
      }
    }
  }
}>

// ============================================
// Product List with Filtering & Pagination
// ============================================

/**
 * Get paginated list of products with filtering and sorting
 */
export async function getProducts(
  params: ProductListParams
): Promise<{ products: ProductCard[]; total: number; page: number; pageSize: number }> {
  const {
    category,
    search,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    sort = 'newest',
    page = 1,
    pageSize = 20,
  } = params

  // Build where clause
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  }

  // Category filter
  if (category) {
    where.category = {
      slug: category,
    }
  }

  // Full-text search on name and description
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {}
    if (minPrice !== undefined) {
      where.price.gte = minPrice
    }
    if (maxPrice !== undefined) {
      where.price.lte = maxPrice
    }
  }

  // Stock filter - check if any variant has stock
  if (inStock === true) {
    where.variants = {
      some: {
        trackInventory: false, // Products without tracking are always "in stock"
        OR: [
          { trackInventory: true, stockQuantity: { gt: 0 } },
          { trackInventory: false },
        ],
      },
    }
  }

  // Rating filter - must have average rating >= minRating
  if (minRating !== undefined) {
    where.reviews = {
      some: {
        rating: { gte: minRating },
      },
    }
  }

  // Build order by clause
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }

  switch (sort) {
    case 'price-asc':
      orderBy = { price: 'asc' }
      break
    case 'price-desc':
      orderBy = { price: 'desc' }
      break
    case 'rating':
      // Sort by average rating - handled in JS due to Prisma limitations
      break
    case 'popular':
      // Sort by review count - handled in JS due to Prisma limitations
      break
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' }
  }

  // Calculate pagination
  const skip = (page - 1) * pageSize

  // Execute queries in parallel
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        category: {
          select: {
            id: true
            name: true
            slug: true
          }
        },
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1, // Only first image for list view
          select: {
            id: true
            url: true
            alt: true
          }
        },
        variants: {
          select: {
            id: true
            price: true
            stockQuantity: true
          }
        },
        reviews: {
          select: {
            id: true
            rating: true
          }
        },
      },
    }),
    prisma.product.count({ where }),
  ])

  // Calculate average ratings and format response
  const formattedProducts: ProductCard[] = products.map((product) => {
    const reviewCount = product.reviews.length
    const averageRating = reviewCount > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : undefined

    // Calculate min price from variants
    const variantPrices = product.variants
      .map((v) => v.price)
      .filter((p): p is number => p !== null)

    const minVariantPrice = variantPrices.length > 0
      ? Math.min(...variantPrices)
      : product.price

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: minVariantPrice,
      compareAtPrice: product.compareAtPrice,
      images: product.images,
      category: product.category,
      variants: product.variants,
      reviewCount,
      averageRating: averageRating ? Math.round(averageRating * 10) / 10 : undefined,
    }
  })

  // Sort by rating or popularity if needed
  if (sort === 'rating') {
    formattedProducts.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
  } else if (sort === 'popular') {
    formattedProducts.sort((a, b) => b.reviewCount - a.reviewCount)
  }

  return {
    products: formattedProducts,
    total,
    page,
    pageSize,
  }
}

// ============================================
// Get Single Product by Slug
// ============================================

/**
 * Get a single product by its slug with full details
 */
export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: {
        select: {
          id: true
          name: true
          slug: true
        }
      },
      images: {
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true
          url: true
          alt: true
          width: true
          height: true
          sortOrder: true
        }
      },
      variants: {
        include: {
          images: {
            select: {
              id: true
              url: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      },
      tags: {
        select: {
          id: true
          name: true
        }
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10, // Latest 10 reviews
      },
    },
  })

  if (!product) {
    return null
  }

  // Calculate average rating and review count
  const reviewCount = await prisma.review.count({
    where: { productId: product.id },
  })

  const reviews = await prisma.review.findMany({
    where: { productId: product.id },
    select: { rating: true },
  })

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : undefined

  return {
    ...product,
    averageRating: averageRating ? Math.round(averageRating * 10) / 10 : undefined,
    reviewCount,
  }
}

// ============================================
// Get Featured Products
// ============================================

/**
 * Get featured products with price range
 */
export async function getFeaturedProducts(limit: number = 8): Promise<FeaturedProduct[]> {
  const products = await prisma.product.findMany({
    where: {
      isFeatured: true,
      isActive: true,
      stockQuantity: { gt: 0 },
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      category: {
        select: {
          id: true
          name: true
          slug: true
        }
      },
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
        select: {
          id: true
          url: true
          alt: true
        }
      },
      variants: {
        select: {
          price: true
          stockQuantity: true
        }
      },
      reviews: {
        select: {
          rating: true
        }
      },
    },
  })

  return products.map((product) => {
    const reviewCount = product.reviews.length
    const averageRating = reviewCount > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : undefined

    // Calculate price range from variants
    const variantPrices = product.variants
      .filter((v) => v.stockQuantity > 0)
      .map((v) => v.price)
      .filter((p): p is number => p !== null)

    const minVariantPrice = variantPrices.length > 0
      ? Math.min(...variantPrices)
      : product.price
    const maxVariantPrice = variantPrices.length > 0
      ? Math.max(...variantPrices)
      : product.price

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      minPrice: minVariantPrice,
      maxPrice: maxVariantPrice,
      compareAtPrice: product.compareAtPrice,
      images: product.images,
      category: product.category,
      averageRating: averageRating ? Math.round(averageRating * 10) / 10 : undefined,
      reviewCount,
    }
  })
}

// ============================================
// Get Related Products
// ============================================

/**
 * Get related products in the same category
 */
export async function getRelatedProducts(
  productId: string,
  limit: number = 4
): Promise<RelatedProduct[]> {
  // First get the product's category
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { categoryId: true },
  })

  if (!product?.categoryId) {
    // If no category, return recently added products
    const products = await prisma.product.findMany({
      where: {
        id: { not: productId },
        isActive: true,
        stockQuantity: { gt: 0 },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: {
            id: true
            name: true
            slug: true
          }
        },
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
          select: {
            id: true
            url: true
            alt: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        },
      },
    })

    return products.map((p) => formatRelatedProduct(p))
  }

  // Get products from same category
  const products = await prisma.product.findMany({
    where: {
      id: { not: productId },
      categoryId: product.categoryId,
      isActive: true,
      stockQuantity: { gt: 0 },
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      category: {
        select: {
          id: true
          name: true
          slug: true
        }
      },
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
        select: {
          id: true
          url: true
          alt: true
        }
      },
      reviews: {
        select: {
          rating: true
        }
      },
    },
  })

  return products.map((p) => formatRelatedProduct(p))
}

// Helper to format related product
function formatRelatedProduct(product: {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  category: { id: string; name: string; slug: string } | null
  images: { id: string; url: string; alt: string | null }[]
  reviews: { rating: number }[]
}): RelatedProduct {
  const reviewCount = product.reviews.length
  const averageRating = reviewCount > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : undefined

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    images: product.images,
    category: product.category,
    averageRating: averageRating ? Math.round(averageRating * 10) / 10 : undefined,
    reviewCount,
  }
}

// ============================================
// Get Categories
// ============================================

/**
 * Get all categories with product counts
 */
export async function getCategories(): Promise<CategoryWithCount[]> {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          products: {
            where: { isActive: true }
          }
        }
      },
      children: {
        where: { isActive: true },
        include: {
          _count: {
            select: {
              products: {
                where: { isActive: true }
              }
            }
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    parentId: category.parentId,
    isActive: category.isActive,
    productCount: category._count.products,
    children: category.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      description: child.description,
      image: child.image,
      parentId: child.parentId,
      isActive: child.isActive,
      productCount: child._count.products,
    })),
  }))
}

// ============================================
// Get Category by Slug
// ============================================

/**
 * Get a single category by its slug
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryWithCount | null> {
  const category = await prisma.category.findUnique({
    where: { slug, isActive: true },
    include: {
      _count: {
        select: {
          products: {
            where: { isActive: true }
          }
        }
      },
      children: {
        where: { isActive: true },
        include: {
          _count: {
            select: {
              products: {
                where: { isActive: true }
              }
            }
          },
        },
      },
    },
  })

  if (!category) {
    return null
  }

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    parentId: category.parentId,
    isActive: category.isActive,
    productCount: category._count.products,
    children: category.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      description: child.description,
      image: child.image,
      parentId: child.parentId,
      isActive: child.isActive,
      productCount: child._count.products,
    })),
  }
}

// ============================================
// Search Products
// ============================================

/**
 * Full-text search for products (autocomplete style)
 */
export async function searchProducts(
  query: string,
  limit: number = 10
): Promise<ProductSearchResult[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
        select: {
          id: true,
          url: true,
        }
      },
    },
  })

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    images: product.images,
  }))
}

// ============================================
// Get Product Price Range
// ============================================

/**
 * Get the min and max price from product variants
 */
export async function getProductPriceRange(
  productId: string
): Promise<{ min: number; max: number }> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      price: true,
      variants: {
        select: {
          price: true
        }
      }
    },
  })

  if (!product) {
    throw new Error('Product not found')
  }

  const variantPrices = product.variants
    .map((v) => v.price)
    .filter((p): p is number => p !== null)

  if (variantPrices.length === 0) {
    return { min: product.price, max: product.price }
  }

  return {
    min: Math.min(product.price, ...variantPrices),
    max: Math.max(product.price, ...variantPrices),
  }
}
