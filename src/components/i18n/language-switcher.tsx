'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LocaleOption {
  code: string
  name: string
  nativeName: string
  flag: string
  direction: 'ltr' | 'rtl'
}

export const LOCALE_OPTIONS: LocaleOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', direction: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', direction: 'rtl' },
]

export const DEFAULT_LOCALE = 'en'

const ALL_LOCALE_CODES = LOCALE_OPTIONS.map((l) => l.code)

const RTL_LOCALES = LOCALE_OPTIONS.filter((l) => l.direction === 'rtl').map((l) => l.code)

export function isRTL(locale: string): boolean {
  return RTL_LOCALES.includes(locale)
}

const LOCALE_COOKIE = 'preferred-locale'
const COOKIE_MAX_AGE = 31536000

interface LanguageSwitcherProps {
  currentLocale?: string
  className?: string
  onLocaleChange?: (locale: string) => void
}

function getCookieLocale(): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${LOCALE_COOKIE}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null
  return null
}

function setCookieLocale(locale: string): void {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`
}

export function LanguageSwitcher({
  currentLocale,
  className,
  onLocaleChange,
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  const active = currentLocale ?? getCookieLocale() ?? DEFAULT_LOCALE
  const activeOption: LocaleOption = LOCALE_OPTIONS.find((l) => l.code === active) ?? {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  const switchLocale = (code: string) => {
    setIsOpen(false)
    setCookieLocale(code)

    const dir = isRTL(code) ? 'rtl' : 'ltr'
    document.documentElement.lang = code
    document.documentElement.dir = dir

    if (onLocaleChange) {
      onLocaleChange(code)
      return
    }

    const pathWithoutLocale =
      pathname.replace(new RegExp(`^\\/(${ALL_LOCALE_CODES.join('|')})`), '') || '/'
    const newPath = code === DEFAULT_LOCALE ? pathWithoutLocale : `/${code}${pathWithoutLocale}`

    router.push(newPath)
  }

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2',
          'neo-raised text-sm text-slate-300',
          'hover:text-white hover:shadow-lg',
          'transition-all duration-200',
          'focus:ring-accent-primary/50 focus:outline-none focus:ring-2',
          isOpen && 'ring-accent-primary/50 ring-2',
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{activeOption.flag}</span>
        <span className="hidden sm:inline">{activeOption.code.toUpperCase()}</span>
        <ChevronDown
          className={cn('h-3 w-3 transition-transform duration-200', isOpen && 'rotate-180')}
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
              'absolute end-0 mt-2 w-52 rounded-xl py-2',
              'neo-inset glass border border-white/10',
              'shadow-xl shadow-black/20',
              'z-50',
            )}
            role="listbox"
            aria-label="Language options"
          >
            <div className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
              Language
            </div>

            {LOCALE_OPTIONS.map((locale) => (
              <button
                key={locale.code}
                type="button"
                onClick={() => switchLocale(locale.code)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2.5 text-start',
                  'transition-colors duration-150',
                  'hover:bg-white/5',
                  active === locale.code && 'bg-accent-primary/10',
                )}
                role="option"
                aria-selected={active === locale.code}
              >
                <span className="text-lg leading-none">{locale.flag}</span>
                <span className="flex-1 text-sm text-slate-200">{locale.nativeName}</span>
                {locale.direction === 'rtl' && (
                  <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                    RTL
                  </span>
                )}
                {active === locale.code && <Check className="h-4 w-4 text-accent-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
