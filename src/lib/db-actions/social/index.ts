/**
 * Social DB Actions Module
 * Export all social database actions
 */

// Connections
export {
  default as connections,
  getUserConnections,
  connectSocialAccount,
  disconnectSocialAccount,
  refreshSocialToken,
  getValidAccessToken,
  getSocialUserInfo,
  hasActiveConnection,
} from './connections'
export type { SocialConnectionInput, SocialUserInfo } from './connections'

// Posts
export {
  default as posts,
  createSocialPost,
  getUserPosts,
  getPostById,
  updatePost,
  deletePost,
  retryPost,
  getPostAnalytics,
  processScheduledPosts,
} from './posts'
export type { CreatePostInput, UpdatePostInput, SocialPost, SocialPostAnalytics } from './posts'

// Campaigns
export {
  default as campaigns,
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
} from './campaigns'
export type {
  CreateCampaignInput,
  UpdateCampaignInput,
  CampaignListParams,
  SocialCampaign,
  CampaignAnalytics,
  PlatformAnalytics,
} from './campaigns'

// Tracking
export {
  default as tracking,
  trackSocialClick,
  trackSocialClickEvent,
  getProductSocialStats,
  getTrackingAnalytics,
} from './tracking'
export type { SocialTracking, ProductSocialStats } from './tracking'
