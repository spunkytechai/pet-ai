'use client'

import { useEffect, useState } from 'react'

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/history')
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data?.error || 'History could not be loaded.')
        setHistory(data.history ?? [])
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'History could not be loaded.'))
      .finally(() => setLoading(false))
  }, [])

  return <main><div className="container"><header className="nav"><div className="brand">PET AI</div><div className="actions"><a className="secondary" href="/analyze">Analyze</a><a className="secondary" href="/pet/new">New pet</a></div></header><section className="hero compact"><div className="eyebrow">Private history</div><h1>Your pet signals over time.</h1><p>Review previous interpretations and the feedback you gave PET AI.</p></section>{loading && <div className="card"><p>Loading history…</p></div>}{error && <div className="card"><p className="safety">{error}</p></div>}{!loading && !error && history.length === 0 && <div className="card"><h2>No analyses yet</h2><p className="muted">Record your first pet signal to start building a private history.</p><a className="primary" href="/analyze">Analyze a sound</a></div>}{history.map((item) => <article className="card history-item" key={item.id}><div className="row-between"><div><div className="eyebrow">{item.pet?.name ?? 'Pet'} · {item.pet?.species ?? item.species}</div><h2>{item.likely_intent}</h2></div><div className="confidence">{Math.round(Number(item.confidence) * 100)}%<small>confidence</small></div></div><p className="emotion">{item.emotional_state}</p><p><strong>Alternatives:</strong> {(item.alternatives ?? []).join(' · ') || 'None recorded'}</p><p><strong>Context:</strong> {(item.context_used ?? []).join(' · ') || 'None supplied'}</p><p className="muted">{new Date(item.created_at).toLocaleString()} · {item.model_version}</p></article>)}</div></main>
}
