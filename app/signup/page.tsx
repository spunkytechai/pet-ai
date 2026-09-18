'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('://') || value.includes('\\')) return '/dashboard'
  return value
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [googleBusy, setGoogleBusy] = useState(false)

  async function signInWithGoogle() {
    setGoogleBusy(true)
    setError('')
    try {
      const supabase = createClient()
      const next = safeNextPath(new URLSearchParams(window.location.search).get('next'))
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
      if (error) setError(error.message)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to continue with Google. Please try again.')
    } finally {
      setGoogleBusy(false)
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const supabase = createClient()
      const next = safeNextPath(new URLSearchParams(window.location.search).get('next'))
      const origin = window.location.origin
      const emailRedirectTo = `${origin}/auth/confirm?next=${encodeURIComponent(next)}`
      const result = await Promise.race([
        supabase.auth.signUp({ email, password, options: { emailRedirectTo } }),
        new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error('Authentication request timed out. Please check your connection and try again.')), 15000)),
      ])
      const { data, error } = result
      if (error) {
        setError(error.message)
      } else if (data.session) {
        window.location.replace(next)
        return
      } else {
        setMessage('Account created. Check your email to confirm your account, then sign in.')
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to create your account. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main><div className="container"><section className="card auth-card">
      <div className="eyebrow">PET AI</div>
      <h1>Create your account</h1>
      <p className="muted">Your pet profiles, recordings, interpretations, and feedback are designed to stay owner-scoped.</p>
      <button type="button" className="secondary" onClick={signInWithGoogle} disabled={busy || googleBusy}>
        {googleBusy ? 'Connecting…' : 'Continue with Google'}
      </button>
      <div className="auth-divider"><span>or</span></div>
      <form onSubmit={submit}>
        <label>Email<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <p className="safety">{error}</p>}
        {message && <p className="notice">{message}</p>}
        <button className="primary" disabled={busy || googleBusy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="muted">Already have an account? <a href={`/login?next=${encodeURIComponent(safeNextPath(typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('next')))}`}>Sign in</a></p>
    </section></div></main>
  )
}
