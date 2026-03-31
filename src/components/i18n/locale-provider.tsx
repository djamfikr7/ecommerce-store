'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export type Locale = 'en' | 'es' | 'fr' | 'ar' | 'de' | 'ja' | 'zh'

export const locales: Locale[] = ['en', 'es', 'fr', 'ar', 'de', 'ja', 'zh']
export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Espanol',
  fr: 'Francais',
  ar: 'العربية',
  de: 'Deutsch',
  ja: '日本語',
  zh: '中文',
}

export const localeFlags: Record<Locale, string> = {
  en: 'US',
  es: 'ES',
  fr: 'FR',
  ar: 'SA',
  de: 'DE',
  ja: 'JP',
  zh: 'CN',
}

export const RTL_LOCALES: Locale[] = ['ar']

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  isLoading: boolean
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

const LOCALE_COOKIE = 'preferred-locale'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

function setCookie(name: string, value: string, days: number = 365) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

function detectLocale(): Locale {
  // Check cookie first
  const cookieLocale = getCookie(LOCALE_COOKIE) as Locale | null
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale
  }

  // Check browser language
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language.split('-')[0] as Locale
    if (locales.includes(browserLang)) {
      return browserLang
    }
  }

  return defaultLocale
}

interface LocaleProviderProps {
  children: ReactNode
  initialLocale?: Locale
}

export function LocaleProvider({ children, initialLocale }: LocaleProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale)
  const [isLoading, setIsLoading] = useState(!initialLocale)

  useEffect(() => {
    if (initialLocale) {
      setLocaleState(initialLocale)
      setIsLoading(false)
    } else {
      const detected = detectLocale()
      setLocaleState(detected)
      setIsLoading(false)
    }
  }, [initialLocale])

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr'
  }, [locale])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    setCookie(LOCALE_COOKIE, newLocale)

    // Navigate to the same path with new locale
    const currentPath = pathname.replace(/^\/(en|es|fr|ar|de|ja|zh)/, '')
    const newPath = `/${newLocale}${currentPath || '/'}`
    router.push(newPath)
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, isLoading }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
