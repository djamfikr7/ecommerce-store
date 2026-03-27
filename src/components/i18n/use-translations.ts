'use client'

import { useTranslations as useNextIntlTranslations } from 'next-intl'

// Type-safe translation keys
export type TranslationKeys = {
  common: {
    shop: string
    learnMore: string
    viewAll: string
    addToCart: string
    continueShopping: string
    loading: string
    error: string
    save: string
    cancel: string
    delete: string
    edit: string
    back: string
    next: string
    previous: string
    search: string
    filter: string
    sort: string
  }
  nav: {
    products: string
    categories: string
    deals: string
    about: string
    cart: string
    wishlist: string
    profile: string
    orders: string
    addresses: string
    settings: string
    login: string
    register: string
    logout: string
  }
  home: {
    hero: {
      title: string
      subtitle: string
    }
    featured: {
      title: string
      badge: string
    }
    features: {
      title: string
      designTitle: string
      designDesc: string
      paymentsTitle: string
      paymentsDesc: string
      currencyTitle: string
      currencyDesc: string
    }
    cta: {
      title: string
      subtitle: string
      button: string
    }
  }
  product: {
    price: string
    quantity: string
    description: string
    specifications: string
    reviews: string
    relatedProducts: string
    outOfStock: string
    inStock: string
    addToCart: string
    buyNow: string
  }
  cart: {
    title: string
    items: string
    item: string
    empty: string
    emptyDesc: string
    subtotal: string
    shipping: string
    tax: string
    total: string
    checkout: string
    remove: string
    summary: string
    promoCode: string
    apply: string
    secureCheckout: string
    freeReturns: string
  }
  checkout: {
    title: string
    billing: string
    shipping: string
    payment: string
    review: string
    placeOrder: string
    continue: string
    back: string
  }
  profile: {
    title: string
    subtitle: string
    infoTitle: string
    infoDesc: string
    photoLabel: string
    nameLabel: string
    emailLabel: string
    phoneLabel: string
    emailNote: string
    photoNote: string
    success: string
  }
  orders: {
    title: string
    empty: string
    emptyDesc: string
    orderNumber: string
    date: string
    status: string
    total: string
    viewDetails: string
    pending: string
    processing: string
    shipped: string
    delivered: string
    cancelled: string
  }
  wishlist: {
    title: string
    empty: string
    emptyDesc: string
    moveToCart: string
    remove: string
  }
  errors: {
    required: string
    invalidEmail: string
    invalidPhone: string
    minLength: string
    maxLength: string
    generic: string
  }
}

/**
 * Hook for accessing typed translations
 * Wraps next-intl's useTranslations with typed keys
 */
export function useTranslation(namespace?: keyof TranslationKeys) {
  const t = useNextIntlTranslations()

  return {
    t,
    // Helper for nested keys
    tNested: (key: string, options?: Record<string, unknown>) => t(key, options),
  }
}

/**
 * Hook for getting translation function with specific namespace
 */
export function useTranslations(namespace: keyof TranslationKeys) {
  const t = useNextIntlTranslations(namespace)

  return {
    t,
    tNested: (key: string, options?: Record<string, unknown>) => t(key, options),
  }
}
