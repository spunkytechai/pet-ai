import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const path = request.nextUrl.pathname
  const isProtected = path.startsWith('/analyze') || path.startsWith('/pet') || path.startsWith('/history') || path.startsWith('/api/analyze') || path.startsWith('/api/history') || path.startsWith('/api/feedback') || path.startsWith('/api/pets')
  const isAuthPage = path === '/login' || path === '/signup'

  // Keep public routes available if Supabase environment variables are not configured.
  // Protected routes remain inaccessible until authentication is configured.
  if (!url || !key) {
    if (isProtected) {
      if (path.startsWith('/api/')) return NextResponse.json({ error: 'Authentication is not configured.' }, { status: 503 })
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
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
    loginUrl.searchParams.set('next', path)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPage && claims) {
    const analyzeUrl = request.nextUrl.clone()
    analyzeUrl.pathname = '/analyze'
    analyzeUrl.search = ''
    return NextResponse.redirect(analyzeUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
