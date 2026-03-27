/**
 * Social Connection Database Actions
 * Manage user social media account connections
 */

import { prisma } from '@/lib/db'
import { getProvider } from '@/lib/social/providers'
import crypto from 'crypto'

// Encryption key from environment
const ENCRYPTION_KEY = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY || 'default-key-change-in-production!'
const IV_LENGTH = 16

export interface SocialConnectionInput {
  userId: string
  provider: string
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
}

export interface SocialUserInfo {
  id: string
  name: string
  email?: string
  avatar?: string
  username?: string
  provider: string
}

/**
 * Encrypt token for secure storage
 */
function encryptToken(token: string): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(token, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return `${iv.toString('hex')}:${encrypted}`
}

/**
 * Decrypt token for use
 */
function decryptToken(encryptedToken: string): string {
  try {
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const [ivHex, encrypted] = encryptedToken.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch {
    throw new Error('Failed to decrypt token')
  }
}

/**
 * Get all social connections for a user
 */
export async function getUserConnections(userId: string) {
  const connections = await prisma.socialConnection.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  // Return connections without decrypted tokens (security)
  return connections.map((conn) => ({
    id: conn.id,
    userId: conn.userId,
    provider: conn.provider,
    providerUserId: conn.providerUserId,
    username: conn.username,
    displayName: conn.displayName,
    avatarUrl: conn.avatarUrl,
    email: conn.email,
    isActive: conn.isActive,
    createdAt: conn.createdAt,
    updatedAt: conn.updatedAt,
  }))
}

/**
 * Connect a social media account to a user
 */
export async function connectSocialAccount(
  userId: string,
  provider: string,
  accessToken: string,
  refreshToken?: string,
  expiresAt?: Date
) {
  const providerConfig = getProvider(provider)
  if (!providerConfig) {
    throw new Error(`Unsupported provider: ${provider}`)
  }

  // Verify token by fetching user info
  const userInfo = await getSocialUserInfo(provider, accessToken)

  // Encrypt tokens for storage
  const encryptedAccessToken = encryptToken(accessToken)
  const encryptedRefreshToken = refreshToken ? encryptToken(refreshToken) : null

  // Create or update connection
  const connection = await prisma.socialConnection.upsert({
    where: {
      userId_provider: {
        userId,
        provider,
      },
    },
    update: {
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      expiresAt,
      providerUserId: userInfo.id,
      username: userInfo.username,
      displayName: userInfo.name,
      avatarUrl: userInfo.avatar,
      email: userInfo.email,
      isActive: true,
      updatedAt: new Date(),
    },
    create: {
      userId,
      provider,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      expiresAt,
      providerUserId: userInfo.id,
      username: userInfo.username,
      displayName: userInfo.name,
      avatarUrl: userInfo.avatar,
      email: userInfo.email,
      isActive: true,
    },
  })

  return {
    id: connection.id,
    userId: connection.userId,
    provider: connection.provider,
    providerUserId: connection.providerUserId,
    username: connection.username,
    displayName: connection.displayName,
    avatarUrl: connection.avatarUrl,
    email: connection.email,
    isActive: connection.isActive,
    createdAt: connection.createdAt,
    updatedAt: connection.updatedAt,
  }
}

/**
 * Disconnect a social media account
 */
export async function disconnectSocialAccount(userId: string, provider: string) {
  const connection = await prisma.socialConnection.findUnique({
    where: {
      userId_provider: {
        userId,
        provider,
      },
    },
  })

  if (!connection) {
    throw new Error('Connection not found')
  }

  // Try to revoke token at provider
  try {
    const providerConfig = getProvider(provider)
    if (providerConfig?.revokeUrl) {
      const decryptedToken = decryptToken(connection.accessToken)
      await revokeToken(provider, decryptedToken)
    }
  } catch (error) {
    console.error(`Failed to revoke ${provider} token:`, error)
    // Continue with disconnect even if revocation fails
  }

  // Delete the connection
  await prisma.socialConnection.delete({
    where: { id: connection.id },
  })
}

/**
 * Revoke token at provider
 */
async function revokeToken(provider: string, token: string): Promise<void> {
  const providerConfig = getProvider(provider)
  if (!providerConfig?.revokeUrl) return

  await fetch(providerConfig.revokeUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `token=${encodeURIComponent(token)}`,
  })
}

/**
 * Refresh an expired access token
 */
export async function refreshSocialToken(userId: string, provider: string): Promise<string> {
  const connection = await prisma.socialConnection.findUnique({
    where: {
      userId_provider: {
        userId,
        provider,
      },
    },
  })

  if (!connection) {
    throw new Error('Connection not found')
  }

  if (!connection.refreshToken) {
    throw new Error('No refresh token available')
  }

  const providerConfig = getProvider(provider)
  if (!providerConfig) {
    throw new Error(`Unsupported provider: ${provider}`)
  }

  const decryptedRefreshToken = decryptToken(connection.refreshToken)

  // Refresh the token
  const response = await fetch(providerConfig.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: decryptedRefreshToken,
      client_id: process.env[`${provider.toUpperCase()}_CLIENT_ID`] || '',
      client_secret: process.env[`${provider.toUpperCase()}_CLIENT_SECRET`] || '',
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.statusText}`)
  }

  const data = await response.json()
  const newAccessToken = data.access_token

  // Update stored token
  const encryptedToken = encryptToken(newAccessToken)
  await prisma.socialConnection.update({
    where: { id: connection.id },
    data: {
      accessToken: encryptedToken,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
      updatedAt: new Date(),
    },
  })

  return newAccessToken
}

/**
 * Get valid access token (refresh if needed)
 */
export async function getValidAccessToken(userId: string, provider: string): Promise<string> {
  const connection = await prisma.socialConnection.findUnique({
    where: {
      userId_provider: {
        userId,
        provider,
      },
    },
  })

  if (!connection) {
    throw new Error('Connection not found')
  }

  if (!connection.isActive) {
    throw new Error('Connection is not active')
  }

  // Check if token is expired
  if (connection.expiresAt && connection.expiresAt < new Date()) {
    return refreshSocialToken(userId, provider)
  }

  return decryptToken(connection.accessToken)
}

/**
 * Fetch user profile from provider API
 */
export async function getSocialUserInfo(provider: string, accessToken: string): Promise<SocialUserInfo> {
  const providerConfig = getProvider(provider)
  if (!providerConfig) {
    throw new Error(`Unsupported provider: ${provider}`)
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
  }

  let userInfo: SocialUserInfo

  switch (provider) {
    case 'google':
      const googleRes = await fetch(providerConfig.userInfoUrl, { headers })
      const googleData = await googleRes.json()
      userInfo = {
        id: googleData.id || googleData.sub,
        name: googleData.name || '',
        email: googleData.email,
        avatar: googleData.picture,
        provider,
      }
      break

    case 'facebook':
      const fbRes = await fetch(`${providerConfig.userInfoUrl}?fields=id,name,email,picture`, { headers })
      const fbData = await fbRes.json()
      userInfo = {
        id: fbData.id,
        name: fbData.name || '',
        email: fbData.email,
        avatar: fbData.picture?.data?.url,
        username: fbData.id,
        provider,
      }
      break

    case 'twitter':
      const twRes = await fetch(`${providerConfig.userInfoUrl}?user.fields=name,username,profile_image_url`, { headers })
      const twData = await twRes.json()
      userInfo = {
        id: twData.data?.id,
        name: twData.data?.name || '',
        username: twData.data?.username,
        avatar: twData.data?.profile_image_url,
        provider,
      }
      break

    case 'instagram':
      // Instagram uses Facebook Graph API
      const igRes = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,username,account_type,profile_picture_url&access_token=${accessToken}`)
      const igData = await igRes.json()
      userInfo = {
        id: igData.id,
        name: igData.username || '',
        username: igData.username,
        avatar: igData.profile_picture_url,
        provider,
      }
      break

    case 'linkedin':
      const liRes = await fetch(providerConfig.userInfoUrl, { headers })
      const liData = await liRes.json()
      userInfo = {
        id: liData.sub,
        name: liData.name || '',
        email: liData.email,
        avatar: liData.picture,
        username: liData.sub,
        provider,
      }
      break

    case 'pinterest':
      const pinRes = await fetch(providerConfig.userInfoUrl, { headers })
      const pinData = await pinRes.json()
      userInfo = {
        id: pinData.id,
        name: pinData.profile?.display_name || '',
        username: pinData.username,
        avatar: pinData.profile?.image,
        provider,
      }
      break

    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }

  return userInfo
}

/**
 * Check if user has an active connection for a provider
 */
export async function hasActiveConnection(userId: string, provider: string): Promise<boolean> {
  const connection = await prisma.socialConnection.findUnique({
    where: {
      userId_provider: {
        userId,
        provider,
      },
    },
  })

  return connection?.isActive ?? false
}

export default {
  getUserConnections,
  connectSocialAccount,
  disconnectSocialAccount,
  refreshSocialToken,
  getValidAccessToken,
  getSocialUserInfo,
  hasActiveConnection,
}
