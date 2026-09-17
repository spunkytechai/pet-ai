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

  return (
    <div className="species-analyzer">
      <section className="card species-upload-card">
        <div className="eyebrow">01 · Identify</div>
        <h2>Show us your pet</h2>
        <p className="muted">Click a photo or upload one. PET AI will estimate the species and, when evidence allows, the likely breed/type.</p>
        <input ref={inputRef} hidden type="file" accept="image/*" capture="environment" onChange={(e) => e.target.files?.[0] && selectImage(e.target.files[0])} />
        <button className="primary" onClick={() => inputRef.current?.click()}>{file ? 'Change photo' : 'Click a photo / upload'}</button>
        {preview && <div className="species-preview"><img src={preview} alt="Selected pet" /></div>}
        {file && <div className="species-file"><strong>{file.name}</strong><span>{Math.ceil(file.size / 1024)} KB</span></div>}
        <button className="secondary species-identify" disabled={!file || busy} onClick={identify}>{busy ? 'Analyzing photo…' : 'Identify this pet →'}</button>
        <p className="microcopy">Identification is probabilistic. A photo cannot establish health, pedigree, exact age, or sex.</p>
      </section>

      {result?.error && <div className="card safety"><strong>Species analysis unavailable</strong><p>{result.error}</p></div>}

      {identification && profile && <section className="species-detail-card">
        <div className="species-card-hero">
          {preview && <img src={preview} alt="" />}
          <div>
            <div className="eyebrow">02 · Species detailed card</div>
            <h2>{identification.commonName}</h2>
            <p>{identification.scientificName}</p>
            <span className="species-confidence">{Math.round(identification.confidence * 100)}% visual confidence</span>
          </div>
        </div>

        <div className="species-facts">
          {(['group','origin','lifespan','adultSize','temperament','energy','intelligence','socialNeeds','grooming','exercise','diet','training','environment'] as const).map((key) => (
            <div key={key}><small>{key.replace(/([A-Z])/g, ' $1')}</small><strong>{String(profile[key] || '—')}</strong></div>
          ))}
        </div>

        <div className="species-section-grid">
          {sections.map(([title, key]) => {
            const items = Array.isArray(profile[key]) ? profile[key] as string[] : []
            return <article key={key}><h3>{title}</h3><ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul></article>
          })}
        </div>

        {identification.visibleTraits.length > 0 && <div className="species-evidence"><h3>What the photo shows</h3><div>{identification.visibleTraits.map((item, i) => <span key={i}>{item}</span>)}</div></div>}
        {identification.alternatives.length > 0 && <div className="species-alternatives"><strong>Other plausible identifications</strong><p>{identification.alternatives.join(' · ')}</p></div>}
        {identification.uncertainty.length > 0 && <div className="notice"><strong>Uncertainty</strong><p>{identification.uncertainty.join(' · ')}</p></div>}
        <p className="notice">PET AI provides an AI-assisted visual estimate for education and care planning. It is not a veterinary diagnosis and should not replace professional identification or medical advice.</p>
      </section>}
    </div>
  )
}
