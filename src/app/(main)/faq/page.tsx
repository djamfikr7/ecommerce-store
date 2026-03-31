'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { FaqAccordion } from '@/components/support/faq-accordion'
import { Button } from '@/components/ui/button'
import { ShoppingBag, CreditCard, Truck, RotateCcw, Shield, HelpCircle } from 'lucide-react'

const faqCategories = [
  {
    name: 'Orders & Shipping',
    icon: <Truck className="h-4 w-4" />,
    items: [
      {
        id: 'os-1',
        question: 'How long does shipping take?',
        answer:
          'Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days. Overnight shipping is available for select locations. You can track your order status at any time from your account dashboard.',
      },
      {
        id: 'os-2',
        question: 'Can I change or cancel my order?',
        answer:
          'You can modify or cancel your order within 1 hour of placing it. After that, the order enters processing and cannot be changed. Please contact our support team immediately if you need to make changes.',
      },
      {
        id: 'os-3',
        question: 'Do you ship internationally?',
        answer:
          "Yes! We ship to over 50 countries worldwide. International shipping typically takes 10-15 business days. Additional customs duties and taxes may apply depending on your country's regulations.",
      },
      {
        id: 'os-4',
        question: 'How do I track my order?',
        answer:
          'Once your order ships, you\'ll receive an email with a tracking number. You can also track your order by logging into your account and visiting the "My Orders" section. Real-time updates are available for all shipments.',
      },
    ],
  },
  {
    name: 'Payments & Billing',
    icon: <CreditCard className="h-4 w-4" />,
    items: [
      {
        id: 'pb-1',
        question: 'What payment methods do you accept?',
        answer:
          'We accept Visa, Mastercard, American Express, PayPal, Apple Pay, Google Pay, and cryptocurrency (Bitcoin, Ethereum). All transactions are secured with 256-bit SSL encryption.',
      },
      {
        id: 'pb-2',
        question: 'Is my payment information secure?',
        answer:
          'Absolutely. We use Stripe for payment processing, which is PCI DSS Level 1 certified — the highest level of certification in the payments industry. We never store your full card details on our servers.',
      },
      {
        id: 'pb-3',
        question: 'Can I pay in my local currency?',
        answer:
          'Yes! We support over 30 currencies. Your currency is automatically detected based on your location, or you can manually switch it using the currency selector in the header. Prices are updated in real-time based on exchange rates.',
      },
      {
        id: 'pb-4',
        question: 'Why was my payment declined?',
        answer:
          'Payments can be declined due to insufficient funds, incorrect card details, expired cards, or bank security measures. Please verify your information and try again, or contact your bank if the issue persists.',
      },
    ],
  },
  {
    name: 'Returns & Refunds',
    icon: <RotateCcw className="h-4 w-4" />,
    items: [
      {
        id: 'rr-1',
        question: 'What is your return policy?',
        answer:
          'We offer a 30-day return policy for most items. Products must be unused, in original packaging, and accompanied by the receipt. Some items like personalized products and intimate apparel are non-returnable.',
      },
      {
        id: 'rr-2',
        question: 'How do I initiate a return?',
        answer:
          'Log into your account, go to "My Orders," find the item you want to return, and click "Request Return." Print the prepaid shipping label and drop off the package at any authorized shipping location.',
      },
      {
        id: 'rr-3',
        question: 'When will I receive my refund?',
        answer:
          "Refunds are processed within 5-7 business days after we receive and inspect the returned item. The refund will be credited to your original payment method. You'll receive an email confirmation once processed.",
      },
      {
        id: 'rr-4',
        question: 'Can I exchange an item instead of returning it?',
        answer:
          'Yes! When initiating a return, select "Exchange" and choose the replacement item. We\'ll ship the new item as soon as we receive your return. If the new item costs more, you\'ll be charged the difference.',
      },
    ],
  },
  {
    name: 'Products & Stock',
    icon: <ShoppingBag className="h-4 w-4" />,
    items: [
      {
        id: 'ps-1',
        question: 'How do I know if an item is in stock?',
        answer:
          'Product pages display real-time stock availability. Items in stock show "Add to Cart," while out-of-stock items show a "Notify Me" option. You can sign up for restock alerts for any product.',
      },
      {
        id: 'ps-2',
        question: 'Are your products authentic?',
        answer:
          "100%. We are authorized retailers for all brands we carry. Every product comes with original packaging, tags, and manufacturer warranty. If you ever receive a product you believe is not authentic, we'll provide a full refund.",
      },
      {
        id: 'ps-3',
        question: 'Do products come with a warranty?',
        answer:
          "Most products come with the manufacturer's standard warranty. Extended warranty options are available at checkout for select electronics and appliances. Warranty details are listed on each product page.",
      },
      {
        id: 'ps-4',
        question: 'How do I find the right size?',
        answer:
          "Each product page includes a detailed size guide with measurements. We recommend measuring yourself and comparing with our size chart. If you're between sizes, we generally suggest sizing up for a more comfortable fit.",
      },
    ],
  },
  {
    name: 'Account & Security',
    icon: <Shield className="h-4 w-4" />,
    items: [
      {
        id: 'as-1',
        question: 'How do I create an account?',
        answer:
          'Click "Sign Up" in the top right corner and enter your email and password. You can also sign up using your Google, Facebook, or Apple account for a faster experience. Creating an account lets you track orders, save favorites, and check out faster.',
      },
      {
        id: 'as-2',
        question: 'I forgot my password. How do I reset it?',
        answer:
          'Click "Sign In," then "Forgot Password." Enter your email address and we\'ll send you a password reset link. The link expires after 24 hours for security. If you don\'t receive the email, check your spam folder.',
      },
      {
        id: 'as-3',
        question: 'How do I update my account information?',
        answer:
          'Log in and navigate to "Profile" in the account menu. From there you can update your name, email, phone number, and addresses. Changes to your email will require verification.',
      },
      {
        id: 'as-4',
        question: 'Is my personal data safe?',
        answer:
          'We take data security seriously. Your personal information is encrypted and stored securely. We never sell your data to third parties. You can review our Privacy Policy for full details on how we handle your information.',
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background">
      <Container className="py-12 lg:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="bg-accent-primary/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-accent-primary">
            <HelpCircle className="h-8 w-8" />
          </div>
          <h1 className="mb-3 text-4xl font-bold text-slate-100 lg:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto max-w-xl text-lg text-slate-400">
            Find answers to common questions about orders, payments, returns, and more.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FaqAccordion categories={faqCategories} />
        </motion.div>

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="neo-card mt-12 rounded-2xl p-8 text-center lg:p-12"
        >
          <h2 className="mb-2 text-2xl font-semibold text-slate-100">Still have questions?</h2>
          <p className="mb-6 text-slate-400">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/contact">
              <Button size="lg">Contact Support</Button>
            </Link>
            <Link href="/support">
              <Button variant="outline" size="lg">
                Visit Support Center
              </Button>
            </Link>
          </div>
        </motion.div>
      </Container>
    </div>
  )
}
