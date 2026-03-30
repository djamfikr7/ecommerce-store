'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StaggerContainer, StaggerItem } from '@/components/design-system/page-transition'

const footerSections = {
  shop: [
    { href: '/products', label: 'All Products' },
    { href: '/categories', label: 'Categories' },
    { href: '/deals', label: 'Deals & Offers' },
    { href: '/new-arrivals', label: 'New Arrivals' },
    { href: '/best-sellers', label: 'Best Sellers' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/careers', label: 'Careers' },
    { href: '/press', label: 'Press' },
    { href: '/blog', label: 'Blog' },
  ],
  support: [
    { href: '/help', label: 'Help Center' },
    { href: '/shipping', label: 'Shipping Info' },
    { href: '/returns', label: 'Returns & Exchanges' },
    { href: '/faq', label: 'FAQ' },
    { href: '/size-guide', label: 'Size Guide' },
  ],
  categories: [
    { href: '/categories/electronics', label: 'Electronics' },
    { href: '/categories/fashion', label: 'Fashion' },
    { href: '/categories/home-living', label: 'Home & Living' },
    { href: '/categories/sports', label: 'Sports' },
    { href: '/categories/beauty', label: 'Beauty' },
  ],
}

const legalLinks = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/cookies', label: 'Cookie Policy' },
  { href: '/accessibility', label: 'Accessibility' },
]

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
  },
  {
    label: 'Twitter',
    href: 'https://twitter.com',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s.002 3.255-.418 4.814a2.504 2.504 0 01-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 01-1.768-1.768C2.002 15.255 2 12 2 12s.002-3.255.418-4.814a2.505 2.505 0 011.768-1.768C5.744 5 12 5 12 5s6.255 0 7.814.418zM15.194 12l-5.39-3.104v6.208L15.194 12z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
]

const paymentMethods = [
  {
    label: 'Visa',
    icon: (
      <svg className="h-8 w-12" viewBox="0 0 48 32" fill="none" aria-hidden="true">
        <rect width="48" height="32" rx="4" className="fill-surface-elevated" />
        <path d="M19.2 21.6h-3.1l1.9-11.2h3.1L19.2 21.6z" className="fill-slate-300" />
        <path
          d="M33.4 10.7c-.6-.2-1.6-.5-2.8-.5-3.1 0-5.3 1.6-5.3 3.9 0 1.7 1.6 2.6 2.7 3.2 1.2.6 1.6 1 1.6 1.5 0 .8-1 1.2-1.9 1.2-1.3 0-1.9-.2-3-.7l-.4-.2-.4 2.6c.7.3 2.1.6 3.5.7 3.3 0 5.5-1.6 5.5-4 0-1.3-.8-2.4-2.7-3.2-1.1-.6-1.8-1-1.8-1.5 0-.5.6-1 1.8-1 1 0 1.8.2 2.3.4l.3.1.4-2.5z"
          className="fill-slate-300"
        />
        <path
          d="M38.1 10.4h-2.4c-.8 0-1.3.2-1.7 1L29.6 21.6h3.2l.6-1.7h3.9l.4 1.7H40L38.1 10.4zm-3.7 7.4l1.2-3.3.4-1.2.3 1.1.7 3.4h-2.6z"
          className="fill-slate-300"
        />
        <path
          d="M14.6 10.4l-3 7.6-.3-1.5c-.6-1.8-2.3-3.8-4.2-4.8l2.8 10h3.3l4.9-11.2h-3.5z"
          className="fill-slate-300"
        />
        <path
          d="M8.7 10.4H3.6v.3c4 .9 6.6 3.2 7.7 6l-1.1-5.3c-.2-.8-.7-1-1.5-1z"
          className="fill-slate-300"
        />
      </svg>
    ),
  },
  {
    label: 'Mastercard',
    icon: (
      <svg className="h-8 w-12" viewBox="0 0 48 32" fill="none" aria-hidden="true">
        <rect width="48" height="32" rx="4" className="fill-surface-elevated" />
        <circle cx="19" cy="16" r="8" className="fill-red-500/70" />
        <circle cx="29" cy="16" r="8" className="fill-yellow-500/70" />
        <path d="M24 10.3a8 8 0 010 11.4 8 8 0 000-11.4z" className="fill-orange-500/70" />
      </svg>
    ),
  },
  {
    label: 'PayPal',
    icon: (
      <svg className="h-8 w-12" viewBox="0 0 48 32" fill="none" aria-hidden="true">
        <rect width="48" height="32" rx="4" className="fill-surface-elevated" />
        <path
          d="M18.4 22h-2.5a.5.5 0 01-.5-.6l1.9-12c0-.2.2-.4.5-.4h4.3c2.5 0 3.4 1.3 3.1 3.2-.3 2.2-1.7 3.5-4 3.5h-1.7c-.2 0-.4.2-.5.4l-.6 5.5c0 .2-.2.4-.5.4z"
          className="fill-blue-400/80"
        />
        <path
          d="M22 10h2.5c2.8 0 3.8 1.5 3.5 3.5-.4 2.5-2 4-4.7 4h-1.5c-.3 0-.5.2-.5.5l-.6 5c0 .2-.2.4-.5.4h-2.5a.5.5 0 01-.5-.6l1.8-12c.1-.2.3-.4.5-.4z"
          className="fill-blue-300/60"
        />
      </svg>
    ),
  },
  {
    label: 'Apple Pay',
    icon: (
      <svg className="h-8 w-12" viewBox="0 0 48 32" fill="none" aria-hidden="true">
        <rect width="48" height="32" rx="4" className="fill-surface-elevated" />
        <text
          x="12"
          y="20"
          className="fill-slate-300"
          fontSize="9"
          fontWeight="600"
          fontFamily="system-ui"
        >
          Pay
        </text>
        <path
          d="M15.5 12.5a2.3 2.3 0 00-1.6-1 3.3 3.3 0 00-2.2.9c-.6.6-.9 1.3-.9 2.1 0 .8.3 1.6.9 2.1.5.5 1.1.8 1.8.8.4 0 .8-.1 1.1-.4.3-.2.5-.5.6-.8.2-.5.2-1 0-1.5a3.3 3.3 0 00-.7-1.2z"
          className="fill-slate-300"
        />
      </svg>
    ),
  },
  {
    label: 'Google Pay',
    icon: (
      <svg className="h-8 w-12" viewBox="0 0 48 32" fill="none" aria-hidden="true">
        <rect width="48" height="32" rx="4" className="fill-surface-elevated" />
        <text
          x="6"
          y="20"
          className="fill-slate-300"
          fontSize="8"
          fontWeight="500"
          fontFamily="system-ui"
        >
          G Pay
        </text>
      </svg>
    ),
  },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <footer className="neo-raised border-border-subtle mt-auto border-t" role="contentinfo">
      <Container className="py-12 lg:py-16">
        <StaggerContainer className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {/* Brand & Newsletter */}
          <StaggerItem className="col-span-2">
            <Link href="/" className="inline-block">
              <h3 className="gradient-text text-2xl font-bold">Store</h3>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Your premium destination for modern shopping with an exceptional experience. Discover
              curated collections from top brands worldwide.
            </p>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold text-slate-200">Stay Updated</h4>
              {subscribed ? (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-accent-success"
                >
                  Thanks for subscribing!
                </motion.p>
              ) : (
                <form className="flex gap-2" onSubmit={handleSubscribe}>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1"
                    aria-label="Email for newsletter"
                    required
                  />
                  <Button type="submit" size="sm">
                    Subscribe
                  </Button>
                </form>
              )}
            </div>
          </StaggerItem>

          {/* Shop */}
          <StaggerItem>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-200">
              Shop
            </h4>
            <ul className="space-y-2.5">
              {footerSections.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-slate-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </StaggerItem>

          {/* Categories */}
          <StaggerItem>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-200">
              Categories
            </h4>
            <ul className="space-y-2.5">
              {footerSections.categories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-slate-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </StaggerItem>

          {/* Company */}
          <StaggerItem>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-200">
              Company
            </h4>
            <ul className="space-y-2.5">
              {footerSections.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-slate-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </StaggerItem>

          {/* Support */}
          <StaggerItem>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-200">
              Support
            </h4>
            <ul className="space-y-2.5">
              {footerSections.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-slate-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </StaggerItem>
        </StaggerContainer>

        <Separator className="mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="neo-flat hover:neo-glow flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:text-white"
                aria-label={link.label}
              >
                {link.icon}
              </motion.a>
            ))}
          </div>

          {/* Payment Methods */}
          <div
            className="flex items-center gap-2"
            role="list"
            aria-label="Accepted payment methods"
          >
            {paymentMethods.map((method) => (
              <div
                key={method.label}
                className="neo-raised-sm overflow-hidden rounded-md"
                role="listitem"
                aria-label={method.label}
              >
                {method.icon}
              </div>
            ))}
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-slate-300"
              >
                {link.label}
              </Link>
            ))}
            <span className="text-slate-600">|</span>
            <p>&copy; {new Date().getFullYear()} Store. All rights reserved.</p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
