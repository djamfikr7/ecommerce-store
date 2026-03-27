'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { Locale, locales, localeNames, defaultLocale } from './locale-provider'
import { cn } from '@/lib/utils'

interface LocaleSwitcherProps {
  currentLocale: Locale
  className?: string
}

const flagEmojis: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  ja: '🇯🇵',
  zh: '🇨🇳',
}

export function LocaleSwitcher({ currentLocale, className }: LocaleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const switchLocale = (locale: Locale) => {
    setIsOpen(false)

    // Extract path without locale prefix
    const pathWithoutLocale = pathname.replace(/^\/(en|es|fr|de|ja|zh)/, '') || '/'
    const newPath = locale === defaultLocale ? pathWithoutLocale : `/${locale}${pathWithoutLocale}`

    // Navigate to new path
    router.push(newPath)

    // Set cookie for persistence
    document.cookie = `preferred-locale=${locale};path=/;max-age=31536000;SameSite=Lax`
  }

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'neo-raised text-sm text-slate-300',
          'hover:text-white hover:shadow-lg',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-accent-primary/50',
          isOpen && 'ring-2 ring-accent-primary/50'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{flagEmojis[currentLocale]}</span>
        <span className="hidden sm:inline">{currentLocale.toUpperCase()}</span>
        <ChevronDown
          className={cn(
            'h-3 w-3 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute right-0 mt-2 w-48 py-2 rounded-xl',
              'neo-inset glass border border-white/10',
              'shadow-xl shadow-black/20',
              'z-50'
            )}
            role="listbox"
            aria-label="Language options"
          >
            {locales.map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => switchLocale(locale)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left',
                  'transition-colors duration-150',
                  'hover:bg-white/5',
                  currentLocale === locale && 'bg-accent-primary/10'
                )}
                role="option"
                aria-selected={currentLocale === locale}
              >
                <span className="text-lg">{flagEmojis[locale]}</span>
                <span className="flex-1 text-sm text-slate-200">
                  {localeNames[locale]}
                </span>
                <span className="text-xs text-slate-500">
                  {locale.toUpperCase()}
                </span>
                {currentLocale === locale && (
                  <Check className="h-4 w-4 text-accent-primary" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
