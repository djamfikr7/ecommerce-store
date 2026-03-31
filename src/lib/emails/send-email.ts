import { Resend } from 'resend'
import { render } from '@react-email/render'
import type { ReactElement } from 'react'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'VoltStore <noreply@voltstore.com>'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://voltstore.com'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

export interface EmailOptions {
  to: string | string[]
  subject: string
  react: ReactElement
  from?: string
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string
  headers?: Record<string, string>
  tags?: Array<{ name: string; value: string }>
  scheduledAt?: string
}

interface EmailResult {
  id: string
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function validateConfig(): void {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured')
  }
}

async function sendWithRetry(options: EmailOptions, attempt = 1): Promise<EmailResult> {
  try {
    const html = await render(options.react)
    const text = await render(options.react, { plainText: true })

    const payload = {
      from: options.from || FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html,
      text,
      ...(options.cc && { cc: options.cc }),
      ...(options.bcc && { bcc: options.bcc }),
      ...(options.replyTo && { replyTo: options.replyTo }),
      ...(options.headers && { headers: options.headers }),
      ...(options.tags && { tags: options.tags }),
      ...(options.scheduledAt && { scheduledAt: options.scheduledAt }),
    } as Parameters<typeof resend.emails.send>[0]

    const { data, error } = await resend.emails.send(payload)

    if (error) {
      throw new Error(error.message)
    }

    if (!data?.id) {
      throw new Error('No email ID returned from Resend')
    }

    console.log(
      `[email] sent: ${data.id} to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`,
    )
    return { id: data.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[email] attempt ${attempt} failed: ${message}`)

    if (attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * attempt
      console.log(`[email] retrying in ${delay}ms...`)
      await sleep(delay)
      return sendWithRetry(options, attempt + 1)
    }

    throw err
  }
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  validateConfig()
  return sendWithRetry(options)
}

export async function sendBulkEmails(emails: EmailOptions[]): Promise<EmailResult[]> {
  validateConfig()
  const results: EmailResult[] = []

  for (const emailOptions of emails) {
    try {
      const result = await sendWithRetry(emailOptions)
      results.push(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[email] bulk send failed for ${emailOptions.to}: ${message}`)
      results.push({ id: 'failed' })
    }
  }

  return results
}

export function createEmailProps<T extends Record<string, unknown>>(
  template: (props: T) => ReactElement,
  props: T,
): ReactElement {
  return template(props)
}

export { FROM_EMAIL, BASE_URL }
export default sendEmail
