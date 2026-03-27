/**
 * Social Media Module
 * Export all social media functionality
 */

// Providers
export { default as providers, getProvider, getAllProviders, getPostingProviders } from './providers'
export type { SocialProvider } from './providers'

// Share functionality
export {
  default as share,
  generateShareUrl,
  generateShareText,
  generateOgTags,
  generateAllShareUrls,
  generateTwitterCard,
  getShareContentForClipboard,
} from './share'
export type { ShareableProduct, OgTags, SocialPlatform } from './share'

// Publishers
export {
  default as publishers,
  publishToTwitter,
  publishToFacebook,
  publishToInstagram,
  publishToLinkedIn,
  publishToPinterest,
  publishToPlatform,
} from './publishers'
export type {
  TwitterPostResult,
  FacebookPostResult,
  InstagramPostResult,
  LinkedInPostResult,
  PinterestPostResult,
} from './publishers'
