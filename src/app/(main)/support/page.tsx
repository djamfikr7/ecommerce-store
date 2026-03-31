'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StaggerContainer, StaggerItem } from '@/components/design-system/page-transition'
import {
  HelpCircle,
  Mail,
  Package,
  RotateCcw,
  Truck,
  CreditCard,
  Shield,
  MessageCircle,
  BookOpen,
  ArrowRight,
} from 'lucide-react'

const supportLinks = [
  {
    title: 'FAQ',
    description: 'Find answers to commonly asked questions about orders, payments, and more.',
    icon: <HelpCircle className="h-6 w-6" />,
    href: '/faq',
    color: 'text-accent-primary',
    bgColor: 'bg-accent-primary/20',
  },
  {
    title: 'Contact Us',
    description: 'Get in touch with our support team. We typically respond within 24 hours.',
    icon: <Mail className="h-6 w-6" />,
    href: '/contact',
    color: 'text-accent-info',
    bgColor: 'bg-accent-info/20',
  },
  {
    title: 'Order Tracking',
    description: 'Track your orders in real-time and get estimated delivery dates.',
    icon: <Truck className="h-6 w-6" />,
    href: '/my-orders',
    color: 'text-accent-success',
    bgColor: 'bg-accent-success/20',
  },
  {
    title: 'Returns & Exchanges',
    description: 'Start a return or exchange for items within our 30-day return window.',
    icon: <RotateCcw className="h-6 w-6" />,
    href: '/my-orders',
    color: 'text-accent-warning',
    bgColor: 'bg-accent-warning/20',
  },
  {
    title: 'Shipping Info',
    description: 'Learn about shipping options, rates, and delivery timeframes.',
    icon: <Package className="h-6 w-6" />,
    href: '/faq',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/20',
  },
  {
    title: 'Payment Help',
    description: 'Information about payment methods, billing, and security.',
    icon: <CreditCard className="h-6 w-6" />,
    href: '/faq',
    color: 'text-pink-400',
    bgColor: 'bg-pink-400/20',
  },
]

const helpTopics = [
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Account Security',
    description: 'Password resets, two-factor authentication, and account protection.',
  },
  {
    icon: <MessageCircle className="h-5 w-5" />,
    title: 'Live Chat',
    description: 'Chat with our team in real-time during business hours (9AM-6PM PST).',
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: 'Help Guides',
    description: 'Step-by-step guides for common tasks and troubleshooting.',
  },
]

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <Container className="py-12 lg:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-3 text-4xl font-bold text-slate-100 lg:text-5xl">Support Center</h1>
          <p className="mx-auto max-w-xl text-lg text-slate-400">
            We&apos;re here to help. Browse our support resources or reach out directly.
          </p>
        </motion.div>

        {/* Main Support Links */}
        <StaggerContainer className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" delay={0.1}>
          {supportLinks.map((link) => (
            <StaggerItem key={link.title}>
              <Link href={link.href}>
                <Card hoverable className="hover:border-border-strong h-full transition-all">
                  <CardContent className="flex h-full flex-col p-6">
                    <div
                      className={`neo-raised-sm mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${link.bgColor} ${link.color}`}
                    >
                      {link.icon}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-slate-100">{link.title}</h3>
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-400">
                      {link.description}
                    </p>
                    <span className="flex items-center gap-1 text-sm font-medium text-accent-primary">
                      Learn more
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Additional Help Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="mb-6 text-2xl font-semibold text-slate-100">More Ways We Can Help</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {helpTopics.map((topic) => (
              <Card key={topic.title}>
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="neo-flat flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-accent-primary">
                    {topic.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-200">{topic.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{topic.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="neo-card mt-12 rounded-2xl p-8 text-center lg:p-12"
        >
          <h2 className="mb-2 text-2xl font-semibold text-slate-100">
            Can&apos;t find what you need?
          </h2>
          <p className="mb-6 text-slate-400">
            Our dedicated support team is available Monday through Friday, 9AM to 6PM PST.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/contact">
              <Button size="lg">
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="outline" size="lg">
                Browse FAQ
              </Button>
            </Link>
          </div>
        </motion.div>
      </Container>
    </div>
  )
}
