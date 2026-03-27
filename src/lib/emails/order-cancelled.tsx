// Order cancelled email template
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface OrderCancelledEmailProps {
  orderNumber: string
  customerName: string
  customerEmail: string
  cancelledAt: Date
  reason: string
  refundAmount?: number
  refundDate?: Date
  currency: string
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voltstore.com'

export function OrderCancelledEmail({
  orderNumber,
  customerName,
  customerEmail,
  cancelledAt,
  reason,
  refundAmount,
  refundDate,
  currency,
}: OrderCancelledEmailProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  return (
    <Html>
      <Head />
      <Preview>Your order #{orderNumber} has been cancelled</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Heading style={styles.logo}>VoltStore</Heading>
            <Text style={styles.headerSubtitle}>Order Cancelled</Text>
          </Section>

          {/* Main Content */}
          <Section style={styles.mainContent}>
            <Section style={styles.cancelledBanner}>
              <Text style={styles.cancelledIcon}>&#10005;</Text>
              <Heading style={styles.cancelledTitle}>Order Cancelled</Heading>
            </Section>

            <Heading style={styles.heading}>Hello, {customerName},</Heading>
            <Text style={styles.text}>
              Your order #{orderNumber} has been cancelled. We are sorry this did not work out.
            </Text>

            {/* Cancellation Details */}
            <Section style={styles.detailsSection}>
              <Heading style={styles.sectionTitle}>Cancellation Details</Heading>

              <Section style={styles.detailRow}>
                <Text style={styles.detailLabel}>Order Number</Text>
                <Text style={styles.detailValue}>#{orderNumber}</Text>
              </Section>

              <Section style={styles.detailRow}>
                <Text style={styles.detailLabel}>Cancelled On</Text>
                <Text style={styles.detailValue}>{formatDate(cancelledAt)}</Text>
              </Section>

              <Section style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reason</Text>
                <Text style={styles.detailValue}>{reason}</Text>
              </Section>
            </Section>

            {/* Refund Info */}
            {refundAmount && (
              <Section style={styles.refundSection}>
                <Heading style={styles.refundTitle}>Refund Information</Heading>
                <Text style={styles.refundText}>
                  A refund of <strong style={styles.refundAmount}>{formatCurrency(refundAmount)}</strong> will be
                  processed to your original payment method.
                </Text>
                {refundDate && (
                  <Text style={styles.refundDate}>
                    Expected refund date: {formatDate(refundDate)}
                  </Text>
                )}
                <Text style={styles.refundNote}>
                  Please note: Depending on your payment provider, it may take 5-10 business days
                  for the refund to appear in your account.
                </Text>
              </Section>
            )}

            <Hr style={styles.divider} />

            {/* CTA */}
            <Section style={styles.ctaSection}>
              <Text style={styles.ctaText}>
                Ready to try again? Browse our latest products and find something you love.
              </Text>
              <Button href={baseUrl} style={styles.button}>
                Continue Shopping
              </Button>
            </Section>

            {/* Support */}
            <Section style={styles.supportSection}>
              <Text style={styles.supportText}>
                Have questions about your cancellation or refund?{' '}
                <Link href="mailto:support@voltstore.com">Contact our support team</Link>
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Hr style={styles.footerDivider} />
            <Text style={styles.copyright}>&copy; {new Date().getFullYear()} VoltStore. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: '#0f0f0f',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: 0,
    padding: 0,
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '32px',
  },
  logo: {
    fontSize: '32px',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#ef4444',
    marginTop: '8px',
  },
  mainContent: {
    background: 'linear-gradient(145deg, #1a1a1a, #141414)',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  cancelledBanner: {
    textAlign: 'center' as const,
    marginBottom: '24px',
  },
  cancelledIcon: {
    fontSize: '48px',
    color: '#ef4444',
    margin: 0,
    lineHeight: 1,
  },
  cancelledTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#ef4444',
    margin: '8px 0 0 0',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '16px',
  },
  text: {
    fontSize: '15px',
    lineHeight: 1.6,
    color: '#cccccc',
  },
  detailsSection: {
    marginTop: '24px',
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '8px',
    padding: '20px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '16px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  detailLabel: {
    fontSize: '14px',
    color: '#888',
  },
  detailValue: {
    fontSize: '14px',
    color: '#ffffff',
    fontWeight: 500,
  },
  refundSection: {
    marginTop: '24px',
    background: 'rgba(102, 126, 234, 0.1)',
    borderRadius: '8px',
    padding: '20px',
  },
  refundTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#667eea',
    marginBottom: '12px',
  },
  refundText: {
    fontSize: '15px',
    color: '#cccccc',
    marginBottom: '8px',
  },
  refundAmount: {
    color: '#667eea',
    fontWeight: 600,
  },
  refundDate: {
    fontSize: '14px',
    color: '#22c55e',
    marginBottom: '8px',
  },
  refundNote: {
    fontSize: '13px',
    color: '#888',
    fontStyle: 'italic',
  },
  divider: {
    borderColor: 'rgba(255,255,255,0.1)',
    margin: '24px 0',
  },
  ctaSection: {
    textAlign: 'center' as const,
  },
  ctaText: {
    fontSize: '15px',
    color: '#cccccc',
    marginBottom: '16px',
  },
  button: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 600,
    padding: '14px 32px',
    textDecoration: 'none',
  },
  supportSection: {
    marginTop: '24px',
    textAlign: 'center' as const,
  },
  supportText: {
    fontSize: '14px',
    color: '#888',
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center' as const,
  },
  footerDivider: {
    borderColor: 'rgba(255,255,255,0.1)',
    margin: '16px 0',
  },
  copyright: {
    fontSize: '12px',
    color: '#444',
  },
}

export default OrderCancelledEmail
