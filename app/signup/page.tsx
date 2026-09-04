'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else if (data.session) window.location.href = '/analyze'
    else setMessage('Account created. Check your email to confirm your account, then sign in.')
    setBusy(false)
  }

  return <main><div className="container"><section className="card auth-card"><div className="eyebrow">PET AI</div><h1>Create your account</h1><p className="muted">Your pet profiles, recordings, interpretations, and feedback are designed to stay owner-scoped.</p><form onSubmit={submit}><label>Email<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>Password<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} /></label>{error && <p className="safety">{error}</p>}{message && <p className="notice">{message}</p>}<button className="primary" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button></form><p className="muted">Already have an account? <a href="/login">Sign in</a></p></section></div></main>
}
