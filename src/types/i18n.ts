// i18n types for the e-commerce platform

export const locales = ['en', 'es', 'fr', 'de', 'ja', 'zh'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'en'

export interface LocaleConfig {
  code: Locale
  name: string
  nativeName: string
  direction: 'ltr' | 'rtl'
  currency: string
  dateFormat: string
}

export const localeConfigs: Record<Locale, LocaleConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    currency: 'JPY',
    dateFormat: 'YYYY/MM/DD',
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    direction: 'ltr',
    currency: 'CNY',
    dateFormat: 'YYYY/MM/DD',
  },
}

export type TranslationKey = string
export type TranslationParams = Record<string, string | number>

export interface TranslationOptions {
  locale?: Locale
  fallback?: string
}
