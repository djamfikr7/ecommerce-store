/**
 * AI Content Generator for Social Media
 * Generates engaging social posts using OpenAI
 */

import OpenAI from 'openai'
import { SocialPlatform, PLATFORM_LIMITS, GeneratedContent } from '@/types/automation'
import { ProductWithRelations } from '@/types/products'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Platform-specific character limits
const PLATFORM_LIMITS_MAP: Record<SocialPlatform, number> = {
  FACEBOOK: 63206,
  INSTAGRAM: 2200,
  TWITTER: 280,
  LINKEDIN: 3000,
  PINTEREST: 500,
  TIKTOK: 2200,
}

// Default system prompt for social media content generation
const SYSTEM_PROMPT = `You are an expert social media content creator for an e-commerce store.
Your posts are engaging, authentic, and drive conversions.
You understand each platform's unique voice and audience.
Always include a clear call-to-action when appropriate.
Keep content concise but impactful.
Never use excessive emojis - be tasteful and platform-appropriate.`

interface GeneratePostOptions {
  product: ProductWithRelations
  platform: SocialPlatform
  locale?: string
  includeEmoji?: boolean
  tone?: 'professional' | 'casual' | 'exciting' | 'informative'
}

interface GenerateCampaignOptions {
  products: ProductWithRelations[]
  platforms: SocialPlatform[]
  campaignGoal: string
  locale?: string
}

/**
 * Generate an engaging social media post for a product
 */
export async function generateProductPost(
  product: ProductWithRelations,
  platform: SocialPlatform
): Promise<string> {
  const limit = PLATFORM_LIMITS_MAP[platform]

  const platformContext = getPlatformContext(platform)

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `${SYSTEM_PROMPT}\n\nPlatform: ${platform}\n${platformContext}`,
      },
      {
        role: 'user',
        content: `Create a social media post for this product:\n\nProduct Name: ${product.name}\nDescription: ${product.description || 'No description'}\nPrice: $${(product.price / 100).toFixed(2)}${product.compareAtPrice ? ` (was $${(product.compareAtPrice / 100).toFixed(2)})` : ''}\nCategory: ${product.category?.name || 'General'}\nTags: ${product.tags.map(t => t.name).join(', ')}\n\nKeep it under ${limit} characters. Include relevant hashtags at the end.`,
      },
    ],
    max_tokens: 500,
    temperature: 0.7,
  })

  const content = response.choices[0]?.message?.content?.trim()

  if (!content) {
    throw new Error('Failed to generate content')
  }

  // Truncate if necessary
  if (content.length > limit) {
    return content.substring(0, limit - 3) + '...'
  }

  return content
}

/**
 * Generate posts for multiple platforms from campaign goal
 */
export async function generateCampaignContent(
  campaign: { name: string; goal: string; description?: string },
  products: ProductWithRelations[]
): Promise<Record<SocialPlatform, string>> {
  const platforms: SocialPlatform[] = ['TWITTER', 'FACEBOOK', 'INSTAGRAM']
  const result: Record<string, string> = {}

  const productList = products
    .map(p => `- ${p.name} ($${(p.price / 100).toFixed(2)})`)
    .join('\n')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `${SYSTEM_PROMPT}\n\nGenerate platform-specific posts for a campaign. Return JSON with platform as key and post content as value.`,
      },
      {
        role: 'user',
        content: `Campaign: ${campaign.name}\nGoal: ${campaign.goal}\nDescription: ${campaign.description || 'N/A'}\n\nProducts:\n${productList}\n\nGenerate posts for: ${platforms.join(', ')}. Include hashtags appropriate for each platform.`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 1000,
    temperature: 0.7,
  })

  const content = response.choices[0]?.message?.content

  if (content) {
    try {
      const parsed = JSON.parse(content)
      for (const platform of platforms) {
        if (parsed[platform]) {
          result[platform] = parsed[platform]
        }
      }
    } catch {
      // If JSON parsing fails, use the full content for all platforms
      for (const platform of platforms) {
        result[platform] = `${campaign.name}: ${campaign.goal}\n\n${productList}`
      }
    }
  }

  return result as Record<SocialPlatform, string>
}

/**
 * Generate relevant hashtags based on product
 */
export async function generateHashtags(
  product: ProductWithRelations,
  count: number = 5
): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a social media hashtag expert. Generate relevant, popular hashtags for e-commerce products.',
      },
      {
        role: 'user',
        content: `Generate ${count} relevant hashtags for this product:\n\nName: ${product.name}\nCategory: ${product.category?.name || 'General'}\nTags: ${product.tags.map(t => t.name).join(', ')}\n\nReturn only the hashtags, comma-separated, with # symbol.`,
      },
    ],
    max_tokens: 200,
    temperature: 0.5,
  })

  const content = response.choices[0]?.message?.content || ''

  // Parse hashtags from response
  const hashtags = content
    .split(/[,\s]+/)
    .map(tag => tag.trim())
    .filter(tag => tag.startsWith('#') && tag.length > 1)
    .slice(0, count)

  return hashtags
}

/**
 * Generate N variations of the same post for A/B testing
 */
export async function generatePostVariations(
  content: string,
  count: number = 3
): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You create variations of social media posts for A/B testing. Each variation should have a slightly different angle or wording while maintaining the core message.',
      },
      {
        role: 'user',
        content: `Create ${count} variations of this social media post:\n\n"${content}"\n\nEach variation should be unique in wording but convey the same core message. Keep similar length. Return as JSON array of strings.`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 1000,
    temperature: 0.8,
  })

  const responseContent = response.choices[0]?.message?.content

  if (responseContent) {
    try {
      const parsed = JSON.parse(responseContent)
      if (Array.isArray(parsed.variations)) {
        return parsed.variations.slice(0, count)
      }
    } catch {
      // Fallback
    }
  }

  // Fallback: return original with slight modifications
  return Array(count).fill(content).map((c, i) => `${c} (v${i + 1})`)
}

/**
 * Generate a comment reply for engagement automation
 */
export async function generateCommentReply(
  comment: string,
  context?: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a friendly customer service representative for an e-commerce brand. Reply to customer comments warmly and professionally. Keep replies under 280 characters. Never be defensive or argumentative.`,
      },
      {
        role: 'user',
        content: `Reply to this comment${context ? `: "${context}"` : ''}\n\nComment: "${comment}"`,
      },
    ],
    max_tokens: 200,
    temperature: 0.7,
  })

  const reply = response.choices[0]?.message?.content?.trim()

  // Ensure under 280 characters for Twitter compatibility
  if (reply && reply.length > 280) {
    return reply.substring(0, 277) + '...'
  }

  return reply || 'Thanks for your comment!'
}

/**
 * Generate full content with metadata
 */
export async function generateFullContent(
  product: ProductWithRelations,
  platform: SocialPlatform
): Promise<GeneratedContent> {
  const limit = PLATFORM_LIMITS_MAP[platform]

  const [content, hashtags] = await Promise.all([
    generateProductPost(product, platform),
    generateHashtags(product, 5),
  ])

  const hashtagsString = hashtags.join(' ')
  const fullContent = hashtagsString ? `${content}\n\n${hashtagsString}` : content

  return {
    content: fullContent,
    hashtags,
    platform,
    characterCount: fullContent.length,
    qualityScore: calculateQualityScore(content, hashtags, limit),
  }
}

/**
 * Get platform-specific context for generation
 */
function getPlatformContext(platform: SocialPlatform): string {
  const contexts: Record<SocialPlatform, string> = {
    TWITTER: 'Twitter: Concise, punchy, max 280 chars. Use 1-2 relevant hashtags. Include a CTA.',
    FACEBOOK: 'Facebook: More detailed posts, can include longer text. Use 2-5 hashtags. Encourage engagement.',
    INSTAGRAM: 'Instagram: Visual-first mindset, engaging captions. Use 3-5 hashtags in comments style. Add emoji sparingly.',
    LINKEDIN: 'LinkedIn: Professional tone, industry insights. Use 2-3 hashtags. Focus on value proposition.',
    PINTEREST: 'Pinterest: Descriptive, keyword-rich. Use 2-3 hashtags. Focus on the product benefits.',
    TIKTOK: 'TikTok: Trendy, engaging, authentic voice. Use 3-5 hashtags. Reference trending topics.',
  }

  return contexts[platform] || ''
}

/**
 * Calculate a quality score for generated content
 */
function calculateQualityScore(
  content: string,
  hashtags: string[],
  limit: number
): number {
  let score = 0.5

  // Length optimization (ideal is 70-90% of limit)
  const usageRatio = content.length / limit
  if (usageRatio >= 0.7 && usageRatio <= 0.9) {
    score += 0.2
  } else if (usageRatio >= 0.5 && usageRatio <= 1) {
    score += 0.1
  }

  // Hashtag presence
  if (hashtags.length >= 2 && hashtags.length <= 5) {
    score += 0.15
  } else if (hashtags.length > 0) {
    score += 0.05
  }

  // Call to action presence
  if (/\b(shop|buy|check|learn|get|try|discover|grab|order|link)\b/i.test(content)) {
    score += 0.15
  }

  return Math.min(1, Math.max(0, score))
}

export default {
  generateProductPost,
  generateCampaignContent,
  generateHashtags,
  generatePostVariations,
  generateCommentReply,
  generateFullContent,
}
