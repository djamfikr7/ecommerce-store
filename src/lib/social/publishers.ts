/**
 * Social Media Publishers
 * Publish content to various social media platforms
 */

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

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries: number = MAX_RETRIES): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on certain errors
      if (lastError.message.includes('401') || lastError.message.includes('403')) {
        throw lastError
      }

      if (attempt < maxRetries) {
        await sleep(RETRY_DELAY_MS * Math.pow(2, attempt))
      }
    }
  }

  throw lastError
}

/**
 * Upload media to Twitter and return media IDs
 */
async function uploadTwitterMedia(imageUrls: string[], accessToken: string): Promise<string[]> {
  const mediaIds: string[] = []

  for (const imageUrl of imageUrls.slice(0, 4)) {
    // Twitter allows max 4 images
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()

    const uploadResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: arrayBuffer,
    })

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text()
      throw new Error(`Failed to upload media to Twitter: ${error}`)
    }

    const data = await uploadResponse.json()
    mediaIds.push(data.media_id_string)
  }

  return mediaIds
}

/**
 * Publish to Twitter/X
 */
export async function publishToTwitter(
  content: string,
  imageUrls: string[] = [],
  accessToken: string,
): Promise<TwitterPostResult> {
  return withRetry(async () => {
    let mediaIds: string[] = []

    // Upload images if provided
    if (imageUrls.length > 0) {
      mediaIds = await uploadTwitterMedia(imageUrls, accessToken)
    }

    const body: any = { text: content }
    if (mediaIds.length > 0) {
      body.media = { media_ids: mediaIds }
    }

    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Twitter API error: ${error}`)
    }

    const data = await response.json()
    const tweetId = data.data?.id

    return {
      postId: tweetId,
      postUrl: `https://twitter.com/i/status/${tweetId}`,
      text: content,
    }
  })
}

/**
 * Upload image to Facebook
 */
async function uploadFacebookPhoto(imageUrl: string, accessToken: string): Promise<string> {
  const response = await fetch(imageUrl)
  const blob = await response.blob()
  const formData = new FormData()
  formData.append('source', blob, 'image.jpg')
  formData.append('access_token', accessToken)

  const uploadResponse = await fetch('https://graph.facebook.com/v18.0/me/photos', {
    method: 'POST',
    body: formData,
  })

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text()
    throw new Error(`Failed to upload photo to Facebook: ${error}`)
  }

  const data = await uploadResponse.json()
  return data.id
}

/**
 * Publish to Facebook
 */
export async function publishToFacebook(
  content: string,
  imageUrls: string[] = [],
  accessToken: string,
): Promise<FacebookPostResult> {
  return withRetry(async () => {
    const postData: any = {
      message: content,
      access_token: accessToken,
    }

    // If images are provided, upload first and add to post
    if (imageUrls.length > 0) {
      const photoId = await uploadFacebookPhoto(imageUrls[0], accessToken)
      postData.attachement_url = imageUrls[0]
      // Or use linked_photo_ids for multiple images
      if (imageUrls.length > 1) {
        const photoIds = [photoId]
        for (let i = 1; i < imageUrls.length; i++) {
          const id = await uploadFacebookPhoto(imageUrls[i], accessToken)
          photoIds.push(id)
        }
        postData.linked_photo_ids = photoIds
      }
    }

    const response = await fetch('https://graph.facebook.com/v18.0/me/feed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Facebook API error: ${error}`)
    }

    const data = await response.json()
    const postId = data.id

    // Get the post URL
    const postUrl = `https://www.facebook.com/${postId}`

    return {
      postId,
      postUrl,
    }
  })
}

/**
 * Publish to Instagram (requires Facebook Business account)
 */
export async function publishToInstagram(
  content: string,
  imageUrl: string,
  accessToken: string,
): Promise<InstagramPostResult> {
  return withRetry(async () => {
    // First, get Instagram Business Account ID
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`,
    )
    const accountsData = await accountsResponse.json()

    if (!accountsData.data || accountsData.data.length === 0) {
      throw new Error(
        'No Facebook Pages found. Instagram publishing requires a connected Facebook Page.',
      )
    }

    const pageId = accountsData.data[0].id

    // Get Instagram Account ID
    const igResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`,
    )
    const igData = await igResponse.json()

    if (!igData.instagram_business_account) {
      throw new Error('No Instagram Business account connected to this Facebook Page.')
    }

    const igAccountId = igData.instagram_business_account.id

    // Download and upload image to Facebook
    const imageResponse = await fetch(imageUrl)
    const imageBlob = await imageResponse.blob()
    const imageBuffer = await imageBlob.arrayBuffer()

    // Create container for the image
    const containerResponse = await fetch(`https://graph.facebook.com/v18.0/${igAccountId}/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: content,
        access_token: accessToken,
      }),
    })

    if (!containerResponse.ok) {
      const error = await containerResponse.text()
      throw new Error(`Failed to create Instagram media container: ${error}`)
    }

    const containerData = await containerResponse.json()
    const creationId = containerData.id

    // Publish the media
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: accessToken,
        }),
      },
    )

    if (!publishResponse.ok) {
      const error = await publishResponse.text()
      throw new Error(`Failed to publish Instagram media: ${error}`)
    }

    const publishData = await publishResponse.json()

    // Get permalink
    const permalinkResponse = await fetch(
      `https://graph.facebook.com/v18.0/${publishData.id}?fields=permalink&access_token=${accessToken}`,
    )
    const permalinkData = await permalinkResponse.json()

    return {
      mediaId: publishData.id,
      permalink: permalinkData.permalink || `https://www.instagram.com/p/${publishData.id}/`,
      id: publishData.id,
    }
  })
}

/**
 * Publish to LinkedIn
 */
export async function publishToLinkedIn(
  content: string,
  imageUrl?: string,
  accessToken?: string,
  authorUrn?: string,
): Promise<LinkedInPostResult> {
  return withRetry(async () => {
    if (!accessToken) {
      throw new Error('LinkedIn access token required')
    }

    // Get user profile to get author URN
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const profileData = await profileResponse.json()
    const authorId = profileData.sub

    // Use organization URN if provided, otherwise use person URN
    const author = authorUrn || `urn:li:person:${authorId}`

    const postContent: any = {
      author,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content,
          },
          shareMediaCategory: imageUrl ? 'IMAGE' : 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }

    // Add image if provided
    if (imageUrl) {
      // First upload the image
      const imageResponse = await fetch(imageUrl)
      const imageBlob = await imageResponse.blob()
      const imageBuffer = await imageBlob.arrayBuffer()

      // Register the image
      const registerResponse = await fetch(
        'https://api.linkedin.com/v2/assets?action=registerUpload',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: ['urn:li:digitalmediaRecipe:shareimage'],
              owner: author,
              serviceRelationships: [
                {
                  relationshipType: 'OWNER',
                  identifier: 'urn:li:userGeneratedContent',
                },
              ],
            },
          }),
        },
      )

      if (registerResponse.ok) {
        const registerData = await registerResponse.json()
        const uploadUrl = registerData.value.assetUploadRequest.uploadUrl
        const assetUrn = registerData.value.asset

        // Upload the image
        await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'image/jpeg',
          },
          body: imageBuffer,
        })

        postContent.specificContent['com.linkedin.ugc.ShareContent'].media = [
          {
            status: 'READY',
            originalUrl: imageUrl,
            asset: assetUrn,
          },
        ]
      }
    }

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postContent),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`LinkedIn API error: ${error}`)
    }

    const data = await response.json()
    const urn = data.id

    return {
      urn,
      postUrl: `https://www.linkedin.com/feed/update/${urn}`,
    }
  })
}

/**
 * Publish to Pinterest
 */
export async function publishToPinterest(
  content: string,
  imageUrl: string,
  linkUrl: string,
  accessToken: string,
): Promise<PinterestPostResult> {
  return withRetry(async () => {
    // Download image
    const imageResponse = await fetch(imageUrl)
    const imageBlob = await imageResponse.blob()
    const imageBuffer = await imageBlob.arrayBuffer()

    // Upload to Pinterest
    const uploadResponse = await fetch('https://api.pinterest.com/v5/media', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'image/png',
      },
      body: imageBuffer,
    })

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text()
      throw new Error(`Failed to upload media to Pinterest: ${error}`)
    }

    const mediaData = await uploadResponse.json()
    const mediaId = mediaData.id

    // Create pin
    const pinResponse = await fetch('https://api.pinterest.com/v5/pins', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: content.substring(0, 100), // Pinterest title limit
        description: content,
        link: linkUrl,
        media_source: {
          content_type: 'image/jpeg',
          data_id: mediaId,
        },
      }),
    })

    if (!pinResponse.ok) {
      const error = await pinResponse.text()
      throw new Error(`Failed to create Pinterest pin: ${error}`)
    }

    const pinData = await pinResponse.json()

    return {
      id: pinData.id,
      url: pinData.url,
    }
  })
}

/**
 * Generic publish function
 */
export async function publishToPlatform(
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'pinterest',
  content: string,
  imageUrls: string[] = [],
  accessToken: string,
  options?: {
    linkUrl?: string
    authorUrn?: string
  },
): Promise<{ postId: string; postUrl: string }> {
  switch (platform) {
    case 'twitter': {
      const result = await publishToTwitter(content, imageUrls, accessToken)
      return { postId: result.postId, postUrl: result.postUrl }
    }
    case 'facebook': {
      const result = await publishToFacebook(content, imageUrls, accessToken)
      return { postId: result.postId, postUrl: result.postUrl }
    }
    case 'instagram': {
      if (!imageUrls[0]) throw new Error('Instagram requires an image')
      const result = await publishToInstagram(content, imageUrls[0], accessToken)
      return { postId: result.mediaId, postUrl: result.permalink }
    }
    case 'linkedin': {
      const result = await publishToLinkedIn(content, imageUrls[0], accessToken, options?.authorUrn)
      return { postId: result.urn, postUrl: result.postUrl }
    }
    case 'pinterest': {
      if (!imageUrls[0] || !options?.linkUrl)
        throw new Error('Pinterest requires image and link URL')
      const result = await publishToPinterest(content, imageUrls[0], options.linkUrl, accessToken)
      return { postId: result.id, postUrl: result.url }
    }
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}

export default {
  publishToTwitter,
  publishToFacebook,
  publishToInstagram,
  publishToLinkedIn,
  publishToPinterest,
  publishToPlatform,
}

// Alias for backward compatibility
export const publishToSocial = publishToPlatform
