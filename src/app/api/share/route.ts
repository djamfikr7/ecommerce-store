/**
 * Share API
 * GET /api/share - Generate share URLs and OG tags for a product
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  generateShareUrl,
  generateShareText,
  generateOgTags,
  generateAllShareUrls,
  type ShareableProduct,
} from '@/lib/social/share'
import { getProductBySlug } from '@/lib/db-actions/products'
import { shareRequestSchema, validateOrThrow } from '@/lib/validators/social'

export const dynamic = 'force-dynamic'

/**
 * GET /api/share
 * Generate share URLs and metadata for a product
 *
 * Query params:
 * - productId: Product ID or slug
 * - platform: Specific platform to share on (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const platform = searchParams.get('platform')

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID or slug is required' },
        { status: 400 }
      )
    }

    // Fetch product from database
    const product = await getProductBySlug(productId)

    if (!product) {
      // Try fetching by ID
      const { prisma } = await import('@/lib/db')
      const productById = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          price: true,
          rating: true,
          description: true,
        },
      })

      if (!productById) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        )
      }

      return buildShareResponse(productById, platform)
    }

    return buildShareResponse(product, platform)
  } catch (error) {
    console.error('Failed to generate share URLs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate share URLs' },
      { status: 500 }
    )
  }
}

interface ShareableProductData {
  id: string
  name: string
  slug: string
  image?: string | null
  price?: number | null
  rating?: number | null
  description?: string | null
}

async function buildShareResponse(product: ShareableProductData, platform?: string | null) {
  const shareableProduct: ShareableProduct = {
    name: product.name,
    slug: product.slug,
    image: product.image,
    price: product.price ? `$${product.price.toFixed(2)}` : undefined,
    rating: product.rating ?? undefined,
    description: product.description ?? undefined,
  }

  // Generate share URLs
  const urls = generateAllShareUrls(shareableProduct)

  // Generate OG tags
  const ogTags = generateOgTags(shareableProduct)

  // Generate share text
  const text = generateShareText(shareableProduct)

  // Return single platform URL if specified
  if (platform) {
    const platformUrl = generateShareUrl(shareableProduct, platform)

    return NextResponse.json({
      success: true,
      data: {
        url: platformUrl,
        platform,
        text,
        ogTags,
      },
    })
  }

  // Return all share URLs
  return NextResponse.json({
    success: true,
    data: {
      urls,
      text,
      ogTags,
      product: {
        name: product.name,
        slug: product.slug,
        image: product.image,
        price: product.price ? `$${product.price.toFixed(2)}` : null,
      },
    },
  })
}
