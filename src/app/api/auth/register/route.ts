import { NextRequest, NextResponse } from 'next/server'
import { registerAction } from '@/lib/actions/auth'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const result = await registerAction(formData)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 },
    )
  }
}
