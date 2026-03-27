/**
 * Automated Workflows
 * Event-driven workflows for social media automation
 */

import { prisma } from '@/lib/prisma'
import { generateProductPost, generateHashtags } from '@/lib/social/automation/content-generator'
import { SocialPlatform, WorkflowTrigger, SocialPostStatus } from '@/types/automation'
import { ProductWithRelations } from '@/types/products'

interface WorkflowResult {
  success: boolean
  postId?: string
  message: string
}

/**
 * Handler for new product creation
 * Automatically creates social post for new products
 */
export async function onNewProductCreated(
  product: ProductWithRelations,
  options?: {
    platforms?: SocialPlatform[]
    autoPost?: boolean
    reviewBeforePost?: boolean
    scheduledFor?: Date
  }
): Promise<WorkflowResult> {
  // Get active workflows for PRODUCT_CREATED trigger
  const workflows = await prisma.automationWorkflow.findMany({
    where: {
      trigger: 'PRODUCT_CREATED',
      isActive: true,
    },
  })

  if (workflows.length === 0) {
    return {
      success: true,
      message: 'No active workflows for product creation',
    }
  }

  // Use workflow config or defaults
  const platform = options?.platforms?.[0] || 'TWITTER'
  const autoPost = options?.autoPost ?? true
  const reviewBeforePost = options?.reviewBeforePost ?? true

  try {
    // Generate social content
    const content = await generateProductPost(product, platform)
    const hashtags = await generateHashtags(product, 5)
    const fullContent = `${content}\n\n${hashtags.join(' ')}`

    // Determine status based on workflow settings
    const status = autoPost && !reviewBeforePost ? 'SCHEDULED' : 'DRAFT'

    // Create the social post
    const post = await prisma.socialPost.create({
      data: {
        platform,
        content: fullContent,
        productId: product.id,
        status,
        scheduledFor: options?.scheduledFor || (status === 'SCHEDULED' ? new Date() : null),
        locale: 'en',
        metadata: {
          workflowTrigger: 'PRODUCT_CREATED',
          generatedAt: new Date().toISOString(),
          productName: product.name,
        },
      },
    })

    // Log the workflow execution
    await prisma.automationLog.create({
      data: {
        workflowId: workflows[0]?.id,
        trigger: 'PRODUCT_CREATED',
        status: 'SUCCESS',
        input: { productId: product.id },
        output: { postId: post.id, platform },
      },
    })

    // Update workflow run stats
    if (workflows[0]) {
      await prisma.automationWorkflow.update({
        where: { id: workflows[0].id },
        data: {
          lastRunAt: new Date(),
          runCount: { increment: 1 },
        },
      })
    }

    return {
      success: true,
      postId: post.id,
      message: `Social post created for product: ${product.name}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Log the failure
    await prisma.automationLog.create({
      data: {
        trigger: 'PRODUCT_CREATED',
        status: 'FAILED',
        input: { productId: product.id },
        error: errorMessage,
      },
    })

    return {
      success: false,
      message: `Failed to create social post: ${errorMessage}`,
    }
  }
}

/**
 * Handler for order milestone achievements
 * Posts thank-you messages when users reach order milestones
 */
export async function onOrderMilestone(
  userId: string,
  orderCount: number
): Promise<WorkflowResult> {
  // Define milestone thresholds
  const milestones = [10, 25, 50, 100, 250, 500, 1000]

  if (!milestones.includes(orderCount)) {
    return {
      success: true,
      message: `Order count ${orderCount} is not a milestone`,
    }
  }

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  if (!user) {
    return {
      success: false,
      message: 'User not found',
    }
  }

  // Get user's social connections for auto-sharing
  const socialConnections = await prisma.socialConnection.findMany({
    where: {
      userId,
      isActive: true,
    },
    select: {
      platform: true,
    },
  })

  if (socialConnections.length === 0) {
    return {
      success: true,
      message: 'No connected social accounts for auto-share',
    }
  }

  // Generate milestone celebration content
  const milestoneMessage = generateMilestoneMessage(orderCount, user.name || 'Customer')

  const results: string[] = []

  for (const connection of socialConnections) {
    try {
      const post = await prisma.socialPost.create({
        data: {
          platform: connection.platform as SocialPlatform,
          content: milestoneMessage,
          userId,
          status: 'SCHEDULED',
          scheduledFor: new Date(), // Immediate posting
          locale: 'en',
          metadata: {
            workflowTrigger: 'ORDER_MILESTONE',
            milestone: orderCount,
            userId,
          },
        },
      })

      results.push(`${connection.platform}: ${post.id}`)
    } catch (error) {
      console.error(`Failed to create milestone post for ${connection.platform}:`, error)
    }
  }

  // Log the workflow
  await prisma.automationLog.create({
    data: {
      trigger: 'ORDER_MILESTONE',
      status: 'SUCCESS',
      input: { userId, orderCount },
      output: { postsCreated: results },
    },
  })

  return {
    success: true,
    message: `Milestone posts created for ${results.length} platforms`,
  }
}

/**
 * Handler for low stock alerts
 * Creates urgency posts when product stock is running low
 */
export async function onLowStockAlert(
  product: ProductWithRelations
): Promise<WorkflowResult> {
  // Check if workflow exists and is active
  const workflows = await prisma.automationWorkflow.findMany({
    where: {
      trigger: 'LOW_STOCK',
      isActive: true,
    },
  })

  // Generate urgency content
  const urgencyMessage = generateUrgencyMessage(product)

  // Create post to store's social accounts
  try {
    const post = await prisma.socialPost.create({
      data: {
        platform: 'TWITTER', // Default to Twitter for alerts
        content: urgencyMessage,
        productId: product.id,
        status: 'SCHEDULED',
        scheduledFor: new Date(),
        locale: 'en',
        metadata: {
          workflowTrigger: 'LOW_STOCK',
          stockQuantity: product.stockQuantity,
          threshold: product.lowStockThreshold,
        },
      },
    })

    // Log the workflow
    await prisma.automationLog.create({
      data: {
        workflowId: workflows[0]?.id,
        trigger: 'LOW_STOCK',
        status: 'SUCCESS',
        input: { productId: product.id, stockQuantity: product.stockQuantity },
        output: { postId: post.id },
      },
    })

    if (workflows[0]) {
      await prisma.automationWorkflow.update({
        where: { id: workflows[0].id },
        data: {
          lastRunAt: new Date(),
          runCount: { increment: 1 },
        },
      })
    }

    return {
      success: true,
      postId: post.id,
      message: `Low stock alert posted for ${product.name}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    await prisma.automationLog.create({
      data: {
        trigger: 'LOW_STOCK',
        status: 'FAILED',
        input: { productId: product.id },
        error: errorMessage,
      },
    })

    return {
      success: false,
      message: `Failed to create low stock alert: ${errorMessage}`,
    }
  }
}

/**
 * Handler for bestseller recognition
 * Celebrates products that become top sellers
 */
export async function onProductBecomesBestseller(
  product: ProductWithRelations,
  rank: number
): Promise<WorkflowResult> {
  // Only celebrate top 3
  if (rank > 3) {
    return {
      success: true,
      message: `Rank ${rank} does not qualify for bestseller celebration`,
    }
  }

  const celebrationMessage = generateBestsellerMessage(product, rank)

  try {
    // Post to multiple platforms
    const platforms: SocialPlatform[] = ['TWITTER', 'FACEBOOK']
    const createdPosts: string[] = []

    for (const platform of platforms) {
      const post = await prisma.socialPost.create({
        data: {
          platform,
          content: celebrationMessage,
          productId: product.id,
          status: 'SCHEDULED',
          scheduledFor: new Date(),
          locale: 'en',
          metadata: {
            workflowTrigger: 'BESTSELLER',
            rank,
          },
        },
      })

      createdPosts.push(post.id)
    }

    // Log the workflow
    await prisma.automationLog.create({
      data: {
        trigger: 'BESTSELLER',
        status: 'SUCCESS',
        input: { productId: product.id, rank },
        output: { postsCreated: createdPosts },
      },
    })

    return {
      success: true,
      message: `Bestseller celebration posted for ${product.name}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    await prisma.automationLog.create({
      data: {
        trigger: 'BESTSELLER',
        status: 'FAILED',
        input: { productId: product.id, rank },
        error: errorMessage,
      },
    })

    return {
      success: false,
      message: `Failed to create bestseller celebration: ${errorMessage}`,
    }
  }
}

/**
 * Generate milestone celebration message
 */
function generateMilestoneMessage(orderCount: number, customerName: string): string {
  const messages: Record<number, string> = {
    10: `A huge thank you to ${customerName} for their 10th order! We truly appreciate your continued support.`,
    25: `${customerName} just hit 25 orders with us! You're not just a customer, you're family. Thank you!`,
    50: `Incredible! ${customerName} has made 50 purchases from us. We're so grateful for your loyalty!`,
    100: `100 orders! ${customerName}, you're a legend! Thank you for being such an amazing customer.`,
    250: `Milestone alert! ${customerName} has reached 250 orders. We can't thank you enough!`,
    500: `${customerName} with 500 orders! You deserve a crown. Thank you for everything!`,
    1000: `1,000 orders from ${customerName}! This is unreal. Thank you from the bottom of our hearts!`,
  }

  return messages[orderCount] || `Thank you ${customerName} for your loyalty!`
}

/**
 * Generate urgency message for low stock
 */
function generateUrgencyMessage(product: ProductWithRelations): string {
  const urgencyLevel = product.stockQuantity <= 2 ? 'almost gone!' : 'selling fast!'

  return `${product.name} is ${urgencyLevel} Only ${product.stockQuantity} left in stock! Grab yours before it's gone.

Shop now: /products/${product.slug}

#${product.category?.name || 'Shop'} #LimitedStock #${product.tags[0]?.name || 'Sale'}`
}

/**
 * Generate bestseller celebration message
 */
function generateBestsellerMessage(product: ProductWithRelations, rank: number): string {
  const rankText = rank === 1 ? '#1' : rank === 2 ? '#2' : '#3'

  return `We're thrilled to announce that ${product.name} has become our ${rankText} bestseller!

Thank you to everyone who made this happen. This product is flying off the shelves!

Shop the bestseller: /products/${product.slug}

#Bestseller #${product.category?.name || 'Popular'} #ThankYou`
}

/**
 * Check if product is low stock and trigger workflow if needed
 */
export async function checkAndTriggerLowStockWorkflow(productId: string): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      tags: true,
    },
  })

  if (!product) return

  // Check if below threshold
  if (product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold) {
    // Check if we already posted about this recently (within 24 hours)
    const recentPost = await prisma.socialPost.findFirst({
      where: {
        productId,
        metadata: {
          path: ['workflowTrigger'],
          equals: 'LOW_STOCK',
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    })

    if (!recentPost) {
      await onLowStockAlert(product as unknown as ProductWithRelations)
    }
  }
}

/**
 * Get workflow execution history
 */
export async function getWorkflowHistory(
  trigger?: WorkflowTrigger,
  limit: number = 50
): Promise<Array<{
  id: string
  trigger: string
  status: string
  input: unknown
  output: unknown
  error: string | null
  createdAt: Date
}>> {
  const where: Record<string, unknown> = {}
  if (trigger) {
    where.trigger = trigger
  }

  const logs = await prisma.automationLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return logs
}

export default {
  onNewProductCreated,
  onOrderMilestone,
  onLowStockAlert,
  onProductBecomesBestseller,
  checkAndTriggerLowStockWorkflow,
  getWorkflowHistory,
}
