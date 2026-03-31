import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'es', 'fr', 'ar', 'de', 'ja', 'zh'],
  defaultLocale: 'en',
  pathnames: {
    '/': '/',
    '/products': '/products',
    '/products/[slug]': '/products/[slug]',
    '/cart': '/cart',
    '/checkout': '/checkout',
    '/orders': '/orders',
    '/wishlist': '/wishlist',
    '/profile': '/profile',
  },
})

export const locales = routing.locales
export type Locale = (typeof locales)[number]
export const defaultLocale = routing.defaultLocale

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  ar: 'العربية',
  de: 'Deutsch',
  ja: '日本語',
  zh: '中文',
}

export const localeCurrencies: Record<Locale, string> = {
  en: 'USD',
  es: 'EUR',
  fr: 'EUR',
  ar: 'USD',
  de: 'EUR',
  ja: 'JPY',
  zh: 'CNY',
}

export const RTL_LOCALES: readonly Locale[] = ['ar']

export function isRTLLocale(locale: string): boolean {
  return (RTL_LOCALES as readonly string[]).includes(locale)
}

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
