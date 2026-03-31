'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { ContactForm } from '@/components/support/contact-form'
import { Card, CardContent } from '@/components/ui/card'
import { StaggerContainer, StaggerItem } from '@/components/design-system/page-transition'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

const contactInfo = [
  {
    icon: <Mail className="h-5 w-5" />,
    label: 'Email',
    value: 'support@voltstore.com',
    href: 'mailto:support@voltstore.com',
  },
  {
    icon: <Phone className="h-5 w-5" />,
    label: 'Phone',
    value: '+1 (555) 123-4567',
    href: 'tel:+15551234567',
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    label: 'Address',
    value: '123 Commerce St, San Francisco, CA 94105',
    href: 'https://maps.google.com/?q=123+Commerce+St+San+Francisco+CA+94105',
  },
  {
    icon: <Clock className="h-5 w-5" />,
    label: 'Hours',
    value: 'Mon - Fri: 9AM - 6PM PST',
    href: null,
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Container className="py-12 lg:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-3 text-4xl font-bold text-slate-100 lg:text-5xl">Get in Touch</h1>
          <p className="mx-auto max-w-xl text-lg text-slate-400">
            Have a question or need help? We&apos;d love to hear from you. Send us a message and
            we&apos;ll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Contact Info Sidebar */}
          <StaggerContainer className="space-y-4 lg:col-span-2" delay={0.1}>
            {contactInfo.map((item) => (
              <StaggerItem key={item.label}>
                <Card>
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="neo-raised-sm flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-accent-primary">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{item.label}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          target={item.href.startsWith('http') ? '_blank' : undefined}
                          rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="mt-0.5 text-slate-200 transition-colors hover:text-accent-primary"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="mt-0.5 text-slate-200">{item.value}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}

            {/* Google Maps Embed */}
            <StaggerItem>
              <Card className="overflow-hidden">
                <iframe
                  title="Store Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0977817377274!2d-122.39901492392043!3d37.78779791202476!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085807abad77c31%3A0x3930c3a4f20d7a7!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hue-rotate-180 invert"
                />
              </Card>
            </StaggerItem>
          </StaggerContainer>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <h2 className="mb-4 text-xl font-semibold text-slate-200">Send us a Message</h2>
            <ContactForm />
          </motion.div>
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-slate-500">
            Looking for quick answers?{' '}
            <Link href="/faq" className="text-accent-primary transition-colors hover:underline">
              Check our FAQ
            </Link>
            {' or '}
            <Link href="/support" className="text-accent-primary transition-colors hover:underline">
              visit Support Center
            </Link>
          </p>
        </motion.div>
      </Container>
    </div>
  )
}
