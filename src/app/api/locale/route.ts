import { NextRequest, NextResponse } from 'next/server'
import { routing, locales, defaultLocale } from '@/lib/i18n/routing'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    // Get user's preferred locale from cookie or Accept-Language header
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
    const acceptLanguage = request.headers.get('Accept-Language')

    let detectedLocale = defaultLocale

    // Priority 1: Cookie
    if (cookieLocale && locales.includes(cookieLocale as (typeof locales)[number])) {
      detectedLocale = cookieLocale as (typeof locales)[number]
    } else if (acceptLanguage) {
      // Priority 2: Accept-Language header
      const languages = acceptLanguage
        .split(',')
        .map((lang) => {
          const [code, q] = lang.trim().split(';q=')
          return { code: code.split('-')[0], q: q ? parseFloat(q) : 1 }
        })
        .sort((a, b) => b.q - a.q)

      for (const { code } of languages) {
        if (locales.includes(code as (typeof locales)[number])) {
          detectedLocale = code as (typeof locales)[number]
          break
        }
      }
    }

    return NextResponse.json({
      locale: detectedLocale,
      availableLocales: locales,
      defaultLocale,
    })
  } catch (error) {
    console.error('Error detecting locale:', error)
    return NextResponse.json(
      { locale: defaultLocale, availableLocales: locales, defaultLocale },
      { status: 200 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { locale } = body

    if (!locale || !locales.includes(locale as (typeof locales)[number])) {
      return NextResponse.json(
        { error: 'Invalid locale', validLocales: locales },
        { status: 400 }
      )
    }

    const response = NextResponse.json({ success: true, locale })

    // Set cookie for 1 year
    response.cookies.set('NEXT_LOCALE', locale, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
    })

    return response
  } catch (error) {
    console.error('Error setting locale:', error)
    return NextResponse.json(
      { error: 'Failed to set locale' },
      { status: 500 }
    )
  }
}
