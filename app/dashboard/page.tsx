'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AppNav } from '@/components/app-nav'

type Pet = { id: string; name: string; species: 'dog' | 'cat'; age_years?: number | null }
type HistoryItem = {
  id: string
  pet?: { id?: string; name?: string; species?: string } | null
  pet_id?: string
  likely_intent: string
  emotional_state: string
  confidence: number
  created_at: string
}

export default function DashboardPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/pets', { credentials: 'same-origin' }).then(async r => r.ok ? (await r.json()).pets ?? [] : []),
      fetch('/api/history', { credentials: 'same-origin' }).then(async r => r.ok ? (await r.json()).history ?? [] : []),
    ]).then(([petData, historyData]) => {
      setPets(petData)
      setHistory(historyData)
    }).finally(() => setLoading(false))
  }, [])

  const recent = history.slice(0, 3)
  const averageConfidence = useMemo(() => {
    if (!history.length) return 0
    return Math.round(history.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / history.length * 100)
  }, [history])

  return (
    <main className="app-page dashboard-page">
      <div className="container">
        <AppNav />

        <section className="dashboard-hero">
          <div>
            <div className="eyebrow">Your pet workspace</div>
            <h1>Good to see you.</h1>
            <p>Understand a moment, learn a pattern, and keep everything connected to the pets you care about.</p>
          </div>
          <Link className="primary dashboard-hero-action" href={pets.length ? '/analyze' : '/pet/new'}>
            {pets.length ? 'Analyze a sound →' : 'Add your first pet →'}
          </Link>
        </section>

        <section className="dashboard-stats" aria-label="Pet AI overview">
          <article><span>Pets</span><strong>{loading ? '—' : pets.length}</strong><small>profiles in your account</small></article>
          <article><span>Signals learned</span><strong>{loading ? '—' : history.length}</strong><small>recorded interpretations</small></article>
          <article><span>Average confidence</span><strong>{loading || !history.length ? '—' : averageConfidence + '%'}</strong><small>across recorded interpretations</small></article>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-head">
            <div><div className="eyebrow">My pets</div><h2>Choose a pet to continue.</h2></div>
            <Link className="text-link" href="/pet/new">Add another <span>→</span></Link>
          </div>
          {loading && <div className="dashboard-empty card"><p className="muted">Loading your workspace…</p></div>}
          {!loading && !pets.length && (
            <div className="dashboard-empty card">
              <div className="empty-icon">◒</div>
              <h3>Your pet profile is the foundation.</h3>
              <p className="muted">Add a dog or cat once. PET AI will keep their interpretations and patterns connected to them.</p>
              <Link className="primary" href="/pet/new">Create pet profile →</Link>
            </div>
          )}
          {!loading && pets.length > 0 && (
            <div className="pet-grid">
              {pets.map((pet) => (
                <article className="pet-tile" key={pet.id}>
                  <div className={`pet-tile-avatar ${pet.species}`} aria-hidden="true">{pet.species === 'dog' ? '●' : '◐'}</div>
                  <div className="pet-tile-copy">
                    <span className="eyebrow">{pet.species}</span>
                    <h3>{pet.name}</h3>
                    <p>{pet.age_years == null ? 'Age not added' : `${pet.age_years} years old`}</p>
                  </div>
                  <Link href={`/pet/${encodeURIComponent(pet.id)}`} aria-label={`Open ${pet.name} profile`}>→</Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section recent-section">
          <div className="dashboard-section-head">
            <div><div className="eyebrow">Recent signals</div><h2>What happened lately.</h2></div>
            <Link className="text-link" href="/history">View history <span>→</span></Link>
          </div>
          {!loading && !recent.length && (
            <div className="dashboard-empty compact card">
              <p className="muted">No interpretations yet. Record a sound when a moment happens.</p>
              <Link className="secondary small" href="/analyze">Start an analysis</Link>
            </div>
          )}
          {recent.length > 0 && (
            <div className="recent-list">
              {recent.map((item) => (
                <article className="recent-item" key={item.id}>
                  <div className="recent-marker" />
                  <div className="recent-copy">
                    <span>{item.pet?.name ?? 'Pet'} · {item.pet?.species ?? 'pet'}</span>
                    <strong>{item.likely_intent}</strong>
                    <p>{item.emotional_state}</p>
                  </div>
                  <div className="recent-confidence">{Math.round(Number(item.confidence) * 100)}%</div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-actions">
          <Link href="/analyze" className="dashboard-action dark"><span>01</span><div><strong>Analyze a sound</strong><small>Record, upload, add context</small></div><b>→</b></Link>
          <Link href="/species" className="dashboard-action"><span>02</span><div><strong>Identify a pet</strong><small>Photo estimate + A–Z guide</small></div><b>→</b></Link>
          <Link href="/history" className="dashboard-action"><span>03</span><div><strong>Review memory</strong><small>Patterns and owner feedback</small></div><b>→</b></Link>
        </section>

        <div className="notice dashboard-notice">PET AI provides probabilistic, AI-assisted interpretations. It does not literally translate animal language or diagnose medical conditions.</div>
      </div>
    </main>
  )
}
