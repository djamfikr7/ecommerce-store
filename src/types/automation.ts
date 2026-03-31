/**
 * Automation Types
 * Type definitions for social media automation workflows
 */

import { Prisma } from '@prisma/client'

// Re-export Prisma enums
export { SocialPlatform, SocialPostStatus, SocialCampaignStatus } from '@prisma/client'

// ============================================
// Workflow Types
// ============================================

export type WorkflowTrigger =
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'ORDER_MILESTONE'
  | 'LOW_STOCK'
  | 'BESTSELLER'
  | 'MANUAL'

export type WorkflowAction =
  | 'POST_TO_SOCIAL'
  | 'SCHEDULE_POST'
  | 'SEND_NOTIFICATION'
  | 'UPDATE_PRODUCT'
  | 'GENERATE_REPORT'

export interface AutomationWorkflow {
  id: string
  name: string
  trigger: WorkflowTrigger
  action: WorkflowAction
  config: WorkflowConfig
  isActive: boolean
  lastRunAt: Date | null
  runCount: number
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowConfig {
  platforms?: SocialPlatform[]
  autoPost?: boolean
  reviewBeforePost?: boolean
  delayMinutes?: number
  hashtags?: string[]
  mentionUsers?: string[]
  targetAudience?: string
  campaignId?: string
}

export interface WorkflowExecution {
  workflowId: string
  trigger: WorkflowTrigger
  params: Record<string, unknown>
  result?: WorkflowResult
  error?: string
  duration: number
}

export interface WorkflowResult {
  success: boolean
  postsCreated?: string[]
  notificationsSent?: number
  data?: Record<string, unknown>
}

// ============================================
// Scheduled Task Types
// ============================================

export type ScheduledTaskType =
  | 'POST'
  | 'ANALYTICS_SYNC'
  | 'ENGAGEMENT'
  | 'LOW_STOCK_CHECK'
  | 'CAMPAIGN_UPDATE'

export type ScheduledTaskStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'

export interface ScheduledTask {
  id: string
  type: ScheduledTaskType
  payload: ScheduledTaskPayload
  scheduledFor: Date
  status: ScheduledTaskStatus
  attempts: number
  maxAttempts: number
  error?: string | null
  completedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface ScheduledTaskPayload {
  postId?: string
  campaignId?: string
  productId?: string
  userId?: string
  options?: Record<string, unknown>
}

// ============================================
// Automation Log Types
// ============================================

export type AutomationLogStatus = 'SUCCESS' | 'FAILED' | 'SKIPPED'

export interface AutomationLog {
  id: string
  workflowId?: string | null
  trigger: string
  status: AutomationLogStatus
  input?: Record<string, unknown> | null
  output?: Record<string, unknown> | null
  error?: string | null
  duration?: number | null
  createdAt: Date
}

// ============================================
// Content Template Types
// ============================================

export type SocialPlatform = 'FACEBOOK' | 'INSTAGRAM' | 'TWITTER' | 'LINKEDIN' | 'PINTEREST' | 'TIKTOK'

export interface ContentTemplate {
  id: string
  name: string
  platform: SocialPlatform
  template: string
  variables: string[]
  category?: string | null
  isActive: boolean
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

export interface GeneratedContent {
  content: string
  hashtags: string[]
  mediaUrls?: string[]
  platform: SocialPlatform
  characterCount: number
  qualityScore?: number
}

// ============================================
// Trigger Request/Response Types
// ============================================

export interface TriggerWorkflowRequest {
  workflow: string
  params: Record<string, unknown>
}

export interface TriggerWorkflowResponse {
  success: boolean
  executionId?: string
  message: string
  result?: WorkflowResult
}

// ============================================
// CRON Job Types
// ============================================

export interface CronJobResult {
  job: string
  success: boolean
  processed: number
  failed: number
  errors?: string[]
  duration: number
}

export interface ProcessScheduledPostsResult extends CronJobResult {
  job: 'process-scheduled-posts'
  published: number
  skipped: number
}

export interface SyncAnalyticsResult extends CronJobResult {
  job: 'sync-social-analytics'
  postsUpdated: number
  campaignsUpdated: number
}

// ============================================
// Platform-specific Types
// ============================================

export interface PlatformLimits {
  maxCharacters: number
  maxHashtags: number
  supportsImages: boolean
  supportsVideos: boolean
  supportsLinks: boolean
}

export const PLATFORM_LIMITS: Record<SocialPlatform, PlatformLimits> = {
  FACEBOOK: {
    maxCharacters: 63206,
    maxHashtags: 30,
    supportsImages: true,
    supportsVideos: true,
    supportsLinks: true,
  },
  INSTAGRAM: {
    maxCharacters: 2200,
    maxHashtags: 30,
    supportsImages: true,
    supportsVideos: true,
    supportsLinks: false,
  },
  TWITTER: {
    maxCharacters: 280,
    maxHashtags: 10,
    supportsImages: true,
    supportsVideos: true,
    supportsLinks: true,
  },
  LINKEDIN: {
    maxCharacters: 3000,
    maxHashtags: 30,
    supportsImages: true,
    supportsVideos: true,
    supportsLinks: true,
  },
  PINTEREST: {
    maxCharacters: 500,
    maxHashtags: 20,
    supportsImages: true,
    supportsVideos: true,
    supportsLinks: true,
  },
  TIKTOK: {
    maxCharacters: 2200,
    maxHashtags: 30,
    supportsImages: false,
    supportsVideos: true,
    supportsLinks: false,
  },
}

// ============================================
// Prisma Type Helpers
// ============================================

export type SocialPostBase = Prisma.SocialPostGetPayload<Record<string, never>>
export type SocialCampaignBase = Prisma.SocialCampaignGetPayload<Record<string, never>>
export type SocialCommentBase = Prisma.SocialCommentGetPayload<Record<string, never>>
export type AutomationWorkflowBase = Prisma.AutomationWorkflowGetPayload<Record<string, never>>
export type AutomationLogBase = Prisma.AutomationLogGetPayload<Record<string, never>>
export type ContentTemplateBase = Prisma.ContentTemplateGetPayload<Record<string, never>>
export type ScheduledTaskBase = Prisma.ScheduledTaskGetPayload<Record<string, never>>
