'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, Maximize, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductVideoProps {
  src: string
  poster?: string
  alt: string
  className?: string
}

export function ProductVideo({ src, poster, alt, className }: ProductVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
      setHasStarted(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }, [])

  const toggleFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {})
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {})
    }
  }, [])

  const handleEnded = useCallback(() => {
    setIsPlaying(false)
    setHasStarted(false)
  }, [])

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return
    const progress = videoRef.current.currentTime / videoRef.current.duration
    const bar = containerRef.current?.querySelector('[data-progress-bar]') as HTMLElement
    if (bar) {
      bar.style.width = `${progress * 100}%`
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        'neo-card group relative overflow-hidden rounded-xl',
        isFullscreen && 'fixed inset-0 z-50 flex items-center justify-center rounded-none bg-black',
        className,
      )}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={isMuted}
        playsInline
        loop
        className="h-full w-full object-cover"
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        aria-label={alt}
      />

      <AnimatePresence>
        {!hasStarted && (
          <motion.div
            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={togglePlay}
          >
            <motion.div
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-full',
                'bg-accent-primary/90 neo-glow shadow-lg',
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="ml-1 h-7 w-7 text-white" fill="white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 p-3',
          'bg-gradient-to-t from-black/70 to-transparent',
          'opacity-0 transition-opacity duration-300 group-hover:opacity-100',
        )}
      >
        <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-white/20">
          <div
            data-progress-bar
            className="h-full rounded-full bg-accent-primary transition-[width] duration-100"
            style={{ width: '0%' }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="rounded-full p-1.5 transition-colors hover:bg-white/20"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 text-white" />
              ) : (
                <Play className="h-4 w-4 text-white" />
              )}
            </button>
            <button
              onClick={toggleMute}
              className="rounded-full p-1.5 transition-colors hover:bg-white/20"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-white" />
              ) : (
                <Volume2 className="h-4 w-4 text-white" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/80">Video</span>
            {isFullscreen ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  document
                    .exitFullscreen()
                    .then(() => setIsFullscreen(false))
                    .catch(() => {})
                }}
                className="rounded-full p-1.5 transition-colors hover:bg-white/20"
                aria-label="Exit fullscreen"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            ) : (
              <button
                onClick={toggleFullscreen}
                className="rounded-full p-1.5 transition-colors hover:bg-white/20"
                aria-label="Fullscreen"
              >
                <Maximize className="h-4 w-4 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
