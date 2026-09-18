'use client'

import { FormEvent, useEffect, useState } from 'react'
import Image from 'next/image'
import { PetVisual } from '@/components/pet-visual'
import { createClient } from '@/lib/supabase/client'

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('://') || value.includes('\\')) return '/dashboard'
  return value
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [googleBusy, setGoogleBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const callbackError = new URLSearchParams(window.location.search).get('error')
    if (callbackError) setError(callbackError)
  }, [])

  async function signInWithGoogle() {
    setGoogleBusy(true)
    setError('')
    try {
      const supabase = createClient()
      const next = safeNextPath(new URLSearchParams(window.location.search).get('next'))
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
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
    try {
      const supabase = createClient()
      const result = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error('Authentication request timed out. Please check your connection and try again.')), 15000)),
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

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <aside className="auth-story">
          <a className="auth-brand" href="/">
            <span className="auth-brand-mark">🐾</span>
            <span><strong>PET AI</strong><small>Understand better.</small></span>
          </a>
          <div className="auth-story-copy">
            <span className="auth-script">Same love.<br />A deeper understanding. ♡</span>
            <h1>Better<br />Pets<br />Happier<br />Humans</h1>
            <div className="auth-accent" />
            <div className="auth-benefits">
              <span><b>◫</b> Understand behavior &amp; emotions</span>
              <span><b>◇</b> Private &amp; secure</span>
              <span><b>♡</b> Built for pet parents</span>
              <span><b>◎</b> Available in English &amp; Hindi</span>
            </div>
          </div>
          <div className="auth-pets" aria-hidden="true">
            <div className="auth-pet-dog"><PetVisual species="dog" size="lg" /></div>
            <div className="auth-pet-cat"><PetVisual species="cat" size="md" /></div>
            <span className="auth-pet-note">Woof?<br />Meow?<br />We help you<br />understand. ♡</span>
          </div>
          <div className="auth-trust">● <span>Trusted by pet parents worldwide</span></div>
        </aside>

        <section className="auth-panel">
          <div className="auth-card-v2">
            <div className="auth-mobile-brand">PET AI</div>
            <span className="auth-card-eyebrow">WELCOME BACK</span>
            <h2>Sign in to PET AI</h2>
            <p className="auth-card-lede">Continue understanding your pet&apos;s sounds, behavior and private memory.</p>

            <button type="button" className="google-button" onClick={signInWithGoogle} disabled={busy || googleBusy}>
              <span className="google-icon"><Image src="/google-g.png" alt="" width={34} height={34} priority /></span>
              <span>{googleBusy ? 'Connecting…' : 'Continue with Google'}</span>
            </button>
            <div className="auth-divider-v2"><span>OR</span></div>

            <form onSubmit={submit} className="auth-form-v2">
              <label>Email<input type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
              <label>Password
                <span className="auth-password-wrap">
                  <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? '◉' : '◌'}</button>
                </span>
              </label>
              {error && <p className="safety auth-error">{error}</p>}
              <button className="primary auth-submit" disabled={busy || googleBusy}>{busy ? 'Signing in…' : 'Sign in'}</button>
            </form>

            <p className="auth-legal">By continuing, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.</p>
            <p className="auth-switch">New to PET AI? <a href="/signup">Create an account</a></p>
          </div>
        </section>
      </div>
      <footer className="auth-footer">
        <span>◇ No Paid APIs</span><span>♧ Your Data Stays Private</span><span>◎ Available in English &amp; Hindi</span>
      </footer>
    </main>
  )
}
