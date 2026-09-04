'use client'

import { useRef, useState } from 'react'
import { AudioRecorder } from './audio-recorder'

type Result = {
  species: string
  vocalization_type: string
  signals: string[]
  likely_intent: string
  emotional_state: string
  confidence: number
  alternative_interpretations: string[]
  context_used: string[]
  safety_flag: boolean
  model_version: string
  language: 'en' | 'hi'
  abstained?: boolean
  abstention_reason?: string
}

const copy = {
  en: { mostLikely: 'Most likely', confidence: 'Confidence', signals: 'Signals detected', alternatives: 'Other possibilities', context: 'Context considered', safety: 'Safety note', correct: 'Correct', partly: 'Partly correct', incorrect: 'Not correct', analyze: 'Analyze sound', upload: 'Upload audio', contextLabel: 'What was happening when your pet made this sound?', petName: 'Pet name', species: 'Species' },
  hi: { mostLikely: 'सबसे संभावित अर्थ', confidence: 'विश्वास स्तर', signals: 'पहचाने गए संकेत', alternatives: 'अन्य संभावनाएँ', context: 'विचार किया गया संदर्भ', safety: 'सुरक्षा सूचना', correct: 'सही', partly: 'आंशिक रूप से सही', incorrect: 'सही नहीं', analyze: 'आवाज़ का विश्लेषण करें', upload: 'ऑडियो अपलोड करें', contextLabel: 'जब आपके पालतू ने यह आवाज़ निकाली तब क्या हो रहा था?', petName: 'पालतू का नाम', species: 'प्रजाति' },
}

export function AnalysisWorkbench() {
  const [petName, setPetName] = useState('')
  const [species, setSpecies] = useState('dog')
  const [context, setContext] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [feedback, setFeedback] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const t = copy[language]

  function acceptAudio(nextFile: File) {
    setFile(nextFile)
    setPreview(URL.createObjectURL(nextFile))
    setResult(null)
    setFeedback('')
  }

  async function analyze() {
    if (!file) return
    setBusy(true)
    setFeedback('')
    const form = new FormData()
    form.append('audio', file)
    form.append('species', species)
    form.append('pet_name', petName)
    form.append('context', context)
    form.append('language', language)
    try {
      const response = await fetch('/api/analyze', { method: 'POST', body: form })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.alternative_interpretations?.[0] || 'Analysis failed')
      setResult(data)
    } catch {
      setFeedback('Analysis could not be completed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function sendFeedback(value: string) {
    setFeedback(value)
    await fetch('/api/feedback', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ rating: value, interpretation: result, pet_name: petName }) }).catch(() => {})
  }

  return (
    <div className="workbench">
      <div className="card">
        <div className="row-between"><div><div className="eyebrow">Pet profile</div><h2>Tell PET AI about your pet</h2></div><div className="language"><button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button><button className={language === 'hi' ? 'active' : ''} onClick={() => setLanguage('hi')}>हिं</button></div></div>
        <div className="form-grid">
          <label>{t.petName}<input value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="e.g. Bruno" /></label>
          <label>{t.species}<select value={species} onChange={(e) => setSpecies(e.target.value)}><option value="dog">Dog</option><option value="cat">Cat</option></select></label>
        </div>
        <label>{t.contextLabel}<textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="e.g. I had just returned home and my dog was at the door." rows={3} /></label>
      </div>

      <div className="card">
        <div className="eyebrow">01 · Capture</div><h2>Record or upload a pet signal</h2>
        <div className="actions"><AudioRecorder onAudioReady={acceptAudio} disabled={busy} /><button className="secondary" type="button" onClick={() => inputRef.current?.click()} disabled={busy}>{t.upload}</button><input ref={inputRef} hidden type="file" accept="audio/*" onChange={(e) => e.target.files?.[0] && acceptAudio(e.target.files[0])} /></div>
        {file && <div className="audio-preview"><strong>{file.name}</strong><span>{(file.size / 1024).toFixed(0)} KB</span>{preview && <audio controls src={preview} />}</div>}
        <p className="muted">Your browser records using the MediaRecorder API; supported browsers can capture a microphone stream and return it as an audio Blob for processing.</p>
      </div>

      <div className="card"><div className="eyebrow">02 · Interpret</div><h2>Analyze the signal</h2><p className="muted">PET AI will return a probabilistic interpretation, not a literal translation.</p><button className="primary" onClick={analyze} disabled={!file || busy}>{busy ? 'Analyzing…' : t.analyze}</button></div>

      {result && <div className="result-card"><div className="eyebrow">03 · PET AI interpretation</div><div className="row-between"><div><span className="result-label">{t.mostLikely}</span><h2>{result.likely_intent}</h2></div><div className="confidence">{Math.round(result.confidence * 100)}%<small>{t.confidence}</small></div></div><p className="emotion">{result.emotional_state}</p><div className="result-grid"><div><strong>{t.signals}</strong><p>{result.signals.join(' · ') || 'Insufficient signal evidence'}</p></div><div><strong>{t.alternatives}</strong><p>{result.alternative_interpretations.join(' · ') || 'None'}</p></div><div><strong>{t.context}</strong><p>{result.context_used.join(' · ') || 'No context supplied'}</p></div></div>{result.safety_flag && <div className="safety"><strong>{t.safety}</strong><p>Persistent, unusual, or severe distress should be assessed by a qualified veterinarian.</p></div>}<p className="notice">AI-assisted interpretation only. This is not literal pet-language translation and not a veterinary diagnosis. Model: {result.model_version}</p><div className="feedback"><span>Was this useful?</span><button onClick={() => sendFeedback('correct')}>{t.correct}</button><button onClick={() => sendFeedback('partly')}>{t.partly}</button><button onClick={() => sendFeedback('incorrect')}>{t.incorrect}</button></div>{feedback && <p className="muted">Feedback recorded: {feedback}</p>}</div>}
    </div>
  )
}
