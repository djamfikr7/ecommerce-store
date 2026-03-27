'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useLocale, type Locale } from '@/components/i18n/locale-provider'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Badge } from '@/components/ui/badge'
import { UserButton } from '@/components/auth/user-button'
import { SearchAutocomplete } from '@/components/product/search-autocomplete'
import { LocaleSwitcher } from '@/components/i18n/locale-switcher'
import { CurrencySelector } from '@/components/currency/currency-selector'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const { locale } = useLocale()
  const cartItemCount = 3 // TODO: connect to cart store

  const navLinks = [
    { href: '/products', label: 'Products' },
    { href: '/categories', label: 'Categories' },
    { href: '/deals', label: 'Deals' },
    { href: '/about', label: 'About' },
  ]

  return (
    <header className="sticky top-0 z-50 glass border-b border-border-subtle">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold gradient-text">Store</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-300 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Locale Switcher */}
            <div className="hidden lg:block">
              <LocaleSwitcher currentLocale={locale} />
            </div>

            {/* Currency Selector */}
            <div className="hidden lg:block">
              <CurrencySelector />
            </div>

            {/* Desktop Search */}
            <div className="hidden lg:block w-64 xl:w-80">
              <SearchAutocomplete />
            </div>

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Search"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </Button>

            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" aria-label="Shopping cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="danger"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User */}
            <div className="hidden lg:block">
              <UserButton />
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden py-4 border-t border-border-subtle"
            >
              <SearchAutocomplete onSearch={(query) => {
                window.location.href = `/products?search=${encodeURIComponent(query)}`
              }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden py-4 border-t border-border-subtle"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-slate-300 hover:text-white transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
                  <LocaleSwitcher currentLocale={locale} />
                  <CurrencySelector />
                </div>
                <div className="pt-2 border-t border-border-subtle">
                  <UserButton />
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </Container>
    </header>
  )
}
