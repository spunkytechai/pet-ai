'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AppNav } from '@/components/app-nav'

type Pet = { id:string; name:string; species:'dog'|'cat'; age_years?:number|null; created_at:string }
type Signal = { id:string; pet?:{id:string;name:string;species:string}|null; likely_intent:string; emotional_state:string; confidence:number; safety_flag:boolean; created_at:string }

export default function PetProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState('')
  const [pet, setPet] = useState<Pet|null>(null)
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { params.then(({ id }) => setId(id)) }, [params])

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetch('/api/pets',{credentials:'same-origin'}).then(async r => r.ok ? (await r.json()).pets ?? [] : []),
      fetch('/api/history',{credentials:'same-origin'}).then(async r => r.ok ? (await r.json()).history ?? [] : []),
    ]).then(([pets, history]) => {
      setPet((pets as Pet[]).find(item => item.id === id) ?? null)
      setSignals((history as Signal[]).filter(item => item.pet?.id === id))
    }).finally(() => setLoading(false))
  }, [id])

  const pattern = useMemo(() => {
    const counts = signals.reduce<Record<string,number>>((acc,item) => { acc[item.likely_intent]=(acc[item.likely_intent]||0)+1; return acc },{})
    return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]
  }, [signals])

  if (loading) return <main className="app-page"><div className="container"><AppNav /><div className="card pet-profile-loading">Loading pet profile…</div></div></main>
  if (!pet) return <main className="app-page"><div className="container"><AppNav /><div className="empty-state card"><div className="empty-icon">◒</div><h2>Pet profile not found.</h2><Link className="primary" href="/dashboard">Back to dashboard →</Link></div></div></main>

  return (
    <main className="app-page">
      <div className="container">
        <AppNav />
        <section className="pet-profile-hero">
          <div className={`pet-profile-art ${pet.species}`} aria-hidden="true">{pet.species === 'dog' ? '◒' : '◐'}</div>
          <div className="pet-profile-copy">
            <div className="eyebrow">Pet profile · {pet.species}</div>
            <h1>{pet.name}</h1>
            <p>{pet.age_years == null ? 'Age not added yet.' : `${pet.age_years} years old`} · Added {new Date(pet.created_at).toLocaleDateString()}</p>
            <div className="pet-profile-actions">
              <Link className="primary" href={`/analyze?pet=${encodeURIComponent(pet.id)}`}>Analyze a sound →</Link>
              <Link className="secondary" href="/species">Species Analyzer</Link>
            </div>
          </div>
        </section>

        <section className="pet-profile-grid">
          <article className="pet-profile-stat"><span>Signals recorded</span><strong>{signals.length}</strong><small>interpretations linked to {pet.name}</small></article>
          <article className="pet-profile-stat"><span>Recurring observation</span><strong>{pattern?.[0] ?? 'Not enough data'}</strong><small>{pattern ? `${pattern[1]} recorded observation${pattern[1] === 1 ? '' : 's'}` : 'Keep analyzing moments to build a pattern.'}</small></article>
          <article className="pet-profile-stat"><span>Latest confidence</span><strong>{signals[0] ? `${Math.round(Number(signals[0].confidence)*100)}%` : '—'}</strong><small>{signals[0] ? 'for the latest interpretation' : 'No interpretation yet'}</small></article>
        </section>

        <section className="pet-profile-section">
          <div className="dashboard-section-head"><div><div className="eyebrow">What you've learned</div><h2>Recent moments with {pet.name}.</h2></div><Link className="text-link" href="/history">Full history <span>→</span></Link></div>
          {!signals.length && <div className="dashboard-empty card"><div className="empty-icon">◒</div><h3>No moments recorded yet.</h3><p className="muted">Analyze a sound and your first interpretation will appear here.</p><Link className="primary" href={`/analyze?pet=${encodeURIComponent(pet.id)}`}>Analyze {pet.name} →</Link></div>}
          {!!signals.length && <div className="pet-signal-list">{signals.slice(0,8).map(signal => <article className="pet-signal-item" key={signal.id}><div className="recent-marker"/><div><span>{new Date(signal.created_at).toLocaleString()}</span><strong>{signal.likely_intent}</strong><p>{signal.emotional_state}</p></div><b>{Math.round(Number(signal.confidence)*100)}%</b></article>)}</div>}
        </section>

        <div className="notice dashboard-notice">Pattern summaries describe repeated past interpretations. They are observations, not diagnoses or proof of intent.</div>
      </div>
    </main>
  )
}
