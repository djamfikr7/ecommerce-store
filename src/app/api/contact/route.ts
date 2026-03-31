import { NextRequest, NextResponse } from 'next/server'
import { validateContactForm } from '@/lib/validators/support'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = validateContactForm(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: validation.error.errors.map((e) => e.message).join(', '),
          details: validation.error.errors,
        },
        { status: 400 },
      )
    }

    const { name, email, subject, message } = validation.data

    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
      console.log('[contact] RESEND_API_KEY not configured, logging submission:', {
        name,
        email,
        subject,
        message: message.substring(0, 100) + '...',
      })
      return NextResponse.json({ success: true, id: 'mock-' + Date.now() })
    }

    const { Resend } = await import('resend')
    const resend = new Resend(resendApiKey)

    const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Contact Form <noreply@voltstore.com>'
    const toEmail = process.env.CONTACT_TO_EMAIL || 'support@voltstore.com'

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e; margin-bottom: 16px;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Name</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Email</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Subject</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${subject}</td>
            </tr>
          </table>
          <div style="padding: 16px 12px;">
            <h3 style="color: #374151; margin-bottom: 8px;">Message</h3>
            <p style="color: #6b7280; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
          <p style="font-size: 12px; color: #9ca3af;">
            This email was sent from the VoltStore contact form.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('[contact] Resend error:', error.message)
      return NextResponse.json(
        { error: 'Email error', message: 'Failed to send email. Please try again later.' },
        { status: 500 },
      )
    }

    console.log('[contact] Email sent:', data?.id)

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('[contact] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    )
  }
}
