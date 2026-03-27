/**
 * Social Media Type Definitions
 * TypeScript types for social media features
 */

// ============================================================================
// Enums
// ============================================================================

export type SocialPlatform = 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'pinterest'

export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED'

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'

export type CampaignGoal = 'awareness' | 'traffic' | 'sales' | 'engagement'

export type ClickType = 'SHARE' | 'CLICK'

// ============================================================================
// Social Connection Types
// ============================================================================

export interface SocialConnection {
  id: string
  userId: string
  provider: string
  providerUserId: string
  username?: string
  displayName?: string
  avatarUrl?: string
  email?: string
  isActive: boolean
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface SocialProvider {
  id: string
  name: string
  authUrl: string
  tokenUrl: string
  userInfoUrl: string
  scopes: string[]
  revokeUrl?: string
}

export interface SocialUserInfo {
  id: string
  name: string
  email?: string
  avatar?: string
  username?: string
  provider: string
}

// ============================================================================
// Social Post Types
// ============================================================================

export interface SocialPostInput {
  content: string
  platform: SocialPlatform
  imageUrls?: string[]
  productId?: string
  scheduledFor?: string
  isCampaignPost?: boolean
  campaignId?: string
}

export interface SocialPost {
  id: string
  userId: string
  content: string
  platform: SocialPlatform
  status: PostStatus
  imageUrls: string[]
  productId?: string
  campaignId?: string
  platformPostId?: string
  platformPostUrl?: string
  publishedAt?: Date
  scheduledFor?: Date
  errorMessage?: string
  engagement?: PostEngagement
  isCampaignPost: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PostEngagement {
  likes: number
  comments: number
  shares: number
  impressions: number
  clicks: number
}

export interface SocialPostAnalytics {
  postId: string
  platform: SocialPlatform
  likes: number
  comments: number
  shares: number
  impressions: number
  clicks: number
  reach: number
  engagementRate: number
  fetchedAt: Date
}

export interface PostListResponse {
  posts: SocialPost[]
  total: number
  page: number
  pageSize: number
}

// ============================================================================
// Social Campaign Types
// ============================================================================

export interface CreateCampaignInput {
  name: string
  description?: string
  platforms: SocialPlatform[]
  productIds?: string[]
  goal?: CampaignGoal
  startDate?: string
  endDate?: string
}

export interface UpdateCampaignInput {
  name?: string
  description?: string
  platforms?: SocialPlatform[]
  productIds?: string[]
  goal?: CampaignGoal
  status?: CampaignStatus
  startDate?: string
  endDate?: string
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
  postCount?: number
  products?: ProductRef[]
  posts?: SocialPost[]
  createdAt: Date
  updatedAt: Date
}

export interface ProductRef {
  id: string
  name: string
  slug: string
}

export interface CampaignListResponse {
  campaigns: SocialCampaign[]
  total: number
  page: number
  pageSize: number
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
  period: {
    start: Date
    end: Date
  }
}

export interface PlatformAnalytics {
  posts: number
  likes: number
  comments: number
  shares: number
  impressions: number
  clicks: number
}

// ============================================================================
// Social Tracking Types
// ============================================================================

export interface SocialTracking {
  id: string
  platform: string
  productId?: string
  userId?: string
  clickId: string
  clickType: ClickType
  referrer?: string
  userAgent?: string
  ip?: string
  createdAt: Date
}

export interface ProductSocialStats {
  productId: string
  totalShares: number
  totalClicks: number
  sharesByPlatform: Record<string, number>
  clicksByPlatform: Record<string, number>
  recentActivity: {
    date: string
    shares: number
    clicks: number
  }[]
  topSharers: {
    platform: string
    count: number
  }[]
}

// ============================================================================
// Platform Post Result Types
// ============================================================================

export interface TwitterPostResult {
  postId: string
  postUrl: string
  text: string
}

export interface FacebookPostResult {
  postId: string
  postUrl: string
}

export interface InstagramPostResult {
  mediaId: string
  permalink: string
  id: string
}

export interface LinkedInPostResult {
  urn: string
  postUrl: string
}

export interface PinterestPostResult {
  id: string
  url: string
  boardUrl?: string
}

// ============================================================================
// Share Types
// ============================================================================

export interface ShareableProduct {
  name: string
  slug: string
  image?: string | null
  price?: string | number | null
  rating?: number
  description?: string
}

export interface OgTags {
  title: string
  description: string
  image: string | null
  url: string
  type: 'product' | 'website'
  price?: string
  currency?: string
}

export interface ShareUrls {
  twitter: string
  facebook: string
  pinterest: string
  linkedin: string
  whatsapp: string
  email: string
  copy: string
}

export interface ShareResponse {
  urls: ShareUrls
  text: string
  ogTags: OgTags
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export default {
  SocialPlatform,
  PostStatus,
  CampaignStatus,
  CampaignGoal,
  SocialConnection,
  SocialProvider,
  SocialUserInfo,
  SocialPost,
  SocialPostInput,
  SocialPostAnalytics,
  SocialCampaign,
  CreateCampaignInput,
  UpdateCampaignInput,
  CampaignAnalytics,
  PlatformAnalytics,
  SocialTracking,
  ProductSocialStats,
  TwitterPostResult,
  FacebookPostResult,
  InstagramPostResult,
  LinkedInPostResult,
  PinterestPostResult,
  ShareableProduct,
  OgTags,
  ShareUrls,
  ShareResponse,
  ApiResponse,
  PaginatedResponse,
}
