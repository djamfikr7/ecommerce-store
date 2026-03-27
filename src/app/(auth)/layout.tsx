import type { Metadata } from 'next'
import Link from 'next/link'
import { Store } from 'lucide-react'
import { LocaleSwitcher } from '@/components/i18n/locale-switcher'
import { useLocale, type Locale } from '@/components/i18n/locale-provider'

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Sign in or create an account',
}

function AuthLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { locale } = useLocale()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Language Selector */}
      <div className="absolute top-4 right-4">
        <LocaleSwitcher currentLocale={locale} />
      </div>

      {/* Logo */}
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="p-2 neo-raised rounded-lg">
            <Store className="h-6 w-6 text-accent-primary" />
          </div>
          <span className="text-2xl font-bold gradient-text">Store</span>
        </Link>
      </div>

      {/* Auth Content */}
      <div className="w-full">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-slate-500">
        By continuing, you agree to our{' '}
        <Link href="/terms" className="text-slate-400 hover:text-slate-300">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-slate-400 hover:text-slate-300">
          Privacy Policy
        </Link>
      </p>
    </div>
  )
}

export default function AuthLayout(props: { children: React.ReactNode }) {
  return <AuthLayoutContent {...props} />
}
