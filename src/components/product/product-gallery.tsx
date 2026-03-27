'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images: {
    id: string
    url: string
    alt?: string | null
  }[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [direction, setDirection] = useState(0)

  const currentImage = images[currentIndex]

  const goToNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const goToPrev = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const goToImage = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }, [currentIndex])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrev()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      }
    },
    [goToNext, goToPrev]
  )

  if (images.length === 0) {
    return (
      <div className="neo-card aspect-square flex items-center justify-center">
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
    >
      {/* Main image */}
      <div
        className="relative neo-card overflow-hidden aspect-square group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentImage.id}
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full h-full"
          >
            <Image
              src={currentImage.url}
              alt={currentImage.alt || productName}
              fill
              className={cn(
                'object-cover transition-transform duration-300',
                isHovering && 'scale-110'
              )}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={currentIndex === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Zoom button */}
        <button
          onClick={() => setIsZoomed(true)}
          className={cn(
            'absolute top-4 right-4 p-2 rounded-full neo-raised transition-opacity',
            isHovering ? 'opacity-100' : 'opacity-0'
          )}
          aria-label="Zoom image"
        >
          <ZoomIn className="h-5 w-5 text-slate-300" />
        </button>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className={cn(
                'absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full neo-raised transition-all',
                'opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95',
                'focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary'
              )}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6 text-slate-300" />
            </button>
            <button
              onClick={goToNext}
              className={cn(
                'absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full neo-raised transition-all',
                'opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95',
                'focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary'
              )}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6 text-slate-300" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentIndex
                    ? 'w-6 bg-accent-primary'
                    : 'bg-slate-500 hover:bg-slate-400'
                )}
                aria-label={`Go to image ${index + 1}`}
                aria-current={index === currentIndex ? 'true' : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => goToImage(index)}
              className={cn(
                'relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary',
                index === currentIndex
                  ? 'ring-2 ring-accent-primary ring-offset-2 ring-offset-surface-base'
                  : 'opacity-60 hover:opacity-100'
              )}
              aria-label={`View image ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : undefined}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} - Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 p-2 text-white hover:text-slate-300 transition-colors"
              aria-label="Close zoom"
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <motion.div
              className="relative w-full max-w-4xl aspect-square"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={currentImage.url}
                alt={currentImage.alt || productName}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrev()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-surface-base/50 hover:bg-surface-base transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-8 w-8 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNext()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-surface-base/50 hover:bg-surface-base transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-8 w-8 text-white" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
