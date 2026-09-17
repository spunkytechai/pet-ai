'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('://') || value.includes('\\')) return '/analyze'
  return value
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')

    try {
      const supabase = createClient()
      const result = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        new Promise<never>((_, reject) =>
          window.setTimeout(() => reject(new Error('Authentication request timed out. Please check your connection and try again.')), 15000),
        ),
      ])

      const { error } = result
      if (error) {
        setError(error.message)
        return
      }

      const next = safeNextPath(new URLSearchParams(window.location.search).get('next'))
      window.location.replace(next)
      return
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to sign in. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return <main><div className="container"><section className="card auth-card"><div className="eyebrow">PET AI</div><h1>Welcome back</h1><p className="muted">Sign in to analyze your pet’s signals and build its private pattern memory.</p><form onSubmit={submit}><label>Email<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>{error && <p className="safety">{error}</p>}<button className="primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form><p className="muted">New to PET AI? <a href="/signup">Create an account</a></p></section></div></main>
}
