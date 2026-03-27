import { NextRequest, NextResponse } from 'next/server'
import { getCategories, getCategoryBySlug } from '@/lib/db-actions/products'
import { validateCategorySlug } from '@/lib/validators/products'

/**
 * GET /api/categories
 * Get all categories with product counts
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const slug = searchParams.get('slug')

    // If slug is provided, return single category
    if (slug) {
      const validation = validateCategorySlug(slug)

      if (!validation.success) {
        return NextResponse.json(
          {
            error: 'Invalid slug',
            message: validation.error.errors.map((e) => e.message).join(', '),
          },
          { status: 400 }
        )
      }

      const category = await getCategoryBySlug(validation.data)

      if (!category) {
        return NextResponse.json(
          {
            error: 'Category not found',
            message: `No category found with slug: ${slug}`,
          },
          { status: 404 }
        )
      }

      return NextResponse.json({ category })
    }

    // Otherwise return all categories
    const categories = await getCategories()

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
