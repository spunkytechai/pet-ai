'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

export default function NewPetPage() {
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('dog')
  const [age, setAge] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true); setError('')
    const response = await fetch('/api/pets', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, species, age }) })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) { setError(data.error || 'Could not create pet profile.'); setBusy(false); return }
    window.location.href = `/analyze?pet=${encodeURIComponent(data.pet.id)}`
  }

  return (
    <main className="app-page">
      <div className="container narrow-container">
        <header className="nav app-nav"><Link href="/" className="brand brand-lockup"><span className="brand-mark" aria-hidden="true">◒</span><span>PET AI</span></Link><Link className="secondary small" href="/analyze">Back</Link></header>
        <div className="pet-onboarding">
          <div className="onboarding-visual"><div className="pet-orbit"><span className="orbit-dot" /><div className="pet-symbol">◒</div></div><div className="eyebrow">01 · Meet your pet</div><h1>Let's get to know them.</h1><p>A few basics help PET AI keep interpretations specific to your pet instead of treating every animal the same.</p></div>
          <form className="pet-form card" onSubmit={submit}>
            <div className="form-heading"><span className="form-step">1</span><div><strong>Pet profile</strong><p>Only the essentials for now.</p></div></div>
            <label>What's their name?<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bruno" autoFocus /></label>
            <label>Who are they?<select value={species} onChange={(e) => setSpecies(e.target.value)}><option value="dog">Dog</option><option value="cat">Cat</option></select></label>
            <label>Age <span className="optional">optional</span><input type="number" min="0" max="50" step="0.1" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 3" /></label>
            {error && <p className="safety">{error}</p>}
            <button className="primary" disabled={busy}>{busy ? 'Creating profile…' : 'Meet my pet →'}</button>
            <p className="form-footnote">You can add more details later. PET AI uses this profile to add context to future interpretations.</p>
          </form>
        </div>
      </div>
    </main>
  )
}
