import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/analyze', '/pet', '/history', '/species', '/api/analyze', '/api/history', '/api/feedback', '/api/pets', '/api/species-identify']
const AUTH_PAGES = new Set(['/login', '/signup'])

function isProtectedPath(path: string) {
  return PROTECTED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('://') || value.includes('\\')) return '/dashboard'
  return value
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const path = request.nextUrl.pathname
  const isProtected = isProtectedPath(path)
  const isAuthPage = AUTH_PAGES.has(path)

  if (!url || !key) {
    if (isProtected) {
      if (path.startsWith('/api/')) return NextResponse.json({ error: 'Authentication is not configured.' }, { status: 503 })
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.search = ''
      loginUrl.searchParams.set('next', path)
      return NextResponse.redirect(loginUrl)
    }
    return response
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const { data: claimsData } = await supabase.auth.getClaims()
  const claims = claimsData?.claims

  if (isProtected && !claims) {
    if (path.startsWith('/api/')) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = ''
    loginUrl.searchParams.set('next', path)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPage && claims) {
    const nextUrl = request.nextUrl.clone()
    const requestedNext = safeNextPath(request.nextUrl.searchParams.get('next'))
    nextUrl.pathname = requestedNext
    nextUrl.search = ''
    return NextResponse.redirect(nextUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
