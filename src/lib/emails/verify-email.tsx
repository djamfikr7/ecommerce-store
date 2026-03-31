// Email verification template
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

interface VerifyEmailProps {
  userName: string
  verificationUrl: string
  verificationCode: string
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voltstore.com'

export function VerifyEmail({ userName, verificationUrl, verificationCode }: VerifyEmailProps) {
  const firstName = userName?.split(' ')[0] || 'there'

  return (
    <Html>
      <Head />
      <Preview>Verify your email address for VoltStore</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Heading style={styles.logo}>VoltStore</Heading>
            <Text style={styles.headerSubtitle}>Email Verification</Text>
          </Section>

          {/* Main Content */}
          <Section style={styles.mainContent}>
            <Heading style={styles.heading}>Hi {firstName}!</Heading>
            <Text style={styles.text}>
              Thanks for signing up for VoltStore. To complete your registration and start shopping,
              please verify your email address.
            </Text>

            {/* Verification Code */}
            <Section style={styles.codeSection}>
              <Text style={styles.codeLabel}>Your Verification Code</Text>
              <Text style={styles.codeValue}>{verificationCode}</Text>
              <Text style={styles.codeHint}>
                Enter this code on the verification page, or click the button below.
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Button href={verificationUrl} style={styles.button}>
                Verify Email Address
              </Button>
            </Section>

            {/* Alternative Link */}
            <Text style={styles.alternativeText}>
              Or copy and paste this URL into your browser:
            </Text>
            <Link href={verificationUrl} style={styles.link}>
              {verificationUrl}
            </Link>

            {/* Security Notice */}
            <Section style={styles.securitySection}>
              <Text style={styles.securityTitle}>Security Notice</Text>
              <Text style={styles.securityText}>
                This verification link will expire in 24 hours. If you did not create an account
                with VoltStore, please ignore this email or contact our support team.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Hr style={styles.footerDivider} />
            <Text style={styles.footerText}>
              Questions? We are here to help.{' '}
              <Link href="mailto:support@voltstore.com">Contact Support</Link>
            </Text>
            <Text style={styles.copyright}>
              &copy; {new Date().getFullYear()} VoltStore. All rights reserved.
            </Text>
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
  codeSection: {
    background:
      'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center' as const,
    marginBottom: '24px',
    border: '1px solid rgba(102, 126, 234, 0.3)',
  },
  codeLabel: {
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
    color: '#667eea',
    marginBottom: '12px',
  },
  codeValue: {
    fontSize: '36px',
    fontWeight: 700,
    color: '#ffffff',
    letterSpacing: '8px',
    marginBottom: '12px',
    fontFamily: 'monospace',
  },
  codeHint: {
    fontSize: '13px',
    color: '#888',
    margin: 0,
  },
  ctaSection: {
    textAlign: 'center' as const,
    marginBottom: '24px',
  },
  button: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 600,
    padding: '16px 40px',
    textDecoration: 'none',
    display: 'inline-block',
  },
  alternativeText: {
    fontSize: '13px',
    color: '#888',
    textAlign: 'center' as const,
    marginBottom: '8px',
  },
  link: {
    fontSize: '13px',
    color: '#667eea',
    textAlign: 'center' as const,
    wordBreak: 'break-all' as const,
    display: 'block',
    marginBottom: '24px',
  },
  securitySection: {
    background: 'rgba(255, 193, 7, 0.1)',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid rgba(255, 193, 7, 0.3)',
  },
  securityTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#ffc107',
    marginBottom: '8px',
  },
  securityText: {
    fontSize: '13px',
    color: '#cccccc',
    lineHeight: 1.5,
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
  copyright: {
    fontSize: '12px',
    color: '#444',
  },
}

export default VerifyEmail
