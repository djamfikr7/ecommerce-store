// Generic order status update email template
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

interface OrderStatusUpdateEmailProps {
  orderNumber: string
  customerName: string
  customerEmail: string
  oldStatus: string
  newStatus: string
  updatedAt: Date
  trackingNumber?: string
  carrier?: string
  trackingUrl?: string
  estimatedDelivery?: Date
  additionalDetails?: string
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voltstore.com'

const STATUS_DISPLAY_NAMES: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
}

export function OrderStatusUpdateEmail({
  orderNumber,
  customerName,
  customerEmail,
  oldStatus,
  newStatus,
  updatedAt,
  trackingNumber,
  carrier,
  trackingUrl,
  estimatedDelivery,
  additionalDetails,
}: OrderStatusUpdateEmailProps) {
  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  const oldStatusDisplay = STATUS_DISPLAY_NAMES[oldStatus] || oldStatus
  const newStatusDisplay = STATUS_DISPLAY_NAMES[newStatus] || newStatus

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#22c55e'
      case 'cancelled':
      case 'returned':
        return '#ef4444'
      case 'shipped':
      case 'in_transit':
      case 'out_for_delivery':
        return '#667eea'
      default:
        return '#f59e0b'
    }
  }

  return (
    <Html>
      <Head />
      <Preview>Order #{orderNumber} status update: {newStatusDisplay}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Heading style={styles.logo}>VoltStore</Heading>
            <Text style={styles.headerSubtitle}>Order Status Update</Text>
          </Section>

          {/* Main Content */}
          <Section style={styles.mainContent}>
            <Heading style={styles.heading}>Hello, {customerName},</Heading>
            <Text style={styles.text}>
              The status of your order #{orderNumber} has been updated.
            </Text>

            {/* Status Change */}
            <Section style={styles.statusSection}>
              <Heading style={styles.sectionTitle}>Status Change</Heading>
              <Section style={styles.statusChange}>
                <Section style={styles.statusBox}>
                  <Text style={styles.statusLabel}>Previous</Text>
                  <Text style={[styles.statusValue, { color: '#888' }]}>
                    {oldStatusDisplay}
                  </Text>
                </Section>
                <Text style={styles.arrow}>&#8594;</Text>
                <Section style={styles.statusBox}>
                  <Text style={styles.statusLabel}>Current</Text>
                  <Text style={[styles.statusValue, { color: getStatusColor(newStatus) }]}>
                    {newStatusDisplay}
                  </Text>
                </Section>
              </Section>
            </Section>

            {/* Tracking Info for shipped/in_transit */}
            {(newStatus === 'shipped' || newStatus === 'in_transit') && trackingNumber && (
              <Section style={styles.trackingSection}>
                <Heading style={styles.sectionTitle}>Shipping Information</Heading>

                {carrier && (
                  <Section style={styles.trackingRow}>
                    <Text style={styles.trackingLabel}>Carrier</Text>
                    <Text style={styles.trackingValue}>{carrier}</Text>
                  </Section>
                )}

                {trackingNumber && (
                  <Section style={styles.trackingRow}>
                    <Text style={styles.trackingLabel}>Tracking Number</Text>
                    <Link href={trackingUrl || '#'} style={styles.trackingLink}>
                      {trackingNumber}
                    </Link>
                  </Section>
                )}

                {estimatedDelivery && (
                  <Section style={styles.trackingRow}>
                    <Text style={styles.trackingLabel}>Estimated Delivery</Text>
                    <Text style={styles.trackingValue}>{formatDate(estimatedDelivery)}</Text>
                  </Section>
                )}

                {trackingUrl && (
                  <Button href={trackingUrl} style={styles.trackButton}>
                    Track Your Package
                  </Button>
                )}
              </Section>
            )}

            {/* Additional Details */}
            {additionalDetails && (
              <Section style={styles.additionalSection}>
                <Text style={styles.additionalText}>{additionalDetails}</Text>
              </Section>
            )}

            <Hr style={styles.divider} />

            {/* Footer Info */}
            <Text style={styles.footerInfo}>
              Last updated: {formatDate(updatedAt)}
            </Text>

            {/* CTA */}
            <Section style={styles.ctaSection}>
              <Button href={`${baseUrl}/orders/${orderNumber}`} style={styles.button}>
                View Order Details
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Questions? <Link href="mailto:support@voltstore.com">Contact Support</Link>
            </Text>
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
    color: '#667eea',
    marginTop: '8px',
  },
  mainContent: {
    background: 'linear-gradient(145deg, #1a1a1a, #141414)',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid rgba(255,255,255,0.1)',
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
  statusSection: {
    marginTop: '24px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '16px',
  },
  statusChange: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    padding: '20px',
  },
  statusBox: {
    textAlign: 'center' as const,
    flex: 1,
  },
  statusLabel: {
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    color: '#888',
    marginBottom: '8px',
  },
  statusValue: {
    fontSize: '20px',
    fontWeight: 700,
    margin: 0,
  },
  arrow: {
    fontSize: '24px',
    color: '#667eea',
  },
  trackingSection: {
    marginTop: '24px',
    background: 'rgba(102, 126, 234, 0.1)',
    borderRadius: '8px',
    padding: '20px',
  },
  trackingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  trackingLabel: {
    fontSize: '14px',
    color: '#888',
  },
  trackingValue: {
    fontSize: '14px',
    color: '#ffffff',
    fontWeight: 500,
  },
  trackingLink: {
    fontSize: '14px',
    color: '#667eea',
    fontWeight: 500,
  },
  trackButton: {
    display: 'block',
    width: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    padding: '12px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    marginTop: '16px',
  },
  additionalSection: {
    marginTop: '24px',
    padding: '16px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
  },
  additionalText: {
    fontSize: '14px',
    color: '#cccccc',
    margin: 0,
  },
  divider: {
    borderColor: 'rgba(255,255,255,0.1)',
    margin: '24px 0',
  },
  footerInfo: {
    fontSize: '13px',
    color: '#666',
    textAlign: 'center' as const,
  },
  ctaSection: {
    textAlign: 'center' as const,
    marginTop: '24px',
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
  footer: {
    marginTop: '32px',
    textAlign: 'center' as const,
  },
  footerText: {
    fontSize: '13px',
    color: '#888',
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

export default OrderStatusUpdateEmail
