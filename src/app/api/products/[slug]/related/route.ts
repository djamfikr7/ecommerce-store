import { NextRequest, NextResponse } from 'next/server'
import { getProductBySlug, getRelatedProducts } from '@/lib/db-actions/products'
import { validateProductSlug } from '@/lib/validators/products'

/**
 * GET /api/products/[slug]/related
 * Get related products for a specific product
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Validate slug
    const validation = validateProductSlug(slug)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid slug',
          message: validation.error.errors.map((e) => e.message).join(', '),
        },
        { status: 400 }
      )
    }

    // First check if the product exists
    const product = await getProductBySlug(validation.data)

    if (!product) {
      return NextResponse.json(
        {
          error: 'Product not found',
          message: `No product found with slug: ${slug}`,
        },
        { status: 404 }
      )
    }

    // Parse limit from query params if provided
    const searchParams = request.nextUrl.searchParams
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 4

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 20) {
      return NextResponse.json(
        {
          error: 'Invalid limit',
          message: 'Limit must be a number between 1 and 20',
        },
        { status: 400 }
      )
    }

    // Fetch related products
    const relatedProducts = await getRelatedProducts(product.id, limit)

    return NextResponse.json({ products: relatedProducts })
  } catch (error) {
    console.error('Error fetching related products:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
