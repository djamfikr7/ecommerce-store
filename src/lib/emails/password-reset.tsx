// Password reset email template
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

interface PasswordResetEmailProps {
  userName: string
  userEmail: string
  resetUrl: string
  expiresAt: Date
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voltstore.com'

export function PasswordResetEmail({
  userName,
  userEmail,
  resetUrl,
  expiresAt,
}: PasswordResetEmailProps) {
  const firstName = userName.split(' ')[0]

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

  const expiresAtFormatted = `${formatDate(expiresAt)} at ${formatTime(expiresAt)}`

  return (
    <Html>
      <Head />
      <Preview>Reset your VoltStore password</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Heading style={styles.logo}>VoltStore</Heading>
            <Text style={styles.headerSubtitle}>Password Reset Request</Text>
          </Section>

          {/* Main Content */}
          <Section style={styles.mainContent}>
            <Heading style={styles.heading}>Hi, {firstName},</Heading>
            <Text style={styles.text}>
              We received a request to reset the password for your VoltStore account
              associated with this email address.
            </Text>

            <Section style={styles.warningSection}>
              <Text style={styles.warningIcon}>&#9888;</Text>
              <Text style={styles.warningText}>
                If you did not request this password reset, please ignore this email.
                Your password will not be changed until you create a new one.
              </Text>
            </Section>

            {/* Reset Button */}
            <Section style={styles.ctaSection}>
              <Text style={styles.ctaLabel}>Click the button below to reset your password:</Text>
              <Button href={resetUrl} style={styles.button}>
                Reset Password
              </Button>
              <Text style={styles.orText}>or copy and paste this link into your browser:</Text>
              <Link href={resetUrl} style={styles.link}>
                {resetUrl}
              </Link>
            </Section>

            {/* Expiration Warning */}
            <Section style={styles.expirationSection}>
              <Text style={styles.expirationLabel}>&#128337;</Text>
              <Text style={styles.expirationText}>
                This link expires in <strong>1 hour</strong>
                <br />
                Expires: {expiresAtFormatted}
              </Text>
            </Section>

            <Hr style={styles.divider} />

            {/* Support */}
            <Section style={styles.supportSection}>
              <Text style={styles.supportText}>
                Did not request this? You can safely ignore this email.
              </Text>
              <Text style={styles.supportText}>
                Need help?{' '}
                <Link href="mailto:support@voltstore.com">Contact Support</Link>
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
    color: '#f59e0b',
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
  warningSection: {
    display: 'flex',
    alignItems: 'flex-start',
    background: 'rgba(245, 158, 11, 0.1)',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '24px',
  },
  warningIcon: {
    fontSize: '20px',
    marginRight: '12px',
    lineHeight: 1.4,
  },
  warningText: {
    fontSize: '14px',
    color: '#f59e0b',
    lineHeight: 1.5,
    flex: 1,
    margin: 0,
  },
  ctaSection: {
    textAlign: 'center' as const,
    marginTop: '32px',
  },
  ctaLabel: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '16px',
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
  orText: {
    fontSize: '13px',
    color: '#666',
    marginTop: '16px',
    marginBottom: '8px',
  },
  link: {
    fontSize: '12px',
    color: '#667eea',
    wordBreak: 'break-all' as const,
  },
  expirationSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(102, 126, 234, 0.1)',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '24px',
  },
  expirationLabel: {
    fontSize: '24px',
    marginRight: '12px',
  },
  expirationText: {
    fontSize: '14px',
    color: '#cccccc',
    textAlign: 'left' as const,
    margin: 0,
  },
  divider: {
    borderColor: 'rgba(255,255,255,0.1)',
    margin: '24px 0',
  },
  supportSection: {
    textAlign: 'center' as const,
  },
  supportText: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '8px',
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

export default PasswordResetEmail
