import {
  Body,
  Button,
  Column,
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

interface NewsletterArticle {
  id: string
  title: string
  description: string
  url: string
  image?: string
  category?: string
}

interface NewsletterEmailProps {
  recipientName: string
  recipientEmail: string
  newsletterTitle: string
  subtitle?: string
  heroImage?: string
  heroUrl?: string
  articles: NewsletterArticle[]
  promoCode?: string
  promoDiscount?: string
  promoExpiry?: string
  unsubscribeUrl?: string
  preferencesUrl?: string
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voltstore.com'

export function NewsletterEmail({
  recipientName,
  recipientEmail,
  newsletterTitle,
  subtitle,
  heroImage,
  heroUrl,
  articles,
  promoCode,
  promoDiscount,
  promoExpiry,
  unsubscribeUrl,
  preferencesUrl,
}: NewsletterEmailProps) {
  const firstName = recipientName?.split(' ')[0] || 'there'

  const fallbackUnsubscribe = `${baseUrl}/newsletter/unsubscribe?email=${encodeURIComponent(recipientEmail)}`
  const fallbackPreferences = `${baseUrl}/newsletter/preferences?email=${encodeURIComponent(recipientEmail)}`

  return (
    <Html>
      <Head />
      <Preview>{newsletterTitle} — VoltStore Newsletter</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Heading style={styles.logo}>VoltStore</Heading>
            <Text style={styles.headerSubtitle}>Newsletter</Text>
          </Section>

          <Section style={styles.mainContent}>
            <Heading style={styles.newsletterTitle}>{newsletterTitle}</Heading>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            <Text style={styles.greeting}>
              Hey {firstName}, here is what is new this week at VoltStore.
            </Text>

            {heroImage && (
              <Section style={styles.heroSection}>
                <a href={heroUrl || baseUrl} style={styles.heroLink}>
                  <Img src={heroImage} alt={newsletterTitle} width={560} style={styles.heroImage} />
                </a>
              </Section>
            )}

            {promoCode && promoDiscount && (
              <Section style={styles.promoSection}>
                <Text style={styles.promoLabel}>Exclusive Offer</Text>
                <Heading style={styles.promoTitle}>{promoDiscount}</Heading>
                <Text style={styles.promoCodeText}>{promoCode}</Text>
                {promoExpiry && <Text style={styles.promoExpiry}>Valid until {promoExpiry}</Text>}
                <Button href={`${baseUrl}/products`} style={styles.promoButton}>
                  Shop Now
                </Button>
              </Section>
            )}

            {articles.length > 0 && (
              <Section style={styles.articlesSection}>
                <Heading style={styles.sectionTitle}>Featured This Week</Heading>
                {articles.map((article, index) => (
                  <Section key={article.id} style={styles.article}>
                    {article.image && (
                      <a href={article.url} style={styles.articleImageLink}>
                        <Img
                          src={article.image}
                          alt={article.title}
                          width={160}
                          style={styles.articleImage}
                        />
                      </a>
                    )}
                    <Section
                      style={article.image ? styles.articleContentWithImage : styles.articleContent}
                    >
                      {article.category && (
                        <Text style={styles.articleCategory}>{article.category}</Text>
                      )}
                      <a href={article.url} style={styles.articleTitleLink}>
                        <Text style={styles.articleTitle}>{article.title}</Text>
                      </a>
                      <Text style={styles.articleDescription}>{article.description}</Text>
                      <Link href={article.url} style={styles.articleLink}>
                        Read More &rarr;
                      </Link>
                    </Section>
                    {index < articles.length - 1 && <Hr style={styles.articleDivider} />}
                  </Section>
                ))}
              </Section>
            )}

            <Hr style={styles.divider} />

            <Section style={styles.ctaSection}>
              <Button href={`${baseUrl}/products`} style={styles.button}>
                Explore All Products
              </Button>
            </Section>
          </Section>

          <Section style={styles.footer}>
            <Section style={styles.socialRow}>
              <Link href={`${baseUrl}/facebook`} style={styles.socialLink}>
                Facebook
              </Link>
              <Link href={`${baseUrl}/twitter`} style={styles.socialLink}>
                Twitter
              </Link>
              <Link href={`${baseUrl}/instagram`} style={styles.socialLink}>
                Instagram
              </Link>
            </Section>
            <Text style={styles.footerText}>
              You are receiving this because you subscribed to VoltStore newsletters.
            </Text>
            <Section style={styles.footerLinks}>
              <Link href={unsubscribeUrl || fallbackUnsubscribe} style={styles.footerLink}>
                Unsubscribe
              </Link>
              <Text style={styles.footerLinkSeparator}>|</Text>
              <Link href={preferencesUrl || fallbackPreferences} style={styles.footerLink}>
                Email Preferences
              </Link>
            </Section>
            <Hr style={styles.footerDivider} />
            <Text style={styles.copyright}>
              &copy; {new Date().getFullYear()} VoltStore. All rights reserved.
            </Text>
            <Text style={styles.address}>
              VoltStore Inc.
              <br />
              123 Commerce Street
              <br />
              San Francisco, CA 94105
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
  newsletterTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: '8px',
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: '16px',
    color: '#888',
    textAlign: 'center' as const,
    marginBottom: '24px',
  },
  greeting: {
    fontSize: '15px',
    lineHeight: 1.6,
    color: '#cccccc',
    marginBottom: '24px',
  },
  heroSection: {
    textAlign: 'center' as const,
    marginBottom: '24px',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  heroLink: {
    display: 'block',
    textDecoration: 'none',
  },
  heroImage: {
    width: '100%',
    maxWidth: '560px',
    borderRadius: '12px',
    display: 'block',
  },
  promoSection: {
    background:
      'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center' as const,
    marginTop: '24px',
    marginBottom: '24px',
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
    fontSize: '24px',
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: '8px',
  },
  promoCodeText: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#667eea',
    letterSpacing: '3px',
    marginBottom: '8px',
  },
  promoExpiry: {
    fontSize: '13px',
    color: '#888',
    marginBottom: '16px',
  },
  promoButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    padding: '12px 32px',
    textDecoration: 'none',
    display: 'inline-block',
  },
  articlesSection: {
    marginTop: '24px',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '20px',
  },
  article: {
    marginBottom: '8px',
  },
  articleImageLink: {
    textDecoration: 'none',
    display: 'block',
    marginBottom: '12px',
  },
  articleImage: {
    width: '100%',
    maxWidth: '160px',
    borderRadius: '8px',
    objectFit: 'cover' as const,
  },
  articleContentWithImage: {
    paddingLeft: '0',
  },
  articleContent: {
    paddingLeft: '0',
  },
  articleCategory: {
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1.5px',
    color: '#667eea',
    marginBottom: '4px',
    marginTop: '0',
  },
  articleTitleLink: {
    textDecoration: 'none',
  },
  articleTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '8px',
    marginTop: '0',
  },
  articleDescription: {
    fontSize: '14px',
    lineHeight: 1.6,
    color: '#999',
    marginBottom: '8px',
  },
  articleLink: {
    fontSize: '14px',
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: 500,
  },
  articleDivider: {
    borderColor: 'rgba(255,255,255,0.05)',
    margin: '16px 0',
  },
  divider: {
    borderColor: 'rgba(255,255,255,0.1)',
    margin: '24px 0',
  },
  ctaSection: {
    textAlign: 'center' as const,
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
  footer: {
    marginTop: '32px',
    textAlign: 'center' as const,
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
  footerText: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '12px',
  },
  footerLinks: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  footerLink: {
    fontSize: '13px',
    color: '#667eea',
    textDecoration: 'none',
  },
  footerLinkSeparator: {
    fontSize: '13px',
    color: '#444',
    margin: 0,
  },
  footerDivider: {
    borderColor: 'rgba(255,255,255,0.1)',
    margin: '16px 0',
  },
  copyright: {
    fontSize: '12px',
    color: '#444',
    marginBottom: '8px',
  },
  address: {
    fontSize: '11px',
    color: '#333',
    lineHeight: 1.6,
  },
}

export default NewsletterEmail
