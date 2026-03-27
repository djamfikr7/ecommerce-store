import { NextRequest, NextResponse } from 'next/server'
import { getProductBySlug } from '@/lib/db-actions/products'
import { validateProductSlug } from '@/lib/validators/products'

/**
 * GET /api/products/[slug]
 * Get a single product by its slug
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

    // Fetch product
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

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
