// Welcome email for new users
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

interface WelcomeEmailProps {
  userName: string
  userEmail: string
  referralCode?: string
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voltstore.com'

const FEATURES = [
  {
    icon: '&#128722;',
    title: 'Shop Premium Products',
    description: 'Discover thousands of curated items across all categories.',
  },
  {
    icon: '&#127758;',
    title: 'Global Shipping',
    description: 'Fast, reliable delivery to over 100 countries worldwide.',
  },
  {
    icon: '&#128179;',
    title: 'Multi-Currency Support',
    description: 'Shop in your preferred currency with transparent pricing.',
  },
]

export function WelcomeEmail({
  userName,
  userEmail,
  referralCode,
}: WelcomeEmailProps) {
  const firstName = userName.split(' ')[0]

  return (
    <Html>
      <Head />
      <Preview>Welcome to VoltStore, {firstName}!</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Heading style={styles.logo}>VoltStore</Heading>
            <Text style={styles.headerSubtitle}>Welcome to the family!</Text>
          </Section>

          {/* Main Content */}
          <Section style={styles.mainContent}>
            <Heading style={styles.heading}>Welcome, {firstName}!</Heading>
            <Text style={styles.text}>
              Thank you for joining VoltStore. We are thrilled to have you on board and
              can not wait to show you what makes shopping with us special.
            </Text>

            {/* Features */}
            <Section style={styles.featuresSection}>
              <Heading style={styles.sectionTitle}>What awaits you</Heading>
              {FEATURES.map((feature, index) => (
                <Section key={index} style={styles.feature}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Section style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </Section>
                </Section>
              ))}
            </Section>

            {/* First Order Discount */}
            <Section style={styles.promoSection}>
              <Text style={styles.promoLabel}>Welcome Gift</Text>
              <Heading style={styles.promoTitle}>Get 15% off your first order!</Heading>
              <Text style={styles.promoCode}>WELCOME15</Text>
              <Text style={styles.promoText}>
                Use code WELCOME15 at checkout. Valid for 7 days on your first purchase.
              </Text>
            </Section>

            {/* CTA */}
            <Section style={styles.ctaSection}>
              <Button href={`${baseUrl}/products`} style={styles.button}>
                Start Shopping
              </Button>
            </Section>

            {/* Referral */}
            {referralCode && (
              <Section style={styles.referralSection}>
                <Heading style={styles.referralTitle}>Share the love</Heading>
                <Text style={styles.referralText}>
                  Invite friends to VoltStore and earn rewards together!
                </Text>
                <Section style={styles.referralCode}>
                  <Text style={styles.referralCodeLabel}>Your Referral Code</Text>
                  <Text style={styles.referralCodeValue}>{referralCode}</Text>
                </Section>
              </Section>
            )}
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Hr style={styles.footerDivider} />
            <Text style={styles.footerText}>
              Questions? We are here to help.{' '}
              <Link href="mailto:support@voltstore.com">Contact Support</Link>
            </Text>
            <Section style={styles.socialRow}>
              <Link href={`${baseUrl}/facebook`} style={styles.socialLink}>Facebook</Link>
              <Link href={`${baseUrl}/twitter`} style={styles.socialLink}>Twitter</Link>
              <Link href={`${baseUrl}/instagram`} style={styles.socialLink}>Instagram</Link>
            </Section>
            <Text style={styles.unsubscribe}>
              <Link href={`${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`}>
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
    fontSize: '28px',
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: '16px',
    textAlign: 'center' as const,
  },
  text: {
    fontSize: '15px',
    lineHeight: 1.6,
    color: '#cccccc',
    textAlign: 'center' as const,
    marginBottom: '32px',
  },
  featuresSection: {
    marginTop: '24px',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '20px',
    textAlign: 'center' as const,
  },
  feature: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '16px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  featureIcon: {
    fontSize: '28px',
    width: '48px',
    textAlign: 'center' as const,
  },
  featureContent: {
    flex: 1,
    paddingLeft: '16px',
  },
  featureTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '4px',
  },
  featureDescription: {
    fontSize: '14px',
    color: '#888',
    margin: 0,
  },
  promoSection: {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center' as const,
    marginTop: '24px',
    border: '1px solid rgba(102, 126, 234, 0.3)',
  },
  promoLabel: {
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
    color: '#667eea',
    marginBottom: '8px',
  },
  promoTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: '12px',
  },
  promoCode: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#667eea',
    letterSpacing: '3px',
    marginBottom: '12px',
  },
  promoText: {
    fontSize: '14px',
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
    padding: '16px 40px',
    textDecoration: 'none',
  },
  referralSection: {
    marginTop: '32px',
    textAlign: 'center' as const,
    padding: '20px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
  },
  referralTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '8px',
  },
  referralText: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '16px',
  },
  referralCode: {
    display: 'inline-block',
  },
  referralCodeLabel: {
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    color: '#666',
    marginBottom: '4px',
  },
  referralCodeValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#667eea',
    letterSpacing: '2px',
    margin: 0,
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center' as const,
  },
  footerText: {
    fontSize: '13px',
    color: '#888',
    marginBottom: '16px',
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

export default WelcomeEmail
