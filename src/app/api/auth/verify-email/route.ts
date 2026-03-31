import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailAction } from '@/lib/actions/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, code, email } = body

    const result = await verifyEmailAction({ token, code, email })

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verify email API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
