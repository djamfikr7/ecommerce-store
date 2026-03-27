/**
 * Social Media Provider Configurations
 * OAuth configurations for social platform integrations
 */

export interface SocialProvider {
  id: string
  name: string
  authUrl: string
  tokenUrl: string
  userInfoUrl: string
  scopes: string[]
  revokeUrl?: string
}

// Google OAuth (for social login, extend existing Google OAuth)
export const googleProvider: SocialProvider = {
  id: 'google',
  name: 'Google',
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
  scopes: ['email', 'profile'],
  revokeUrl: 'https://oauth2.googleapis.com/revoke',
}

// Facebook OAuth
export const facebookProvider: SocialProvider = {
  id: 'facebook',
  name: 'Facebook',
  authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
  tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
  userInfoUrl: 'https://graph.facebook.com/me',
  scopes: ['email', 'public_profile'],
  revokeUrl: 'https://graph.facebook.com/v18.0/me/permissions',
}

// Twitter/X OAuth 2.0
export const twitterProvider: SocialProvider = {
  id: 'twitter',
  name: 'Twitter',
  authUrl: 'https://twitter.com/i/oauth2/authorize',
  tokenUrl: 'https://api.twitter.com/2/oauth2/token',
  userInfoUrl: 'https://api.twitter.com/2/users/me',
  scopes: ['tweet.read', 'users.read', 'offline.access'],
  revokeUrl: 'https://api.twitter.com/2/oauth2/revoke',
}

// Instagram OAuth (uses Facebook Graph API)
export const instagramProvider: SocialProvider = {
  id: 'instagram',
  name: 'Instagram',
  authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
  tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
  userInfoUrl: 'https://graph.facebook.com/v18.0/me',
  scopes: ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement'],
}

// LinkedIn OAuth 2.0
export const linkedinProvider: SocialProvider = {
  id: 'linkedin',
  name: 'LinkedIn',
  authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
  tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
  userInfoUrl: 'https://api.linkedin.com/v2/userinfo',
  scopes: ['openid', 'profile', 'email', 'w_member_social'],
  revokeUrl: 'https://www.linkedin.com/oauth/v2/revoke',
}

// Pinterest OAuth 2.0
export const pinterestProvider: SocialProvider = {
  id: 'pinterest',
  name: 'Pinterest',
  authUrl: 'https://www.pinterest.com/oauth/',
  tokenUrl: 'https://api.pinterest.com/v5/oauth/token',
  userInfoUrl: 'https://api.pinterest.com/v5/user_account',
  scopes: ['pins:read', 'pins:write', 'user_accounts:read'],
  revokeUrl: 'https://api.pinterest.com/v5/oauth/token',
}

const providers: Record<string, SocialProvider> = {
  google: googleProvider,
  facebook: facebookProvider,
  twitter: twitterProvider,
  instagram: instagramProvider,
  linkedin: linkedinProvider,
  pinterest: pinterestProvider,
}

/**
 * Get provider configuration by ID
 */
export function getProvider(id: string): SocialProvider | null {
  return providers[id.toLowerCase()] || null
}

/**
 * Get all supported providers
 */
export function getAllProviders(): SocialProvider[] {
  return Object.values(providers)
}

/**
 * Get provider IDs that support direct posting
 */
export function getPostingProviders(): string[] {
  return ['twitter', 'facebook', 'instagram', 'linkedin', 'pinterest']
}

export default providers
