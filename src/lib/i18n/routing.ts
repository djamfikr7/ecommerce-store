import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'es', 'fr', 'de', 'ja', 'zh'],
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
  }
})

export const locales = routing.locales
export type Locale = (typeof locales)[number]
export const defaultLocale = routing.defaultLocale

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
  zh: '中文',
}

export const localeCurrencies: Record<Locale, string> = {
  en: 'USD',
  es: 'EUR',
  fr: 'EUR',
  de: 'EUR',
  ja: 'JPY',
  zh: 'CNY',
}

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
