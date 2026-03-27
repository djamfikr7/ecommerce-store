import { locales, defaultLocale, localeNames, localeCurrencies } from './routing'

export type Locale = typeof locales[number]

export { locales, defaultLocale, localeNames, localeCurrencies }

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
