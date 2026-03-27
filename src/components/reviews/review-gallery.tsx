'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReviewImage {
  id: string
  url: string
  alt?: string
}

interface ReviewGalleryProps {
  images: ReviewImage[]
  productName?: string
  maxDisplay?: number
  className?: string
}

export function ReviewGallery({
  images,
  productName,
  maxDisplay = 6,
  className,
}: ReviewGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
  }

  const closeLightbox = () => {
    setSelectedIndex(null)
  }

  const goToPrevious = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev === 0 ? images.length - 1 : prev - 1) : null
    )
  }, [images.length])

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev === images.length - 1 ? 0 : prev + 1) : null
    )
  }, [images.length])

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox()
      } else if (e.key === 'ArrowLeft') {
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [selectedIndex, goToPrevious, goToNext])

  const displayedImages = images.slice(0, maxDisplay)
  const remainingCount = images.length - maxDisplay

  if (images.length === 0) {
    return null
  }

  return (
    <>
      <div className={cn('grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2', className)}>
        {displayedImages.map((image, index) => (
          <motion.button
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => openLightbox(index)}
            className="relative aspect-square rounded-lg overflow-hidden neo-raised-sm hover:ring-2 hover:ring-accent-primary transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            aria-label={`View image ${index + 1}${image.alt ? `: ${image.alt}` : ''}`}
          >
            <Image
              src={image.url}
              alt={image.alt || `Review image ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
            />
          </motion.button>
        ))}

        {remainingCount > 0 && (
          <button
            onClick={() => openLightbox(maxDisplay)}
            className="relative aspect-square rounded-lg overflow-hidden neo-raised-sm bg-surface-overlay hover:ring-2 hover:ring-accent-primary transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary flex items-center justify-center"
            aria-label={`View ${remainingCount} more images`}
          >
            <div className="absolute inset-0 bg-black/50" />
            <span className="relative text-lg font-semibold text-white">
              +{remainingCount}
            </span>
          </button>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={closeLightbox}
            role="dialog"
            aria-label={`Image ${selectedIndex + 1} of ${images.length}${productName ? ` - ${productName}` : ''}`}
            aria-modal="true"
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 rounded-full neo-raised-sm hover:bg-white/10 transition-colors z-10"
              aria-label="Close image viewer"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation - Previous */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
                className="absolute left-4 p-3 rounded-full neo-raised-sm hover:bg-white/10 transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
            )}

            {/* Main Image */}
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl h-[70vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[selectedIndex].url}
                alt={images[selectedIndex].alt || `Review image ${selectedIndex + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority
              />
            </motion.div>

            {/* Navigation - Next */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                className="absolute right-4 p-3 rounded-full neo-raised-sm hover:bg-white/10 transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full neo-raised-sm">
              <span className="text-sm text-slate-300">
                {selectedIndex + 1} / {images.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function ReviewGallerySkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-square rounded-lg bg-surface-overlay neo-raised-sm" />
      ))}
    </div>
  )
}
