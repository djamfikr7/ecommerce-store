'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  ShareIcon,
  FacebookIcon,
  TwitterIcon,
  PinterestIcon,
  WhatsAppIcon,
  EmailIcon,
  LinkIcon,
  CheckIcon,
} from './social-icons'
import { generateShareUrl, type ShareableProduct } from '@/lib/social/share'
import {
  copyToClipboard,
  openShareWindow,
  trackShare,
  canUseNativeShare,
  nativeShare,
} from '@/lib/utils/share'
import { cn } from '@/lib/utils'

interface ShareButtonProps {
  product: ShareableProduct
  variant?: 'default' | 'icon' | 'text'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showLabel?: boolean
}

const platforms = [
  { id: 'facebook', name: 'Facebook', icon: FacebookIcon, color: '#1877F2' },
  { id: 'twitter', name: 'Twitter', icon: TwitterIcon, color: '#1DA1F2' },
  { id: 'pinterest', name: 'Pinterest', icon: PinterestIcon, color: '#E60023' },
  { id: 'whatsapp', name: 'WhatsApp', icon: WhatsAppIcon, color: '#25D366' },
  { id: 'email', name: 'Email', icon: EmailIcon, color: '#6366F1' },
  { id: 'copy', name: 'Copy Link', icon: LinkIcon, color: '#64748B' },
] as const

export function ShareButton({
  product,
  variant = 'default',
  size = 'md',
  className,
  showLabel = true,
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
    return undefined
  }, [isOpen])

  const handleShare = async (platformId: string): Promise<void> => {
    trackShare(platformId, product)

    if (platformId === 'copy') {
      const url = generateShareUrl(product, 'copy')
      const success = await copyToClipboard(url)

      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
      return
    }

    const shareUrl = generateShareUrl(product, platformId)

    if (platformId === 'email') {
      window.location.href = shareUrl
    } else {
      openShareWindow(shareUrl)
    }

    setIsOpen(false)
  }

  const handleNativeShare = async () => {
    const success = await nativeShare({
      title: product.name,
      text: `Check out ${product.name}`,
      url: generateShareUrl(product, 'copy'),
    })

    if (!success) {
      setIsOpen(true)
    }
  }

  const handleButtonClick = () => {
    if (canUseNativeShare()) {
      handleNativeShare()
    } else {
      setIsOpen(!isOpen)
    }
  }

  if (variant === 'icon') {
    return (
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleButtonClick}
          className={cn('neo-flat hover:neo-raised-sm', className)}
          aria-label="Share product"
        >
          <ShareIcon className="h-5 w-5" />
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="neo-raised absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg bg-surface-elevated shadow-xl"
            >
              <div className="py-2">
                {platforms.map((platform) => {
                  const Icon = platform.icon
                  return (
                    <button
                      key={platform.id}
                      onClick={() => handleShare(platform.id)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-overlay"
                    >
                      <Icon className="h-5 w-5" style={{ color: platform.color }} />
                      <span className="text-sm text-slate-200">
                        {platform.id === 'copy' && copied ? (
                          <span className="flex items-center gap-2">
                            <CheckIcon className="h-4 w-4 text-green-400" />
                            Copied!
                          </span>
                        ) : (
                          platform.name
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant={variant === 'text' ? 'ghost' : 'secondary'}
        size={size}
        onClick={handleButtonClick}
        className={cn('neo-raised-sm hover:neo-glow', className)}
      >
        <ShareIcon className="h-5 w-5" />
        {showLabel && <span>Share</span>}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="neo-raised absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg bg-surface-elevated shadow-xl"
          >
            <div className="p-3">
              <h3 className="mb-3 text-sm font-semibold text-slate-200">Share this product</h3>
              <div className="space-y-1">
                {platforms.map((platform) => {
                  const Icon = platform.icon
                  return (
                    <button
                      key={platform.id}
                      onClick={() => handleShare(platform.id)}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-surface-overlay"
                    >
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${platform.color}20` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: platform.color }} />
                      </div>
                      <span className="text-sm text-slate-200">
                        {platform.id === 'copy' && copied ? (
                          <span className="flex items-center gap-2 text-green-400">
                            <CheckIcon className="h-4 w-4" />
                            Copied!
                          </span>
                        ) : (
                          platform.name
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
