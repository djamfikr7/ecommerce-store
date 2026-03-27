// Order delivered email template
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

interface OrderDeliveredEmailProps {
  orderNumber: string
  customerName: string
  customerEmail: string
  deliveredAt: Date
  items: Array<{
    id: string
    name: string
    image: string | null
    quantity: number
    productId: string
  }>
  referralCode?: string
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voltstore.com'

export function OrderDeliveredEmail({
  orderNumber,
  customerName,
  customerEmail,
  deliveredAt,
  items,
  referralCode,
}: OrderDeliveredEmailProps) {
  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })

  return (
    <Html>
      <Head />
      <Preview>Your order #{orderNumber} has been delivered!</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Heading style={styles.logo}>VoltStore</Heading>
            <Text style={styles.headerSubtitle}>Package Delivered!</Text>
          </Section>

          {/* Main Content */}
          <Section style={styles.mainContent}>
            <Section style={styles.successBanner}>
              <Text style={styles.successIcon}>&#10003;</Text>
              <Heading style={styles.successTitle}>Your order has arrived!</Heading>
            </Section>

            <Heading style={styles.heading}>Hello, {customerName}!</Heading>
            <Text style={styles.text}>
              Great news! Your order #{orderNumber} was delivered on {formatDate(deliveredAt)}.
              We hope you love your new items!
            </Text>

            {/* Delivered Items */}
            <Heading style={styles.sectionTitle}>What Was Delivered</Heading>
            {items.map((item) => (
              <Section key={item.id} style={styles.item}>
                <Section style={styles.itemLeft}>
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
                <Button
                  href={`${baseUrl}/products/${item.productId}/review`}
                  style={styles.reviewButton}
                >
                  Leave a Review
                </Button>
              </Section>
            ))}

            <Hr style={styles.divider} />

            {/* Referral Program */}
            {referralCode && (
              <Section style={styles.referralSection}>
                <Heading style={styles.sectionTitle}>Share the Love</Heading>
                <Text style={styles.referralText}>
                  Give your friends $10 off their first order and get $10 credit when they make a purchase!
                </Text>
                <Section style={styles.referralCode}>
                  <Text style={styles.referralCodeLabel}>Your Referral Code</Text>
                  <Text style={styles.referralCodeValue}>{referralCode}</Text>
                </Section>
                <Button href={`${baseUrl}/refer?code=${referralCode}`} style={styles.shareButton}>
                  Share with Friends
                </Button>
              </Section>
            )}

            {/* CTAs */}
            <Section style={styles.ctaSection}>
              <Button href={`${baseUrl}/orders/${orderNumber}`} style={styles.button}>
                View Order Details
              </Button>
              <Button href={baseUrl} style={styles.secondaryButton}>
                Continue Shopping
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Need help? <Link href="mailto:support@voltstore.com">Contact Support</Link>
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
    color: '#22c55e',
    marginTop: '8px',
  },
  mainContent: {
    background: 'linear-gradient(145deg, #1a1a1a, #141414)',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  successBanner: {
    textAlign: 'center' as const,
    marginBottom: '24px',
  },
  successIcon: {
    fontSize: '48px',
    color: '#22c55e',
    margin: 0,
    lineHeight: 1,
  },
  successTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#22c55e',
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
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '16px',
    marginTop: '8px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
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
  reviewButton: {
    background: 'transparent',
    border: '1px solid #667eea',
    borderRadius: '6px',
    color: '#667eea',
    fontSize: '13px',
    fontWeight: 600,
    padding: '8px 16px',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  divider: {
    borderColor: 'rgba(255,255,255,0.1)',
    margin: '24px 0',
  },
  referralSection: {
    background: 'rgba(102, 126, 234, 0.1)',
    borderRadius: '12px',
    padding: '24px',
    marginTop: '16px',
  },
  referralText: {
    fontSize: '14px',
    color: '#cccccc',
    marginBottom: '16px',
  },
  referralCode: {
    textAlign: 'center' as const,
    marginBottom: '16px',
  },
  referralCodeLabel: {
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    color: '#888',
    marginBottom: '4px',
  },
  referralCodeValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#667eea',
    letterSpacing: '2px',
    margin: 0,
  },
  shareButton: {
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
  ctaSection: {
    textAlign: 'center' as const,
    marginTop: '32px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
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
  secondaryButton: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: '#cccccc',
    fontSize: '14px',
    fontWeight: 600,
    padding: '12px 24px',
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

export default OrderDeliveredEmail
