/**
 * Social Share Functionality
 * Generate share URLs, text, and OG tags for products
 */

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

// Base URL for generating share links
const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://store.example.com'
}

const getStoreName = (): string => {
  return process.env.NEXT_PUBLIC_STORE_NAME || 'Our Store'
}

export type SocialPlatform = 'twitter' | 'facebook' | 'pinterest' | 'linkedin' | 'whatsapp' | 'email' | 'copy'

/**
 * Generate share URL for a product on a specific platform
 */
export function generateShareUrl(product: ShareableProduct, platform: string): string {
  const baseUrl = getBaseUrl()
  const productUrl = `${baseUrl}/products/${product.slug}`
  const encodedUrl = encodeURIComponent(productUrl)
  const shareText = generateShareText(product)
  const encodedText = encodeURIComponent(shareText)

  switch (platform.toLowerCase()) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`

    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`

    case 'pinterest':
      const encodedMedia = product.image ? encodeURIComponent(product.image) : ''
      const encodedDescription = encodeURIComponent(shareText)
      return `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedMedia}&description=${encodedDescription}`

    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`

    case 'whatsapp':
      return `https://wa.me/?text=${encodedText}%20${encodedUrl}`

    case 'email':
      const emailSubject = encodeURIComponent(`Check out: ${product.name}`)
      const emailBody = encodeURIComponent(`${shareText}\n\n${productUrl}`)
      return `mailto:?subject=${emailSubject}&body=${emailBody}`

    case 'copy':
    default:
      return productUrl
  }
}

/**
 * Generate share text for a product
 */
export function generateShareText(product: ShareableProduct, template?: string): string {
  const storeName = getStoreName()
  const priceText = product.price ? `Only ${product.price}` : ''

  if (template) {
    return template
      .replace(/{name}/g, product.name)
      .replace(/{storeName}/g, storeName)
      .replace(/{price}/g, priceText)
      .replace(/{rating}/g, product.rating ? `${product.rating}/5` : '')
      .replace(/{url}/g, `${getBaseUrl()}/products/${product.slug}`)
  }

  // Default template
  let text = `Check out ${product.name} at ${storeName}!`
  if (priceText) {
    text += ` ${priceText}`
  }
  if (product.rating) {
    text += ` ⭐ ${product.rating}/5`
  }

  return text
}

/**
 * Generate Open Graph meta tags for a product
 */
export function generateOgTags(product: ShareableProduct): OgTags {
  const baseUrl = getBaseUrl()
  const storeName = getStoreName()

  return {
    title: `${product.name} | ${storeName}`,
    description: product.description || generateShareText(product),
    image: product.image || null,
    url: `${baseUrl}/products/${product.slug}`,
    type: 'product',
    price: product.price?.toString(),
    currency: 'USD',
  }
}

/**
 * Generate share URLs for all platforms
 */
export function generateAllShareUrls(product: ShareableProduct): Record<SocialPlatform, string> {
  return {
    twitter: generateShareUrl(product, 'twitter'),
    facebook: generateShareUrl(product, 'facebook'),
    pinterest: generateShareUrl(product, 'pinterest'),
    linkedin: generateShareUrl(product, 'linkedin'),
    whatsapp: generateShareUrl(product, 'whatsapp'),
    email: generateShareUrl(product, 'email'),
    copy: generateShareUrl(product, 'copy'),
  }
}

/**
 * Generate Twitter Card meta tags
 */
export function generateTwitterCard(product: ShareableProduct): Record<string, string> {
  return {
    'twitter:card': 'product',
    'twitter:title': `${product.name} | ${getStoreName()}`,
    'twitter:description': product.description || generateShareText(product),
    'twitter:image': product.image || '',
    'twitter:url': `${getBaseUrl()}/products/${product.slug}`,
    ...(product.price && {
      'twitter:label1': 'Price',
      'twitter:data1': `${product.price}`,
    }),
  }
}

/**
 * Copy text to clipboard helper (for client-side use)
 */
export function getShareContentForClipboard(product: ShareableProduct): string {
  const url = generateShareUrl(product, 'copy')
  return `${generateShareText(product)}\n\n${url}`
}

export default {
  generateShareUrl,
  generateShareText,
  generateOgTags,
  generateAllShareUrls,
  generateTwitterCard,
  getShareContentForClipboard,
}
