'use client'

import { FormEvent, useState } from 'react'

export default function NewPetPage() {
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('dog')
  const [age, setAge] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const response = await fetch('/api/pets', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, species, age }) })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) setError(data.error || 'Could not create pet profile.')
    else window.location.href = `/analyze?pet=${encodeURIComponent(data.pet.id)}`
    setBusy(false)
  }

  return <main><div className="container"><header className="nav"><div className="brand">PET AI</div><div className="badge">Step 1 · Your pet</div></header><section className="hero"><div className="eyebrow">Create a pet profile</div><h1>Start with the pet, not just the sound.</h1><p>Pet species, age, name, and everyday context help PET AI interpret signals more carefully.</p><form onSubmit={submit} style={{maxWidth:520,display:'grid',gap:14,marginTop:30}}><label>Pet name<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bruno" /></label><label>Species<select value={species} onChange={(e) => setSpecies(e.target.value)}><option value="dog">Dog</option><option value="cat">Cat</option></select></label><label>Age (optional)<input type="number" min="0" max="50" step="0.1" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 3" /></label>{error && <p className="safety">{error}</p>}<button className="primary" disabled={busy}>{busy ? 'Creating…' : 'Continue to sound analysis'}</button></form></section></div></main>
}
