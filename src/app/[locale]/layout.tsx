import type { Metadata } from 'next'
import { LocaleLayoutContent } from './locale-layout-content'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'E-Commerce Store',
  description: 'A full-featured e-commerce platform with dark neomorphic design',
}

export function generateStaticParams() {
  return [{ locale: 'en' }]
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Only allow English locale for now
  if (locale !== 'en') {
    notFound()
  }

  return <LocaleLayoutContent locale={locale}>{children}</LocaleLayoutContent>
}
