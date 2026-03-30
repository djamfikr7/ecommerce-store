/**
import { auth } from '@/lib/auth'
 * POST /api/automation/trigger
 * Manually trigger an automation workflow (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import {
  onNewProductCreated,
  onOrderMilestone,
  onLowStockAlert,
  onProductBecomesBestseller,
} from '@/lib/automation/workflows'
import { WorkflowTrigger, TriggerWorkflowResponse, WorkflowResult } from '@/types/automation'
import { ProductWithRelations } from '@/types/products'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { workflow, params } = body

    if (!workflow) {
      return NextResponse.json(
        { success: false, message: 'Workflow name is required' },
        { status: 400 }
      )
    }

    let result: WorkflowResult

    switch (workflow.toUpperCase()) {
      case 'PRODUCT_CREATED': {
        const productId = params?.productId
        if (!productId) {
          return NextResponse.json(
            { success: false, message: 'productId is required' },
            { status: 400 }
          )
        }

        const product = await prisma.product.findUnique({
          where: { id: productId },
          include: {
            category: true,
            tags: true,
            images: {
              take: 1,
              select: { url: true },
            },
          },
        })

        if (!product) {
          return NextResponse.json(
            { success: false, message: 'Product not found' },
            { status: 404 }
          )
        }

        result = await onNewProductCreated(
          product as unknown as ProductWithRelations,
          params
        )
        break
      }

      case 'ORDER_MILESTONE': {
        const userId = params?.userId
        const orderCount = params?.orderCount

        if (!userId || !orderCount) {
          return NextResponse.json(
            { success: false, message: 'userId and orderCount are required' },
            { status: 400 }
          )
        }

        result = await onOrderMilestone(userId, orderCount)
        break
      }

      case 'LOW_STOCK': {
        const productId = params?.productId
        if (!productId) {
          return NextResponse.json(
            { success: false, message: 'productId is required' },
            { status: 400 }
          )
        }

        const product = await prisma.product.findUnique({
          where: { id: productId },
          include: {
            category: true,
            tags: true,
            images: {
              take: 1,
              select: { url: true },
            },
          },
        })

        if (!product) {
          return NextResponse.json(
            { success: false, message: 'Product not found' },
            { status: 404 }
          )
        }

        result = await onLowStockAlert(
          product as unknown as ProductWithRelations
        )
        break
      }

      case 'BESTSELLER': {
        const productId = params?.productId
        const rank = params?.rank

        if (!productId || !rank) {
          return NextResponse.json(
            { success: false, message: 'productId and rank are required' },
            { status: 400 }
          )
        }

        const product = await prisma.product.findUnique({
          where: { id: productId },
          include: {
            category: true,
            tags: true,
            images: {
              take: 1,
              select: { url: true },
            },
          },
        })

        if (!product) {
          return NextResponse.json(
            { success: false, message: 'Product not found' },
            { status: 404 }
          )
        }

        result = await onProductBecomesBestseller(
          product as unknown as ProductWithRelations,
          rank
        )
        break
      }

      default:
        return NextResponse.json(
          { success: false, message: `Unknown workflow: ${workflow}` },
          { status: 400 }
        )
    }

    // Log the manual trigger
    await prisma.automationLog.create({
      data: {
        trigger: workflow,
        status: result.success ? 'SUCCESS' : 'FAILED',
        input: { params, triggeredBy: session.user.id },
        output: result,
      },
    })

    const response: TriggerWorkflowResponse = {
      success: result.success,
      message: result.message,
      result,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error triggering workflow:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/automation/trigger
 * List available workflows and their status
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const workflows = await prisma.automationWorkflow.findMany({
      orderBy: { name: 'asc' },
    })

    const availableWorkflows = [
      {
        id: 'PRODUCT_CREATED',
        name: 'Product Created',
        description: 'Triggered when a new product is created',
        params: ['productId', 'platforms', 'autoPost', 'reviewBeforePost'],
      },
      {
        id: 'ORDER_MILESTONE',
        name: 'Order Milestone',
        description: 'Triggered when user reaches order milestone (10, 25, 50, 100...)',
        params: ['userId', 'orderCount'],
      },
      {
        id: 'LOW_STOCK',
        name: 'Low Stock Alert',
        description: 'Triggered when product stock drops below threshold',
        params: ['productId'],
      },
      {
        id: 'BESTSELLER',
        name: 'Bestseller Recognition',
        description: 'Triggered when a product becomes a top seller (rank 1-3)',
        params: ['productId', 'rank'],
      },
    ]

    return NextResponse.json({
      success: true,
      data: {
        availableWorkflows,
        configuredWorkflows: workflows,
      },
    })
  } catch (error) {
    console.error('Error listing workflows:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
