'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AppNav } from '@/components/app-nav'

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const petSummaries = Array.from(new Map(history.map((item) => [item.pet?.id ?? item.pet?.name ?? item.pet_id, item.pet])).entries()).map(([id, pet]) => {
    const items = history.filter((item) => (item.pet?.id ?? item.pet?.name ?? item.pet_id) === id)
    const counts = items.reduce<Record<string, number>>((acc, item) => { acc[item.likely_intent] = (acc[item.likely_intent] || 0) + 1; return acc }, {})
    const recurring = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    const avgConfidence = items.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / items.length
    return { pet, count: items.length, recurring: recurring?.[0] ?? 'No recurring pattern yet', avgConfidence }
  })

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
        <AppNav />
        <section className="hero history-hero"><div className="eyebrow">Your pet memory</div><h1>A record of what you've learned together.</h1><p>Every interpretation, context clue, and correction helps you see recurring patterns without pretending a guess is a fact.</p></section>
        <div className="history-toolbar"><div><strong>{history.length}</strong><span> interpretations</span></div><span className="history-private">Private to your account</span></div>
        {loading && <div className="card"><p className="muted">Loading your pet memory…</p></div>}
        {error && <div className="card"><p className="safety">{error}</p><Link className="secondary small" href="/login">Sign in again</Link></div>}
        {!loading && !error && history.length === 0 && <div className="empty-state card"><div className="empty-icon">◒</div><h2>Your first signal is waiting.</h2><p className="muted">Record a sound and start building a private pattern history for your pet.</p><Link className="primary" href="/analyze">Analyze a sound →</Link></div>}
        {!loading && !error && history.length > 0 && <>
          <section className="card memory-summary"><div className="eyebrow">Private pattern memory</div><h2>What PET AI has observed so far</h2><p className="muted">These are frequency summaries of past interpretations, not diagnoses or proof of what your pet intended.</p><div className="memory-grid">{petSummaries.map((summary, index) => <article key={index}><div className="eyebrow">{summary.pet?.name ?? 'Pet'} · {summary.pet?.species ?? 'pet'}</div><strong>{summary.recurring}</strong><span>{summary.count} recorded interpretation{summary.count === 1 ? '' : 's'} · average confidence {Math.round(summary.avgConfidence * 100)}%</span></article>)}</div></section>
          <div className="history-list">{history.map((item) => <article className="history-card" key={item.id}><div className="history-card-head"><div><div className="eyebrow">{item.pet?.name ?? 'Pet'} · {item.pet?.species ?? item.species}</div><h2>{item.likely_intent}</h2></div><div className="history-confidence"><strong>{Math.round(Number(item.confidence) * 100)}%</strong><span>confidence</span></div></div><p className="history-emotion">{item.emotional_state}</p><div className="history-details"><div><small>Other possibilities</small><p>{(item.alternatives ?? []).join(' · ') || 'None recorded'}</p></div><div><small>Context</small><p>{(item.context_used ?? []).join(' · ') || 'No context supplied'}</p></div></div><div className="history-meta"><span>{new Date(item.created_at).toLocaleString()}</span><span>Model {item.model_version}</span></div></article>)}</div></>}
      </div>
    </main>
  )
}
