'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'Something went wrong. Please try again.'

  return (
    <main className="app-page">
      <div className="container narrow-container">
        <header className="nav app-nav">
          <Link href="/" className="brand brand-lockup" aria-label="PET AI home"><span className="brand-mark" aria-hidden="true">◒</span><span>PET AI</span></Link>
        </header>
        <section className="card empty-state" aria-labelledby="error-title">
          <div className="safety-mark" aria-hidden="true">!</div>
          <div>
            <div className="eyebrow">PET AI · Something went wrong</div>
            <h1 id="error-title">We couldn't complete that request.</h1>
            <p>{message}</p>
            <div className="actions">
              <Link className="primary" href="/analyze">Back to PET AI</Link>
              <Link className="secondary" href="/">Go home</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
