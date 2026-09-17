'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LogoutButton } from '@/components/logout-button'

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/history', { credentials: 'same-origin' }).then(async (response) => {
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'History could not be loaded.')
      setHistory(data.history ?? [])
    }).catch((err) => setError(err instanceof Error ? err.message : 'History could not be loaded.')).finally(() => setLoading(false))
  }, [])

  return (
    <main className="app-page">
      <div className="container">
        <header className="nav app-nav"><Link href="/" className="brand brand-lockup"><span className="brand-mark" aria-hidden="true">◒</span><span>PET AI</span></Link><nav className="nav-links"><Link className="secondary small" href="/analyze">Analyze a sound</Link><Link className="secondary small" href="/pet/new">+ Add pet</Link><LogoutButton /></nav></header>
        <section className="hero history-hero"><div className="eyebrow">Your pet memory</div><h1>A record of what you've learned together.</h1><p>Every interpretation, context clue, and correction helps you see recurring patterns without pretending a guess is a fact.</p></section>
        <div className="history-toolbar"><div><strong>{history.length}</strong><span> interpretations</span></div><span className="history-private">Private to your account</span></div>
        {loading && <div className="card"><p className="muted">Loading your pet memory…</p></div>}
        {error && <div className="card"><p className="safety">{error}</p><Link className="secondary small" href="/login">Sign in again</Link></div>}
        {!loading && !error && history.length === 0 && <div className="empty-state card"><div className="empty-icon">◒</div><h2>Your first signal is waiting.</h2><p className="muted">Record a sound and start building a private pattern history for your pet.</p><Link className="primary" href="/analyze">Analyze a sound →</Link></div>}
        {!loading && !error && history.length > 0 && <div className="history-list">{history.map((item) => <article className="history-card" key={item.id}><div className="history-card-head"><div><div className="eyebrow">{item.pet?.name ?? 'Pet'} · {item.pet?.species ?? item.species}</div><h2>{item.likely_intent}</h2></div><div className="history-confidence"><strong>{Math.round(Number(item.confidence) * 100)}%</strong><span>confidence</span></div></div><p className="history-emotion">{item.emotional_state}</p><div className="history-details"><div><small>Other possibilities</small><p>{(item.alternatives ?? []).join(' · ') || 'None recorded'}</p></div><div><small>Context</small><p>{(item.context_used ?? []).join(' · ') || 'No context supplied'}</p></div></div><div className="history-meta"><span>{new Date(item.created_at).toLocaleString()}</span><span>Model {item.model_version}</span></div></article>)}</div>}
      </div>
    </main>
  )
}
