import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import {
  getRecommendationsForUser,
  getRecommendationsForProduct,
  getTrendingProducts,
  getRecentlyViewedProducts,
  getHomepageRecommendations,
} from '@/lib/db-actions/recommendations'
import {
  getCollaborativeRecommendations,
  getFrequentlyBoughtTogether,
} from '@/lib/recommendations/collaborative-filtering'
import {
  getContentBasedRecommendations,
  getHybridContentRecommendations,
} from '@/lib/recommendations/content-based'
import {
  getTrendingProducts as getTrendingScores,
  getTrendingByCategory,
  getHotDeals,
  getNewAndTrending,
  getRisingStars,
} from '@/lib/recommendations/trending'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/recommendations
 * Get product recommendations
 * Query params:
 *   - type: 'user' | 'product' | 'trending' | 'recently-viewed' | 'homepage' | 'collaborative' | 'content-based' | 'hybrid' | 'frequently-bought-together' | 'trending-category' | 'hot-deals' | 'new-trending' | 'rising-stars'
 *   - productId: string (required for type='product', 'content-based', 'hybrid', 'frequently-bought-together')
 *   - categoryId: string (required for type='trending-category')
 *   - limit: number (default: 10)
 *   - days: number (for trending, default: 30)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const type = searchParams.get('type') || 'trending'
    const productId = searchParams.get('productId') || undefined
    const categoryId = searchParams.get('categoryId') || undefined
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const days = parseInt(searchParams.get('days') || '30', 10)

    // Validate type
    const validTypes = [
      'user',
      'product',
      'trending',
      'recently-viewed',
      'homepage',
      'collaborative',
      'content-based',
      'hybrid',
      'frequently-bought-together',
      'trending-category',
      'hot-deals',
      'new-trending',
      'rising-stars',
    ]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          error: 'Invalid type',
          message: `Type must be one of: ${validTypes.join(', ')}`,
        },
        { status: 400 },
      )
    }

    // Validate limit
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        {
          error: 'Invalid limit',
          message: 'Limit must be between 1 and 50',
        },
        { status: 400 },
      )
    }

    // Check authentication for personalized recommendations
    const session = await auth()
    const userId = session?.user?.id

    let recommendations: unknown

    switch (type) {
      case 'user':
        if (!userId) {
          // Return trending for unauthenticated users
          recommendations = await getTrendingProducts(limit, days)
        } else {
          recommendations = await getRecommendationsForUser(userId, limit)
        }
        break

      case 'product':
        if (!productId) {
          return NextResponse.json(
            {
              error: 'Product ID required',
              message: 'productId is required when type is "product"',
            },
            { status: 400 },
          )
        }
        recommendations = await getRecommendationsForProduct(productId, limit)
        break

      case 'trending':
        recommendations = await getTrendingProducts(limit, days)
        break

      case 'recently-viewed':
        if (!userId) {
          return NextResponse.json(
            {
              error: 'Authentication required',
              message: 'You must be logged in to view recently viewed products',
            },
            { status: 401 },
          )
        }
        recommendations = await getRecentlyViewedProducts(userId, limit)
        break

      case 'homepage':
        recommendations = await getHomepageRecommendations(userId, limit)
        break

      case 'collaborative': {
        if (!userId) {
          return NextResponse.json(
            {
              error: 'Authentication required',
              message: 'You must be logged in for personalized recommendations',
            },
            { status: 401 },
          )
        }
        const scores = await getCollaborativeRecommendations(userId, limit)
        const products = await prisma.product.findMany({
          where: {
            id: { in: scores.map((s) => s.productId) },
            isActive: true,
          },
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
              select: { id: true, url: true, alt: true },
            },
          },
        })
        recommendations = { scores, products }
        break
      }

      case 'frequently-bought-together': {
        if (!productId) {
          return NextResponse.json(
            {
              error: 'Product ID required',
              message: 'productId is required for frequently bought together',
            },
            { status: 400 },
          )
        }
        const scores = await getFrequentlyBoughtTogether(productId, limit)
        const products = await prisma.product.findMany({
          where: {
            id: { in: scores.map((s) => s.productId) },
            isActive: true,
          },
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
              select: { id: true, url: true, alt: true },
            },
          },
        })
        recommendations = { scores, products }
        break
      }

      case 'content-based': {
        if (!productId) {
          return NextResponse.json(
            {
              error: 'Product ID required',
              message: 'productId is required for content-based recommendations',
            },
            { status: 400 },
          )
        }
        const scores = await getContentBasedRecommendations(productId, limit)
        const products = await prisma.product.findMany({
          where: {
            id: { in: scores.map((s) => s.productId) },
            isActive: true,
          },
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
              select: { id: true, url: true, alt: true },
            },
          },
        })
        recommendations = { scores, products }
        break
      }

      case 'hybrid': {
        if (!productId) {
          return NextResponse.json(
            {
              error: 'Product ID required',
              message: 'productId is required for hybrid recommendations',
            },
            { status: 400 },
          )
        }
        const scores = await getHybridContentRecommendations(productId, limit)
        const products = await prisma.product.findMany({
          where: {
            id: { in: scores.map((s) => s.productId) },
            isActive: true,
          },
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
              select: { id: true, url: true, alt: true },
            },
          },
        })
        recommendations = { scores, products }
        break
      }

      case 'trending-category': {
        if (!categoryId) {
          return NextResponse.json(
            {
              error: 'Category ID required',
              message: 'categoryId is required for trending by category',
            },
            { status: 400 },
          )
        }
        const trending = await getTrendingByCategory(categoryId, limit, days)
        const products = await prisma.product.findMany({
          where: {
            id: { in: trending.map((t) => t.productId) },
            isActive: true,
          },
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
              select: { id: true, url: true, alt: true },
            },
          },
        })
        recommendations = { trending, products }
        break
      }

      case 'hot-deals': {
        const hotDeals = await getHotDeals(limit, days)
        const products = await prisma.product.findMany({
          where: {
            id: { in: hotDeals.map((t) => t.productId) },
            isActive: true,
          },
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
              select: { id: true, url: true, alt: true },
            },
          },
        })
        recommendations = { hotDeals, products }
        break
      }

      case 'new-trending': {
        const newTrending = await getNewAndTrending(limit, 30, days)
        const products = await prisma.product.findMany({
          where: {
            id: { in: newTrending.map((t) => t.productId) },
            isActive: true,
          },
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
              select: { id: true, url: true, alt: true },
            },
          },
        })
        recommendations = { newTrending, products }
        break
      }

      case 'rising-stars': {
        const risingStars = await getRisingStars(limit, days)
        const products = await prisma.product.findMany({
          where: {
            id: { in: risingStars.map((t) => t.productId) },
            isActive: true,
          },
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
              select: { id: true, url: true, alt: true },
            },
          },
        })
        recommendations = { risingStars, products }
        break
      }

      default:
        recommendations = await getTrendingProducts(limit, days)
    }

    return NextResponse.json({
      type,
      recommendations,
      limit,
      ...(productId && { productId }),
      ...(categoryId && { categoryId }),
      ...(days && type.includes('trending') && { days }),
    })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    )
  }
}
