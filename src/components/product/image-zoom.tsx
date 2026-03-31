'use client'

import { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface ImageZoomProps {
  src: string
  alt: string
  zoomScale?: number
  lensSize?: number
  children: React.ReactNode
}

export function ImageZoom({ src, alt, zoomScale = 2.5, lensSize = 160, children }: ImageZoomProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isZooming, setIsZooming] = useState(false)
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 })
  const [bgPosition, setBgPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const halfLens = lensSize / 2
      const clampedX = Math.max(halfLens, Math.min(x, rect.width - halfLens))
      const clampedY = Math.max(halfLens, Math.min(y, rect.height - halfLens))

      setLensPosition({ x: clampedX - halfLens, y: clampedY - halfLens })

      const bgX = (clampedX / rect.width) * 100
      const bgY = (clampedY / rect.height) * 100
      setBgPosition({ x: bgX, y: bgY })
    },
    [lensSize],
  )

  const handleMouseEnter = useCallback(() => setIsZooming(true), [])
  const handleMouseLeave = useCallback(() => setIsZooming(false), [])

  return (
    <div
      ref={containerRef}
      className="relative cursor-zoom-in overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="img"
      aria-label={`Zoom: ${alt}`}
    >
      {children}

      {isZooming && (
        <div
          className={cn(
            'pointer-events-none absolute z-20 rounded-full border-2 border-white/30',
            'shadow-[0_0_20px_rgba(99,102,241,0.3)]',
          )}
          style={{
            width: lensSize,
            height: lensSize,
            left: lensPosition.x,
            top: lensPosition.y,
            backgroundImage: `url(${src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${zoomScale * 100}%`,
            backgroundPosition: `${bgPosition.x}% ${bgPosition.y}%`,
          }}
        />
      )}
    </div>
  )
}
