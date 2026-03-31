'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Link2, Copy, Check, X, Facebook, Twitter, Mail, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface WishlistShareProps {
  wishlistId: string
  className?: string
}

const socialPlatforms = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: '#1877F2',
    getShareUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: '#1DA1F2',
    getShareUrl: (url: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Check out my wishlist!')}`,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageCircle,
    color: '#25D366',
    getShareUrl: (url: string) =>
      `https://wa.me/?text=${encodeURIComponent(`Check out my wishlist! ${url}`)}`,
  },
  {
    id: 'email',
    name: 'Email',
    icon: Mail,
    color: '#6366F1',
    getShareUrl: (url: string) =>
      `mailto:?subject=${encodeURIComponent('Check out my wishlist!')}&body=${encodeURIComponent(`I wanted to share my wishlist with you: ${url}`)}`,
  },
]

export function WishlistShare({ wishlistId, className }: WishlistShareProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/wishlist/shared/${wishlistId}` : ''

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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Wishlist',
          text: 'Check out my wishlist!',
          url: shareUrl,
        })
        return true
      } catch {
        return false
      }
    }
    return false
  }

  const handleShareClick = async () => {
    const shared = await handleNativeShare()
    if (!shared) {
      setIsOpen(!isOpen)
    }
  }

  const handlePlatformShare = (platformId: string) => {
    const platform = socialPlatforms.find((p) => p.id === platformId)
    if (!platform) return

    const shareUrlFormatted = platform.getShareUrl(shareUrl)

    if (platformId === 'email') {
      window.location.href = shareUrlFormatted
    } else {
      window.open(shareUrlFormatted, '_blank', 'width=600,height=400')
    }

    setIsOpen(false)
  }

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <Button variant="outline" size="sm" onClick={handleShareClick} className="gap-2">
        <Share2 className="h-4 w-4" />
        Share Wishlist
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#1a1a2e] to-[#16213e] shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-accent-primary" />
                <h3 className="text-sm font-semibold text-white">Share Wishlist</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Copy Link */}
            <div className="border-b border-white/[0.06] p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">
                Copy Link
              </p>
              <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2">
                  <Link2 className="h-4 w-4 text-white/40" />
                  <span className="truncate text-sm text-white/60">{shareUrl}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyLink}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-xl transition-all',
                    copied
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white',
                  )}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </motion.button>
              </div>
            </div>

            {/* Social Platforms */}
            <div className="p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
                Share via
              </p>
              <div className="grid grid-cols-4 gap-2">
                {socialPlatforms.map((platform) => {
                  const Icon = platform.icon
                  return (
                    <motion.button
                      key={platform.id}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePlatformShare(platform.id)}
                      className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-white/[0.06]"
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${platform.color}15` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: platform.color }} />
                      </div>
                      <span className="text-xs text-white/50">{platform.name}</span>
                    </motion.button>
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
