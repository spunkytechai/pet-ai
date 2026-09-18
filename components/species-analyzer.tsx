'use client'

import { useRef, useState } from 'react'

type Result = {
  configured: boolean
  model?: string
  error?: string
  identification?: {
    commonName: string
    scientificName: string
    group: string
    confidence: number
    alternatives: string[]
    visibleTraits: string[]
    uncertainty: string[]
  }
  profile?: Record<string, unknown>
}

const sections: Array<[string, string]> = [
  ['Owner should know', 'ownerShouldKnow'],
  ['Care checklist', 'careChecklist'],
  ['Behavior & enrichment', 'behavior'],
  ['Watch for', 'watchFor'],
  ['Identification notes', 'identificationNotes'],
]

export function SpeciesAnalyzer() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)
  const [manualSpecies, setManualSpecies] = useState<'dog' | 'cat' | null>(null)

  const selectImage = (next: File) => {
    if (!next.type.startsWith('image/')) return
    setFile(next)
    setPreview(URL.createObjectURL(next))
    setResult(null)
  }

  const identify = async () => {
    if (!file) return
    setBusy(true)
    const body = new FormData()
    body.append('image', file)
    try {
      const response = await fetch('/api/species-identify', { method: 'POST', body })
      const data = await response.json()
      setResult(data)
    } catch {
      setResult({ configured: false, error: 'Could not reach the species analyzer.' })
    } finally {
      setBusy(false)
    }
  }

  const profile = result?.profile
  const identification = result?.identification
  const manualProfile = manualSpecies ? {
    commonName: manualSpecies === 'dog' ? 'Dog' : 'Cat',
    scientificName: manualSpecies === 'dog' ? 'Canis lupus familiaris' : 'Felis catus',
    group: 'Companion animal',
    confidence: 1,
    alternatives: [],
    visibleTraits: [],
    uncertainty: ['Species was selected manually; no photo identification was performed.'],
    ownerShouldKnow: [],
    careNotes: []
  } : null
  const activeIdentification = identification || manualProfile
  const activeProfile = profile || (manualSpecies ? {
    commonName: manualProfile!.commonName,
    scientificName: manualProfile!.scientificName,
    group: manualProfile!.group,
    origin: manualSpecies === 'dog' ? 'Domestic dogs descend from ancient wolf lineages; individual breed history varies.' : 'Domestic cats are a globally distributed companion species with diverse lineages.',
    lifespan: manualSpecies === 'dog' ? 'Often around 10–13 years; varies substantially by size, genetics, and care.' : 'Often around 12–18 years; indoor and outdoor life histories can differ.',
    adultSize: manualSpecies === 'dog' ? 'Highly variable across breeds and individuals.' : 'Generally small-to-medium companion animal; varies by individual and lineage.',
    temperament: 'Individual temperament varies; species-level traits do not predict every individual.',
    energy: 'Varies by age, health, genetics, and individual personality.',
    intelligence: 'Learning and problem-solving vary between individuals.',
    socialNeeds: 'Provide predictable social interaction, enrichment, rest, and safe retreat spaces.',
    grooming: 'Depends on coat type and individual needs; include nails, ears, skin, and dental care as appropriate.',
    exercise: manualSpecies === 'dog' ? 'Daily physical activity plus mental enrichment, adjusted for age and health.' : 'Daily play, climbing/scratching opportunities, and mental enrichment.',
    diet: 'Use complete, species-appropriate nutrition and fresh water; avoid toxic foods.',
    training: 'Use reward-based, consistent training and species-appropriate enrichment.',
    environment: 'Provide safe shelter, clean water, comfortable rest, enrichment, and hazard-free spaces.',
    behavior: ['Behavior cannot be reliably inferred from a single photo.'],
    ownerShouldKnow: ['A manual species selection provides general education only; breed, age, sex, and health cannot be established from this selection.', 'Persistent or unusual changes in appetite, breathing, mobility, elimination, behavior, or energy should be discussed with a veterinarian.'],
    watchFor: ['Acute distress, difficulty breathing, collapse, severe injury, or other emergencies warrant urgent veterinary attention.'],
    careChecklist: ['Fresh water available', 'Complete species-appropriate nutrition', 'Safe daily activity and enrichment', 'Regular grooming and dental care as appropriate', 'Preventive veterinary care and vaccinations', 'Parasite prevention appropriate to the animal and local advice', 'Reliable identification where appropriate'],
    identificationNotes: ['Manual species selection — no visual identification confidence is claimed.']
  } : null)

  return (
    <div className="species-analyzer">
      <section className="card species-upload-card">
        <div className="eyebrow">01 · Identify</div>
        <h2>Show us your pet</h2>
        <p className="muted">Upload a photo for the current visual-analysis workflow. If photo identification is unavailable, choose Dog or Cat for a general A–Z guide.</p>
        <input ref={inputRef} hidden type="file" accept="image/*" capture="environment" onChange={(e) => e.target.files?.[0] && selectImage(e.target.files[0])} />
        <button className="primary" onClick={() => inputRef.current?.click()}>{file ? 'Change photo' : 'Click a photo / upload'}</button>
        {preview && <div className="species-preview"><img src={preview} alt="Selected pet" /></div>}
        {file && <div className="species-file"><strong>{file.name}</strong><span>{Math.ceil(file.size / 1024)} KB</span></div>}
        <button className="secondary species-identify" disabled={!file || busy} onClick={identify}>{busy ? 'Analyzing photo…' : 'Analyze this photo →'}</button>
        <p className="microcopy">Photo identification is only available when a compatible local vision model is installed. A photo cannot establish health, pedigree, exact age, or sex.</p>
      </section>

      {result?.error && <div className="card safety"><strong>Species analysis unavailable</strong><p>{result.error}</p></div>}

      {!identification && !result?.error && <section className="card species-manual-card">
        <div className="eyebrow">No AI key required</div>
        <h3>Get the A–Z guide without photo identification</h3>
        <p className="muted">Choose the species to open general care information. This does not claim that PET AI identified the animal in your photo.</p>
        <div className="species-manual-actions">
          <button className="secondary" onClick={() => { setManualSpecies('dog'); setResult(null) }}>Dog</button>
          <button className="secondary" onClick={() => { setManualSpecies('cat'); setResult(null) }}>Cat</button>
        </div>
      </section>}
      {activeIdentification && activeProfile && <section className="species-detail-card">
        <div className="species-card-hero">
          {preview && <img src={preview} alt="" />}
          <div>
            <div className="eyebrow">02 · Species detailed card</div>
            <h2>{activeIdentification.commonName}</h2>
            <p>{activeIdentification.scientificName}</p>
            <span className="species-confidence">{manualSpecies ? 'General species guide' : Math.round(activeIdentification.confidence * 100) + '% visual confidence'}</span>
          </div>
        </div>

        <div className="species-facts">
          {(['group','origin','lifespan','adultSize','temperament','energy','intelligence','socialNeeds','grooming','exercise','diet','training','environment'] as const).map((key) => (
            <div key={key}><small>{key.replace(/([A-Z])/g, ' $1')}</small><strong>{String(activeProfile[key] || '—')}</strong></div>
          ))}
        </div>

        <div className="species-section-grid">
          {sections.map(([title, key]) => {
            const items = Array.isArray(activeProfile[key]) ? activeProfile[key] as string[] : []
            return <article key={key}><h3>{title}</h3><ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul></article>
          })}
        </div>

        {activeIdentification.visibleTraits.length > 0 && <div className="species-evidence"><h3>What the photo shows</h3><div>{activeIdentification.visibleTraits.map((item, i) => <span key={i}>{item}</span>)}</div></div>}
        {activeIdentification.alternatives.length > 0 && <div className="species-alternatives"><strong>Other plausible identifications</strong><p>{activeIdentification.alternatives.join(' · ')}</p></div>}
        {activeIdentification.uncertainty.length > 0 && <div className="notice"><strong>Uncertainty</strong><p>{activeIdentification.uncertainty.join(' · ')}</p></div>}
        <p className="notice">PET AI provides an AI-assisted visual estimate for education and care planning. It is not a veterinary diagnosis and should not replace professional identification or medical advice.</p>
      </section>}
    </div>
  )
}
