// Order shipped email template
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface OrderShippedEmailProps {
  orderNumber: string
  customerName: string
  customerEmail: string
  trackingNumber: string
  carrier: string
  trackingUrl: string
  estimatedDelivery: Date
  items: Array<{
    id: string
    name: string
    image: string | null
    quantity: number
    price: number
  }>
  shippingAddress: {
    name: string
    line1: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voltstore.com'

export function OrderShippedEmail({
  orderNumber,
  customerName,
  customerEmail,
  trackingNumber,
  carrier,
  trackingUrl,
  estimatedDelivery,
  items,
  shippingAddress,
}: OrderShippedEmailProps) {
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
      <Preview>Your order #{orderNumber} has shipped!</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Heading style={styles.logo}>VoltStore</Heading>
            <Text style={styles.headerSubtitle}>Your Order is On Its Way!</Text>
          </Section>

          {/* Main Content */}
          <Section style={styles.mainContent}>
            <Heading style={styles.heading}>Great news, {customerName}!</Heading>
            <Text style={styles.text}>
              Your order #{orderNumber} has been shipped and is on its way to you. We will send
              another notification when it has been delivered.
            </Text>

            {/* Tracking Info */}
            <Section style={styles.trackingSection}>
              <Heading style={styles.sectionTitle}>Tracking Information</Heading>

              <Section style={styles.trackingBox}>
                <Text style={styles.trackingLabel}>Carrier</Text>
                <Text style={styles.trackingValue}>{carrier}</Text>

                <Text style={styles.trackingLabel}>Tracking Number</Text>
                <Link href={trackingUrl} style={styles.trackingNumber}>
                  {trackingNumber}
                </Link>

                <Text style={styles.trackingLabel}>Estimated Delivery</Text>
                <Text style={styles.trackingValue}>{formatDate(estimatedDelivery)}</Text>
              </Section>

              <Button href={trackingUrl} style={styles.trackButton}>
                Track Your Package
              </Button>
            </Section>

            <Hr style={styles.divider} />

            {/* Items */}
            <Heading style={styles.sectionTitle}>Items in Your Shipment</Heading>
            {items.map((item) => (
              <Section key={item.id} style={styles.item}>
                {item.image && (
                  <Img
                    src={item.image}
                    alt={item.name}
                    width={60}
                    height={60}
                    style={styles.itemImage}
                  />
                )}
                <Section style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                </Section>
              </Section>
            ))}

            <Hr style={styles.divider} />

            {/* Shipping Address */}
            <Text style={styles.addressLabel}>Shipped to:</Text>
            <Text style={styles.address}>
              {shippingAddress.name}<br />
              {shippingAddress.line1}<br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
              {shippingAddress.country}
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
              Questions about your delivery?{' '}
              <Link href="mailto:support@voltstore.com">Contact Support</Link>
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
  trackingSection: {
    marginTop: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '16px',
  },
  trackingBox: {
    background: 'rgba(102, 126, 234, 0.1)',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  trackingLabel: {
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    color: '#667eea',
    marginBottom: '4px',
    marginTop: '12px',
  },
  trackingValue: {
    fontSize: '16px',
    color: '#ffffff',
    margin: 0,
  },
  trackingNumber: {
    fontSize: '16px',
    color: '#667eea',
    fontWeight: 600,
    margin: 0,
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
  },
  divider: {
    borderColor: 'rgba(255,255,255,0.1)',
    margin: '24px 0',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  itemImage: {
    borderRadius: '8px',
    objectFit: 'cover' as const,
  },
  itemDetails: {
    paddingLeft: '16px',
  },
  itemName: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#ffffff',
    margin: '0 0 4px 0',
  },
  itemQty: {
    fontSize: '13px',
    color: '#888',
    margin: 0,
  },
  addressLabel: {
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    color: '#667eea',
    marginBottom: '8px',
  },
  address: {
    fontSize: '14px',
    lineHeight: 1.8,
    color: '#cccccc',
  },
  ctaSection: {
    textAlign: 'center' as const,
    marginTop: '32px',
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

export default OrderShippedEmail
