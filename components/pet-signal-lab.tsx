'use client'

import { useState } from 'react'
import { AudioRecorder } from './audio-recorder'

export function PetSignalLab() {
  const [species, setSpecies] = useState('dog')
  const [context, setContext] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [feedback, setFeedback] = useState('')

  const ready = (next: File) => { setFile(next); setResult(null); setFeedback('') }
  const analyze = async () => {
    if (!file) return
    setBusy(true)
    const body = new FormData()
    body.append('audio', file); body.append('species', species); body.append('context', context); body.append('language', language)
    try { const r = await fetch('/api/analyze-live', { method: 'POST', body }); setResult(await r.json()) } finally { setBusy(false) }
  }
  const sendFeedback = async (rating: string) => { setFeedback(rating); await fetch('/api/feedback', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ rating, interpretation: result }) }).catch(() => {}) }

  return <div className="workbench">
    <div className="card"><div className="row-between"><div><div className="eyebrow">01 · Context</div><h2>About this pet signal</h2></div><div className="language"><button onClick={() => setLanguage('en')} className={language==='en'?'active':''}>EN</button><button onClick={() => setLanguage('hi')} className={language==='hi'?'active':''}>हिं</button></div></div>
      <div className="form-grid"><label>Species<select value={species} onChange={e => setSpecies(e.target.value)}><option value="dog">Dog</option><option value="cat">Cat</option></select></label><label>Situation<input value={context} onChange={e => setContext(e.target.value)} placeholder="At the door, during play, alone, etc." /></label></div>
    </div>
    <div className="card"><div className="eyebrow">02 · Capture</div><h2>Record or upload</h2><div className="actions"><AudioRecorder onAudioReady={ready} disabled={busy}/><label className="secondary">Upload audio<input hidden type="file" accept="audio/*" onChange={e => e.target.files?.[0] && ready(e.target.files[0])}/></label></div>{file && <div className="audio-preview"><strong>{file.name}</strong><span>{Math.ceil(file.size/1024)} KB</span></div>}<p className="muted">Audio is validated before interpretation. The current engine is a deterministic MVP placeholder, not a trained pet-language model.</p></div>
    <div className="card"><div className="eyebrow">03 · Analyze</div><h2>What might your pet be expressing?</h2><button className="primary" disabled={!file || busy} onClick={analyze}>{busy ? 'Analyzing…' : language === 'hi' ? 'आवाज़ का विश्लेषण करें' : 'Analyze pet signal'}</button></div>
    {result && <div className="result-card"><div className="eyebrow">04 · Interpretation</div><div className="row-between"><div><span className="result-label">{language === 'hi' ? 'सबसे संभावित अर्थ' : 'Most likely'}</span><h2>{result.likely_intent}</h2><p className="emotion">{result.emotional_state}</p></div><div className="confidence">{Math.round((result.confidence || 0)*100)}%<small>confidence</small></div></div><div className="result-grid"><div><strong>Signals</strong><p>{result.signals?.join(' · ')}</p></div><div><strong>Alternatives</strong><p>{result.alternative_interpretations?.join(' · ')}</p></div><div><strong>Context</strong><p>{result.context_used?.join(' · ') || 'None supplied'}</p></div></div><p className="notice">AI-assisted, probabilistic interpretation only. Not literal translation and not a veterinary diagnosis. Model: {result.model_version}</p><div className="feedback"><span>Was this useful?</span><button onClick={() => sendFeedback('correct')}>Correct</button><button onClick={() => sendFeedback('partly')}>Partly</button><button onClick={() => sendFeedback('incorrect')}>Not correct</button></div>{feedback && <p className="muted">Feedback: {feedback}</p>}</div>}
  </div>
}
