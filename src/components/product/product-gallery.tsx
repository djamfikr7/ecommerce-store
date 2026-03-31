'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn, X, Video } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductImage } from './product-image'
import { ProductVideo } from './product-video'

export interface GalleryMedia {
  id: string
  url: string
  alt?: string | null
  type?: 'image' | 'video'
  thumbnailUrl?: string
  videoUrl?: string
  width?: number | null
  height?: number | null
  sortOrder?: number
  blurDataURL?: string
}

interface ProductGalleryProps {
  media: GalleryMedia[]
  productName: string
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
}

const SWIPE_THRESHOLD = 50

export function ProductGallery({ media, productName }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxZoom, setLightboxZoom] = useState(1)
  const [lightboxPan, setLightboxPan] = useState({ x: 0, y: 0 })
  const lightboxRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const currentMedia = media[currentIndex]
  const isVideo = currentMedia?.type === 'video' || Boolean(currentMedia?.videoUrl)
  const hasMultiple = media.length > 1

  const paginate = useCallback(
    (newDirection: number) => {
      setDirection(newDirection)
      setCurrentIndex((prev) => {
        const next = prev + newDirection
        if (next < 0) return media.length - 1
        if (next >= media.length) return 0
        return next
      })
    },
    [media.length],
  )

  const goToMedia = useCallback(
    (index: number) => {
      setDirection(index > currentIndex ? 1 : -1)
      setCurrentIndex(index)
    },
    [currentIndex],
  )

  const openLightbox = useCallback(() => {
    setIsLightboxOpen(true)
    setLightboxZoom(1)
    setLightboxPan({ x: 0, y: 0 })
    document.body.style.overflow = 'hidden'
  }, [])

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false)
    setLightboxZoom(1)
    setLightboxPan({ x: 0, y: 0 })
    document.body.style.overflow = ''
  }, [])

  const zoomIn = useCallback(() => {
    setLightboxZoom((prev) => Math.min(prev + 0.5, 4))
  }, [])

  const zoomOut = useCallback(() => {
    setLightboxZoom((prev) => {
      const next = Math.max(prev - 0.5, 1)
      if (next <= 1) setLightboxPan({ x: 0, y: 0 })
      return next
    })
  }, [])

  const handleLightboxWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      if (e.deltaY < 0) zoomIn()
      else zoomOut()
    },
    [zoomIn, zoomOut],
  )

  const handleLightboxDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info
      const swipe = Math.abs(offset.x) * velocity.x

      if (swipe > SWIPE_THRESHOLD || Math.abs(offset.x) > 100) {
        if (offset.x > 0) paginate(-1)
        else paginate(1)
      }
    },
    [paginate],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          paginate(-1)
          break
        case 'ArrowRight':
          paginate(1)
          break
        case 'Escape':
          if (isLightboxOpen) closeLightbox()
          break
        case '+':
        case '=':
          if (isLightboxOpen) zoomIn()
          break
        case '-':
          if (isLightboxOpen) zoomOut()
          break
      }
    },
    [paginate, isLightboxOpen, closeLightbox, zoomIn, zoomOut],
  )

  useEffect(() => {
    if (isLightboxOpen) {
      setLightboxZoom(1)
      setLightboxPan({ x: 0, y: 0 })
    }
  }, [currentIndex, isLightboxOpen])

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    }
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = touchStartRef.current
      const touch = e.changedTouches[0]
      if (!start || !touch) return
      const deltaX = touch.clientX - start.x
      const deltaY = touch.clientY - start.y

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
        if (deltaX > 0) paginate(-1)
        else paginate(1)
      }
      touchStartRef.current = null
    },
    [paginate],
  )

  if (media.length === 0) {
    return (
      <div className="neo-card flex aspect-square items-center justify-center">
        <span className="text-slate-500">No images available</span>
      </div>
    )
  }

  return (
    <div
      className="space-y-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Product image gallery"
      aria-roledescription="carousel"
    >
      <div className="flex flex-col gap-4 md:flex-row-reverse">
        {/* Mobile thumbnails */}
        <div className="scrollbar-hide order-2 flex gap-2 overflow-x-auto pb-2 md:hidden">
          {media.map((item, index) => {
            const itemIsVideo = item.type === 'video' || Boolean(item.videoUrl)
            return (
              <button
                key={item.id}
                onClick={() => goToMedia(index)}
                className={cn(
                  'relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg transition-all',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary',
                  index === currentIndex
                    ? 'ring-2 ring-accent-primary ring-offset-2 ring-offset-[var(--surface-base)]'
                    : 'opacity-60 hover:opacity-100',
                )}
                aria-label={`View ${itemIsVideo ? 'video' : 'image'} ${index + 1}`}
                aria-current={index === currentIndex ? 'true' : undefined}
              >
                <Image
                  src={item.thumbnailUrl || item.url}
                  alt={item.alt || `${productName} - ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                  loading="lazy"
                />
                {itemIsVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Video className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Desktop thumbnails */}
        <div className="order-2 hidden flex-col gap-2 md:order-1 md:flex">
          {media.map((item, index) => {
            const itemIsVideo = item.type === 'video' || Boolean(item.videoUrl)
            return (
              <button
                key={item.id}
                onClick={() => goToMedia(index)}
                className={cn(
                  'relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg transition-all',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary',
                  index === currentIndex
                    ? 'neo-glow ring-2 ring-accent-primary ring-offset-2 ring-offset-[var(--surface-base)]'
                    : 'neo-raised-sm opacity-50 hover:opacity-90',
                )}
                aria-label={`View ${itemIsVideo ? 'video' : 'image'} ${index + 1}`}
                aria-current={index === currentIndex ? 'true' : undefined}
              >
                <Image
                  src={item.thumbnailUrl || item.url}
                  alt={item.alt || `${productName} - ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  loading="lazy"
                />
                {itemIsVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Video className="h-5 w-5 text-white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Main display area */}
        <div className="order-1 flex-1 md:order-2">
          <div
            className="neo-card group relative aspect-square overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence initial={false} custom={direction} mode="wait">
              {currentMedia && (
                <motion.div
                  key={currentMedia.id}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="absolute inset-0"
                >
                  {isVideo ? (
                    <ProductVideo
                      src={currentMedia.videoUrl || currentMedia.url}
                      poster={currentMedia.thumbnailUrl || currentMedia.url}
                      alt={currentMedia.alt || productName}
                    />
                  ) : (
                    <ProductImage
                      src={currentMedia.url}
                      alt={currentMedia.alt || productName}
                      priority={currentIndex === 0}
                      {...(currentMedia.blurDataURL
                        ? { blurDataURL: currentMedia.blurDataURL }
                        : {})}
                      enableZoom={true}
                      onDoubleClick={openLightbox}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {!isVideo && (
              <button
                onClick={openLightbox}
                className={cn(
                  'neo-raised absolute right-3 top-3 z-10 rounded-full p-2.5 transition-all',
                  'opacity-0 hover:scale-110 active:scale-95 group-hover:opacity-100',
                  'focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary',
                )}
                aria-label="Open fullscreen"
              >
                <ZoomIn className="h-5 w-5 text-slate-300" />
              </button>
            )}

            {hasMultiple && (
              <>
                <button
                  onClick={() => paginate(-1)}
                  className={cn(
                    'neo-raised absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full p-3 transition-all',
                    'opacity-0 hover:scale-110 active:scale-95 group-hover:opacity-100',
                    'focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary',
                  )}
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5 text-slate-300" />
                </button>
                <button
                  onClick={() => paginate(1)}
                  className={cn(
                    'neo-raised absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full p-3 transition-all',
                    'opacity-0 hover:scale-110 active:scale-95 group-hover:opacity-100',
                    'focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary',
                  )}
                  aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5 text-slate-300" />
                </button>
              </>
            )}

            {hasMultiple && (
              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                {media.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => goToMedia(index)}
                    className={cn(
                      'rounded-full transition-all',
                      index === currentIndex
                        ? 'h-2 w-6 bg-accent-primary'
                        : 'h-2 w-2 bg-slate-500 hover:bg-slate-400',
                    )}
                    aria-label={`Go to ${item.type === 'video' ? 'video' : 'image'} ${index + 1}`}
                    aria-current={index === currentIndex ? 'true' : undefined}
                  />
                ))}
              </div>
            )}

            {isVideo && (
              <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
                <Video className="h-3 w-3" />
                Video
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && currentMedia && (
          <motion.div
            ref={lightboxRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
            onClick={closeLightbox}
            onWheel={handleLightboxWheel}
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
          >
            {/* Toolbar */}
            <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
              <div className="neo-raised-sm flex items-center gap-1 rounded-lg p-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    zoomOut()
                  }}
                  className="rounded px-3 py-1.5 text-sm text-white transition-colors hover:bg-white/10"
                  aria-label="Zoom out"
                >
                  -
                </button>
                <span className="min-w-[3rem] text-center text-xs text-white/60">
                  {Math.round(lightboxZoom * 100)}%
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    zoomIn()
                  }}
                  className="rounded px-3 py-1.5 text-sm text-white transition-colors hover:bg-white/10"
                  aria-label="Zoom in"
                >
                  +
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closeLightbox()
                }}
                className="rounded-full p-2 transition-colors hover:bg-white/10"
                aria-label="Close lightbox"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Previous button */}
            {hasMultiple && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  paginate(-1)
                }}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 transition-colors hover:bg-white/20"
                aria-label="Previous"
              >
                <ChevronLeft className="h-8 w-8 text-white" />
              </button>
            )}

            {/* Zoomable image container */}
            <motion.div
              drag={lightboxZoom > 1}
              dragConstraints={lightboxRef}
              dragElastic={0.1}
              onDragEnd={(_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
                if (lightboxZoom === 1) {
                  handleLightboxDragEnd(_e, info)
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex aspect-square w-full max-w-5xl items-center justify-center"
              style={{ cursor: lightboxZoom > 1 ? 'grab' : 'default' }}
            >
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentMedia.id}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.div
                    animate={{
                      scale: lightboxZoom,
                      x: lightboxPan.x,
                      y: lightboxPan.y,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="relative h-full w-full"
                  >
                    <Image
                      src={currentMedia.url}
                      alt={currentMedia.alt || productName}
                      fill
                      className="pointer-events-none object-contain"
                      sizes="100vw"
                      quality={90}
                    />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Next button */}
            {hasMultiple && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  paginate(1)
                }}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 transition-colors hover:bg-white/20"
                aria-label="Next"
              >
                <ChevronRight className="h-8 w-8 text-white" />
              </button>
            )}

            {/* Thumbnail strip */}
            {hasMultiple && (
              <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-3">
                {media.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      goToMedia(index)
                    }}
                    className={cn(
                      'relative h-16 w-16 overflow-hidden rounded-lg transition-all',
                      index === currentIndex
                        ? 'neo-glow ring-2 ring-accent-primary ring-offset-2 ring-offset-black'
                        : 'opacity-50 hover:opacity-90',
                    )}
                    aria-label={`View ${item.type === 'video' ? 'video' : 'image'} ${index + 1}`}
                  >
                    <Image
                      src={item.thumbnailUrl || item.url}
                      alt={item.alt || `${productName} - ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Counter */}
            <div className="absolute bottom-6 right-6 z-10 text-xs text-white/40">
              {currentIndex + 1} / {media.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
