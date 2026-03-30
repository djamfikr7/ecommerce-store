'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  XIcon,
  FacebookIcon,
  TwitterIcon,
  PinterestIcon,
  WhatsAppIcon,
  EmailIcon,
  LinkIcon,
  CheckIcon,
} from './social-icons'
import { generateShareUrl, generateShareText, type ShareableProduct } from '@/lib/social/share'
import { copyToClipboard, openShareWindow, trackShare } from '@/lib/utils/share'
import { cn } from '@/lib/utils'

interface ShareModalProps {
  product: ShareableProduct
  isOpen: boolean
  onClose: () => void
}

const platforms = [
  { id: 'facebook', name: 'Facebook', icon: FacebookIcon, color: '#1877F2' },
  { id: 'twitter', name: 'Twitter', icon: TwitterIcon, color: '#1DA1F2' },
  { id: 'pinterest', name: 'Pinterest', icon: PinterestIcon, color: '#E60023' },
  { id: 'whatsapp', name: 'WhatsApp', icon: WhatsAppIcon, color: '#25D366' },
  { id: 'email', name: 'Email', icon: EmailIcon, color: '#6366F1' },
] as const

export function ShareModal({ product, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const productUrl = generateShareUrl(product, 'copy')
  const shareText = generateShareText(product)

  const handleShare = async (platformId: string): Promise<void> => {
    trackShare(platformId, product)
    const shareUrl = generateShareUrl(product, platformId)

    if (platformId === 'email') {
      window.location.href = shareUrl
    } else {
      openShareWindow(shareUrl)
    }

    onClose()
  }

  const handleCopyLink = async (): Promise<void> => {
    const success = await copyToClipboard(productUrl)

    if (success) {
      setCopied(true)
      trackShare('copy', product)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="neo-raised w-full max-w-md overflow-hidden rounded-2xl bg-surface-elevated shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-border-default relative border-b px-6 py-4">
                <h2 className="text-xl font-semibold text-slate-100">Share Product</h2>
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-lg p-2 transition-colors hover:bg-surface-overlay"
                  aria-label="Close modal"
                >
                  <XIcon className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6 p-6">
                {/* Product Preview */}
                <div className="neo-inset flex items-center gap-4 rounded-lg bg-surface-base p-4">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="neo-flat h-16 w-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium text-slate-100">{product.name}</h3>
                    {product.price && (
                      <p className="mt-1 text-sm text-slate-400">{product.price}</p>
                    )}
                  </div>
                </div>

                {/* Share Text Preview */}
                <div className="neo-inset rounded-lg bg-surface-base p-4">
                  <p className="text-sm leading-relaxed text-slate-300">{shareText}</p>
                </div>

                {/* Social Platforms */}
                <div>
                  <h3 className="mb-3 text-sm font-medium text-slate-300">Share on social media</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {platforms.map((platform) => {
                      const Icon = platform.icon
                      return (
                        <button
                          key={platform.id}
                          onClick={() => handleShare(platform.id)}
                          className="neo-flat hover:neo-raised-sm group flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-surface-overlay"
                          aria-label={`Share on ${platform.name}`}
                        >
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                            style={{ backgroundColor: `${platform.color}20` }}
                          >
                            <Icon className="h-6 w-6" style={{ color: platform.color }} />
                          </div>
                          <span className="text-xs text-slate-400 group-hover:text-slate-300">
                            {platform.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Copy Link */}
                <div>
                  <h3 className="mb-3 text-sm font-medium text-slate-300">Or copy link</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={productUrl}
                      readOnly
                      className="border-border-default neo-inset flex-1 rounded-lg border bg-surface-base px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    />
                    <Button
                      onClick={handleCopyLink}
                      variant="secondary"
                      className={cn(
                        'neo-raised-sm hover:neo-glow transition-all',
                        copied && 'bg-green-600 hover:bg-green-600',
                      )}
                    >
                      {copied ? (
                        <>
                          <CheckIcon className="h-4 w-4" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <LinkIcon className="h-4 w-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
