// Order confirmation email template
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
  Row,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface OrderConfirmationEmailProps {
  orderNumber: string
  customerName: string
  customerEmail: string
  orderDate: Date
  items: Array<{
    id: string
    name: string
    image: string | null
    quantity: number
    price: number
  }>
  subtotal: number
  taxAmount: number
  shippingAmount: number
  total: number
  currency: string
  shippingAddress: {
    name: string
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  paymentMethod: string
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voltstore.com'

export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  customerEmail,
  orderDate,
  items,
  subtotal,
  taxAmount,
  shippingAmount,
  total,
  currency,
  shippingAddress,
  paymentMethod,
}: OrderConfirmationEmailProps) {
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
      <Preview>Your order #{orderNumber} has been confirmed</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Heading style={styles.logo}>VoltStore</Heading>
            <Text style={styles.headerSubtitle}>Order Confirmation</Text>
          </Section>

          {/* Main Content */}
          <Section style={styles.mainContent}>
            <Heading style={styles.heading}>Thank you for your order, {customerName}!</Heading>
            <Text style={styles.text}>
              We have received your order and are preparing it for shipment. You will receive a
              shipping confirmation email once your items are on their way.
            </Text>

            {/* Order Details */}
            <Section style={styles.orderDetails}>
              <Row>
                <Text style={styles.detailLabel}>Order Number:</Text>
                <Text style={styles.detailValue}>#{orderNumber}</Text>
              </Row>
              <Row>
                <Text style={styles.detailLabel}>Order Date:</Text>
                <Text style={styles.detailValue}>{formatDate(orderDate)}</Text>
              </Row>
              <Row>
                <Text style={styles.detailLabel}>Payment Method:</Text>
                <Text style={styles.detailValue}>{paymentMethod}</Text>
              </Row>
            </Section>

            <Hr style={styles.divider} />

            {/* Items */}
            <Heading style={styles.sectionTitle}>Items Ordered</Heading>
            {items.map((item) => (
              <Section key={item.id} style={styles.item}>
                <Row>
                  {item.image && (
                    <Img
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      style={styles.itemImage}
                    />
                  )}
                  <Section style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                    <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
                  </Section>
                </Row>
              </Section>
            ))}

            <Hr style={styles.divider} />

            {/* Totals */}
            <Section style={styles.totals}>
              <Row style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
              </Row>
              <Row style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax</Text>
                <Text style={styles.totalValue}>{formatCurrency(taxAmount)}</Text>
              </Row>
              <Row style={styles.totalRow}>
                <Text style={styles.totalLabel}>Shipping</Text>
                <Text style={styles.totalValue}>{formatCurrency(shippingAmount)}</Text>
              </Row>
              <Hr style={styles.totalDivider} />
              <Row style={styles.totalRow}>
                <Text style={styles.grandTotalLabel}>Total</Text>
                <Text style={styles.grandTotalValue}>{formatCurrency(total)}</Text>
              </Row>
            </Section>

            <Hr style={styles.divider} />

            {/* Shipping Address */}
            <Heading style={styles.sectionTitle}>Shipping Address</Heading>
            <Text style={styles.address}>
              {shippingAddress.name}<br />
              {shippingAddress.line1}<br />
              {shippingAddress.line2 && <>{shippingAddress.line2}<br /></>}
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
              Questions? Contact our support team at <Link href="mailto:support@voltstore.com">support@voltstore.com</Link>
            </Text>
            <Hr style={styles.footerDivider} />
            <Row style={styles.socialRow}>
              <Link href={`${baseUrl}/facebook`} style={styles.socialLink}>Facebook</Link>
              <Link href={`${baseUrl}/twitter`} style={styles.socialLink}>Twitter</Link>
              <Link href={`${baseUrl}/instagram`} style={styles.socialLink}>Instagram</Link>
            </Row>
            <Text style={styles.unsubscribe}>
              <Link href={`${baseUrl}/unsubscribe?email=${encodeURIComponent(customerEmail)}`}>
                Unsubscribe
              </Link>
            </Text>
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
    color: '#888',
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
  orderDetails: {
    background: 'rgba(102, 126, 234, 0.1)',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '24px',
  },
  detailLabel: {
    fontSize: '14px',
    color: '#888',
    display: 'inline-block',
    width: '120px',
  },
  detailValue: {
    fontSize: '14px',
    color: '#ffffff',
    fontWeight: 500,
    display: 'inline-block',
  },
  divider: {
    borderColor: 'rgba(255,255,255,0.1)',
    margin: '24px 0',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '16px',
    marginTop: '8px',
  },
  item: {
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  itemImage: {
    borderRadius: '8px',
    objectFit: 'cover' as const,
  },
  itemDetails: {
    paddingLeft: '16px',
    verticalAlign: 'middle' as const,
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
    margin: '0 0 4px 0',
  },
  itemPrice: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#667eea',
    margin: 0,
  },
  totals: {
    textAlign: 'right' as const,
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
  },
  totalLabel: {
    fontSize: '14px',
    color: '#888',
  },
  totalValue: {
    fontSize: '14px',
    color: '#ffffff',
  },
  totalDivider: {
    borderColor: '#667eea',
    margin: '8px 0',
  },
  grandTotalLabel: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#ffffff',
  },
  grandTotalValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#667eea',
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
  socialRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginBottom: '16px',
  },
  socialLink: {
    fontSize: '13px',
    color: '#667eea',
    textDecoration: 'none',
  },
  unsubscribe: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '8px',
  },
  copyright: {
    fontSize: '12px',
    color: '#444',
  },
}

export default OrderConfirmationEmail
