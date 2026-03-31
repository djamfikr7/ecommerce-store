/**
 * Client-side share utilities
 */

import { type ShareableProduct } from '@/lib/social/share'

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const success = document.execCommand('copy')
      textArea.remove()
      return success
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Check if native share API is available
 */
export function canUseNativeShare(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator
}

/**
 * Use native share API
 */
export async function nativeShare(data: {
  title: string
  text: string
  url: string
}): Promise<boolean> {
  if (!canUseNativeShare()) {
    return false
  }

  try {
    await navigator.share(data)
    return true
  } catch (error) {
    // User cancelled or error occurred
    console.error('Native share failed:', error)
    return false
  }
}

/**
 * Open share URL in new window
 */
export function openShareWindow(url: string, width = 600, height = 400): void {
  const left = (window.innerWidth - width) / 2
  const top = (window.innerHeight - height) / 2

  window.open(
    url,
    'share',
    `width=${width},height=${height},left=${left},top=${top},toolbar=0,location=0,menubar=0`,
  )
}

/**
 * Track share event (for analytics)
 */
export function trackShare(platform: string, product: ShareableProduct): void {
  // This can be integrated with your analytics provider
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', 'share', {
      method: platform,
      content_type: 'product',
      item_id: product.slug,
    })
  }
}
