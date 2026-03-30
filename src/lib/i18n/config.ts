import {
  locales,
  defaultLocale,
  localeNames,
  localeCurrencies,
  RTL_LOCALES,
  isRTLLocale,
} from './routing'

export type Locale = (typeof locales)[number]

export { locales, defaultLocale, localeNames, localeCurrencies, RTL_LOCALES, isRTLLocale }

export const supportedLocales = locales as unknown as string[]

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean)
  const potentialLocale = segments[0]
  if (potentialLocale && isValidLocale(potentialLocale)) {
    return potentialLocale
  }
  return defaultLocale
}

export function getDirection(locale: string): 'ltr' | 'rtl' {
  return isRTLLocale(locale) ? 'rtl' : 'ltr'
}

export const LOCALE_INTL_MAP: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  ar: 'ar-SA',
  de: 'de-DE',
  ja: 'ja-JP',
  zh: 'zh-CN',
}

export function getIntlLocale(locale: string): string {
  return LOCALE_INTL_MAP[locale] ?? locale
}
