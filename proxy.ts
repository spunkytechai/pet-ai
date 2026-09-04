import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  const { data: claimsData } = await supabase.auth.getClaims()
  const claims = claimsData?.claims
  const path = request.nextUrl.pathname
  const isProtected = path.startsWith('/analyze') || path.startsWith('/pet') || path.startsWith('/history') || path.startsWith('/api/analyze') || path.startsWith('/api/history') || path.startsWith('/api/feedback') || path.startsWith('/api/pets')
  const isAuthPage = path === '/login' || path === '/signup'

  if (isProtected && !claims) {
    if (path.startsWith('/api/')) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  if (isAuthPage && claims) {
    const url = request.nextUrl.clone()
    url.pathname = '/analyze'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
