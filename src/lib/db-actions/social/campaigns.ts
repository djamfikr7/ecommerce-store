/**
 * Social Campaign Database Actions
 * Manage social media marketing campaigns
 */

import { prisma } from '@/lib/db'

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
export type CampaignGoal = 'awareness' | 'traffic' | 'sales' | 'engagement'
export type SocialPlatform = 'twitter' | 'facebook' | 'instagram' | 'linkedin'

export interface CreateCampaignInput {
  name: string
  description?: string
  platforms: SocialPlatform[]
  productIds?: string[]
  goal?: CampaignGoal
  startDate?: Date
  endDate?: Date
}

export interface UpdateCampaignInput {
  name?: string
  description?: string
  platforms?: SocialPlatform[]
  productIds?: string[]
  goal?: CampaignGoal
  status?: CampaignStatus
  startDate?: Date
  endDate?: Date
}

export interface CampaignListParams {
  status?: CampaignStatus
  platform?: SocialPlatform
  page?: number
  pageSize?: number
  sortBy?: 'createdAt' | 'startDate' | 'name'
  sortOrder?: 'asc' | 'desc'
}

export interface SocialCampaign {
  id: string
  name: string
  description?: string
  platforms: SocialPlatform[]
  status: CampaignStatus
  goal?: CampaignGoal
  startDate?: Date
  endDate?: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
  postCount?: number
  products?: { id: string; name: string; slug: string }[]
}

export interface CampaignAnalytics {
  campaignId: string
  totalPosts: number
  publishedPosts: number
  totalLikes: number
  totalComments: number
  totalShares: number
  totalImpressions: number
  totalClicks: number
  engagementRate: number
  byPlatform: Record<SocialPlatform, PlatformAnalytics>
  period: { start: Date; end: Date }
}

export interface PlatformAnalytics {
  posts: number
  likes: number
  comments: number
  shares: number
  impressions: number
  clicks: number
}

/**
 * Create a new campaign
 */
export async function createCampaign(data: CreateCampaignInput, adminId: string): Promise<SocialCampaign> {
  const campaign = await prisma.socialCampaign.create({
    data: {
      name: data.name,
      description: data.description,
      platforms: data.platforms,
      status: 'DRAFT',
      goal: data.goal,
      startDate: data.startDate,
      endDate: data.endDate,
      createdBy: adminId,
      products: data.productIds?.length
        ? {
            connect: data.productIds.map((id) => ({ id })),
          }
        : undefined,
    },
    include: {
      products: {
        select: { id: true, name: true, slug: true },
      },
    },
  })

  return formatCampaign(campaign)
}

/**
 * Get paginated campaigns
 */
export async function getCampaigns(
  params: CampaignListParams = {}
): Promise<{ campaigns: SocialCampaign[]; total: number; page: number; pageSize: number }> {
  const {
    status,
    platform,
    page = 1,
    pageSize = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params

  const where: any = {}
  if (status) where.status = status
  if (platform) where.platforms = { has: platform }

  const skip = (page - 1) * pageSize
  const orderBy = { [sortBy]: sortOrder }

  const [campaigns, total] = await Promise.all([
    prisma.socialCampaign.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        products: { select: { id: true, name: true, slug: true } },
        posts: { select: { id: true }, where: { status: 'PUBLISHED' } },
      },
    }),
    prisma.socialCampaign.count({ where }),
  ])

  return {
    campaigns: campaigns.map((c) => ({
      ...formatCampaign(c),
      postCount: c.posts.length,
    })),
    total,
    page,
    pageSize,
  }
}

/**
 * Get campaign by ID with full details
 */
export async function getCampaignById(id: string): Promise<SocialCampaign | null> {
  const campaign = await prisma.socialCampaign.findUnique({
    where: { id },
    include: {
      products: { select: { id: true, name: true, slug: true } },
      posts: {
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { id: true, name: true, slug: true } } },
      },
    },
  })

  if (!campaign) return null

  return {
    ...formatCampaign(campaign),
    products: campaign.products,
    postCount: campaign.posts.length,
  }
}

/**
 * Update campaign
 */
export async function updateCampaign(
  id: string,
  data: UpdateCampaignInput,
  adminId: string
): Promise<SocialCampaign> {
  const existing = await prisma.socialCampaign.findUnique({ where: { id } })
  if (!existing) throw new Error('Campaign not found')

  const updateData: any = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.platforms !== undefined) updateData.platforms = data.platforms
  if (data.goal !== undefined) updateData.goal = data.goal
  if (data.status !== undefined) updateData.status = data.status
  if (data.startDate !== undefined) updateData.startDate = data.startDate
  if (data.endDate !== undefined) updateData.endDate = data.endDate

  // Handle product connections
  if (data.productIds !== undefined) {
    updateData.products = {
      set: data.productIds.map((pid) => ({ id: pid })),
    }
  }

  const campaign = await prisma.socialCampaign.update({
    where: { id },
    data: updateData,
    include: {
      products: { select: { id: true, name: true, slug: true } },
    },
  })

  return formatCampaign(campaign)
}

/**
 * Delete campaign
 */
export async function deleteCampaign(id: string, adminId: string): Promise<void> {
  const existing = await prisma.socialCampaign.findUnique({ where: { id } })
  if (!existing) throw new Error('Campaign not found')

  // Use transaction to ensure atomicity
  await prisma.$transaction([
    // Unlink posts from campaign
    prisma.socialPost.updateMany({
      where: { campaignId: id },
      data: { campaignId: null, isCampaignPost: false },
    }),
    // Delete campaign
    prisma.socialCampaign.delete({ where: { id } }),
  ])
}

/**
 * Get campaign analytics
 */
export async function getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
  const campaign = await prisma.socialCampaign.findUnique({
    where: { id: campaignId },
    include: {
      posts: {
        where: { status: 'PUBLISHED' },
        select: {
          platform: true,
          engagement: true,
          publishedAt: true,
        },
      },
    },
  })

  if (!campaign) throw new Error('Campaign not found')

  // Aggregate stats
  const totalLikes = campaign.posts.reduce((sum, p) => sum + (p.engagement?.likes || 0), 0)
  const totalComments = campaign.posts.reduce((sum, p) => sum + (p.engagement?.comments || 0), 0)
  const totalShares = campaign.posts.reduce((sum, p) => sum + (p.engagement?.shares || 0), 0)
  const totalImpressions = campaign.posts.reduce((sum, p) => sum + (p.engagement?.impressions || 0), 0)
  const totalClicks = campaign.posts.reduce((sum, p) => sum + (p.engagement?.clicks || 0), 0)

  // Stats by platform
  const byPlatform: Record<SocialPlatform, PlatformAnalytics> = {
    twitter: { posts: 0, likes: 0, comments: 0, shares: 0, impressions: 0, clicks: 0 },
    facebook: { posts: 0, likes: 0, comments: 0, shares: 0, impressions: 0, clicks: 0 },
    instagram: { posts: 0, likes: 0, comments: 0, shares: 0, impressions: 0, clicks: 0 },
    linkedin: { posts: 0, likes: 0, comments: 0, shares: 0, impressions: 0, clicks: 0 },
  }

  for (const post of campaign.posts) {
    const platform = post.platform as SocialPlatform
    if (byPlatform[platform]) {
      byPlatform[platform].posts++
      byPlatform[platform].likes += post.engagement?.likes || 0
      byPlatform[platform].comments += post.engagement?.comments || 0
      byPlatform[platform].shares += post.engagement?.shares || 0
      byPlatform[platform].impressions += post.engagement?.impressions || 0
      byPlatform[platform].clicks += post.engagement?.clicks || 0
    }
  }

  const totalEngagements = totalLikes + totalComments + totalShares
  const engagementRate = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0

  return {
    campaignId,
    totalPosts: campaign.posts.length,
    publishedPosts: campaign.posts.length,
    totalLikes,
    totalComments,
    totalShares,
    totalImpressions,
    totalClicks,
    engagementRate: Math.round(engagementRate * 100) / 100,
    byPlatform,
    period: {
      start: campaign.startDate || campaign.createdAt,
      end: campaign.endDate || new Date(),
    },
  }
}

/**
 * Activate a campaign
 */
export async function activateCampaign(id: string, adminId: string): Promise<SocialCampaign> {
  return updateCampaign(id, { status: 'ACTIVE' }, adminId)
}

/**
 * Pause a campaign
 */
export async function pauseCampaign(id: string, adminId: string): Promise<SocialCampaign> {
  return updateCampaign(id, { status: 'PAUSED' }, adminId)
}

/**
 * Complete a campaign
 */
export async function completeCampaign(id: string, adminId: string): Promise<SocialCampaign> {
  return updateCampaign(id, { status: 'COMPLETED' }, adminId)
}

/**
 * Get campaigns by product
 */
export async function getCampaignsByProduct(productId: string): Promise<SocialCampaign[]> {
  const campaigns = await prisma.socialCampaign.findMany({
    where: {
      products: { some: { id: productId } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return campaigns.map(formatCampaign)
}

/**
 * Format campaign for API response
 */
function formatCampaign(campaign: any): SocialCampaign {
  return {
    id: campaign.id,
    name: campaign.name,
    description: campaign.description,
    platforms: campaign.platforms,
    status: campaign.status,
    goal: campaign.goal,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    createdBy: campaign.createdBy,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
    products: campaign.products,
  }
}

export default {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  getCampaignAnalytics,
  activateCampaign,
  pauseCampaign,
  completeCampaign,
  getCampaignsByProduct,
}
