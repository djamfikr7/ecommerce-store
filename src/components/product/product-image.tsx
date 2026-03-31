'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ImageZoom } from './image-zoom'

interface ProductImageProps {
  src: string
  alt: string
  priority?: boolean
  blurDataURL?: string
  sizes?: string
  className?: string
  enableZoom?: boolean
  onDoubleClick?: () => void
}

export function ProductImage({
  src,
  alt,
  priority = false,
  blurDataURL,
  sizes = '(max-width: 768px) 100vw, 50vw',
  className,
  enableZoom = true,
  onDoubleClick,
}: ProductImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = useCallback(() => setIsLoading(false), [])
  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
  }, [])

  const imageElement = (
    <motion.div
      className={cn('relative h-full w-full', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoading ? 0 : 1 }}
      transition={{ duration: 0.4 }}
      onDoubleClick={onDoubleClick}
    >
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-surface-elevated">
          <div className="text-center">
            <svg
              className="mx-auto mb-2 h-12 w-12 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
              />
            </svg>
            <p className="text-xs text-slate-500">Image unavailable</p>
          </div>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={sizes}
          priority={priority}
          {...(blurDataURL ? { placeholder: 'blur' as const, blurDataURL } : {})}
          onLoad={handleLoad}
          onError={handleError}
          draggable={false}
        />
      )}

      <AnimatePresence>
        {isLoading && !hasError && (
          <motion.div
            className="shimmer absolute inset-0 rounded-xl"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )

  if (!enableZoom || hasError) {
    return imageElement
  }

  return (
    <ImageZoom src={src} alt={alt}>
      {imageElement}
    </ImageZoom>
  )
}
