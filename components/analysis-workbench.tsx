'use client'

import { useEffect, useRef, useState } from 'react'
import { AudioRecorder } from './audio-recorder'
import { normalizeAudioForAnalysis } from './audio-utils'

type Pet = { id: string; name: string; species: 'dog' | 'cat'; age_years?: number | null }
type DemoSample = { id: string; species: 'dog' | 'cat'; title: string; description: string; sourceUrl: string; license: string; attribution: string }
type Result = { id: string; pet_id: string; pet_name: string; recording_id: string; species: string; vocalization_type: string; signals: string[]; likely_intent: string; emotional_state: string; confidence: number; alternative_interpretations: string[]; context_used: string[]; safety_flag: boolean; model_version: string; language: 'en' | 'hi'; acoustic_features?: { durationMs: number; rms: number; peak: number; zeroCrossingRate: number; dynamicRange: number; estimatedArousal: string; acousticQuality: string; voiced: boolean } | null }

const copy = {
  en: { mostLikely: 'Most likely', confidence: 'Confidence', signals: 'Signals detected', alternatives: 'Other possibilities', context: 'Context considered', safety: 'Safety note', correct: 'Correct', partly: 'Partly correct', incorrect: 'Not correct', analyze: 'Analyze sound', upload: 'Upload audio', contextLabel: 'What was happening when your pet made this sound?', pet: 'Pet', choosePet: 'Choose a pet', createPet: 'Create a pet profile', emptyPets: 'Create a pet profile first.', signIn: 'Sign in required', samples: 'Try a sample', sampleIntro: 'Explore a short public recording before using your own pet audio.', play: 'Play', useSample: 'Use for analysis', loading: 'Loading…', evidence: 'Audio evidence', duration: 'Duration', energy: 'Energy', arousal: 'Estimated arousal', quality: 'Acoustic quality', signal: 'Voiced signal' },
  hi: { mostLikely: 'सबसे संभावित अर्थ', confidence: 'विश्वास स्तर', signals: 'पहचाने गए संकेत', alternatives: 'अन्य संभावनाएँ', context: 'विचार किया गया संदर्भ', safety: 'सुरक्षा सूचना', correct: 'सही', partly: 'आंशिक रूप से सही', incorrect: 'सही नहीं', analyze: 'आवाज़ का विश्लेषण करें', upload: 'ऑडियो अपलोड करें', contextLabel: 'जब आपके पालतू ने यह आवाज़ निकाली तब क्या हो रहा था?', pet: 'पालतू', choosePet: 'पालतू चुनें', createPet: 'पालतू प्रोफ़ाइल बनाएं', emptyPets: 'पहले पालतू प्रोफ़ाइल बनाएं।', signIn: 'साइन इन आवश्यक', samples: 'एक नमूना आज़माएँ', sampleIntro: 'अपने पालतू की आवाज़ इस्तेमाल करने से पहले एक छोटा सार्वजनिक रिकॉर्डिंग नमूना सुनें।', play: 'चलाएँ', useSample: 'विश्लेषण के लिए उपयोग करें', loading: 'लोड हो रहा है…', evidence: 'ऑडियो प्रमाण', duration: 'अवधि', energy: 'ऊर्जा', arousal: 'अनुमानित उत्तेजना', quality: 'ऑडियो गुणवत्ता', signal: 'वोकल सिग्नल' },
}

export function AnalysisWorkbench() {
  const [pets, setPets] = useState<Pet[]>([])
  const [petId, setPetId] = useState('')
  const [context, setContext] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [feedback, setFeedback] = useState('')
  const [samples, setSamples] = useState<DemoSample[]>([])
  const [sampleBusy, setSampleBusy] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const t = copy[language]
  const pet = pets.find((item) => item.id === petId)

  useEffect(() => {
    fetch('/api/pets').then((r) => r.json()).then((data) => {
      if (Array.isArray(data.pets)) {
        setPets(data.pets)
        const params = new URLSearchParams(window.location.search)
        const requested = params.get('pet')
        setPetId(data.pets.some((p: Pet) => p.id === requested) ? requested! : data.pets[0]?.id ?? '')
      }
    }).catch(() => setFeedback('Pets could not be loaded.'))

    fetch('/api/demo-audio').then((r) => r.json()).then((data) => {
      if (Array.isArray(data.samples)) setSamples(data.samples)
    }).catch(() => setSamples([]))
  }, [])

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  async function acceptAudio(nextFile: File) {
    if (!nextFile.type.startsWith('audio/')) return setFeedback('Please choose an audio file.')
    if (nextFile.size > 4 * 1024 * 1024) return setFeedback('Audio must be 4 MB or smaller.')
    setFeedback('')
    try {
      const normalized = await normalizeAudioForAnalysis(nextFile)
      if (normalized.size > 4 * 1024 * 1024) return setFeedback('Converted audio is larger than 4 MB. Please use a shorter clip.')
      setFile(normalized)
      setPreview(URL.createObjectURL(normalized))
      setResult(null)
    } catch (error) { setFeedback(error instanceof Error ? error.message : 'Audio could not be prepared for analysis.') }
  }

  async function useSample(sample: DemoSample) {
    if (!petId) return setFeedback('Create a pet profile before analyzing a sample.')
    setSampleBusy(sample.id); setFeedback('')
    try {
      const response = await fetch(`/api/demo-audio/${encodeURIComponent(sample.id)}`)
      if (!response.ok) throw new Error('This demo sample is temporarily unavailable.')
      const blob = await response.blob()
      await acceptAudio(new File([blob], `${sample.id}.wav`, { type: blob.type || 'audio/wav' }))
    } catch (error) { setFeedback(error instanceof Error ? error.message : 'Sample could not be loaded.') }
    finally { setSampleBusy('') }
  }

  async function analyze() {
    if (!file || !petId) return
    setBusy(true); setFeedback('')
    const form = new FormData()
    form.append('audio', file); form.append('pet_id', petId); form.append('context', context); form.append('language', language)
    try {
      const response = await fetch('/api/analyze', { method: 'POST', body: form })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || data?.alternative_interpretations?.[0] || 'Analysis failed')
      setResult(data)
    } catch (error) { setFeedback(error instanceof Error ? error.message : 'Analysis could not be completed.') }
    finally { setBusy(false) }
  }

  async function sendFeedback(value: string) {
    if (!result) return
    const response = await fetch('/api/feedback', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ rating: value, interpretation_id: result.id }) })
    const data = await response.json().catch(() => null)
    if (!response.ok) return setFeedback(data?.error || 'Feedback could not be saved. Please try again.')
    const memory = data?.memory_updated ? ' Your pet memory was updated.' : ''
    setFeedback(`Feedback saved: ${value}.${memory}`)
  }

  return <div className="workbench">
    <div className="card">
      <div className="row-between"><div><div className="eyebrow">Pet profile</div><h2>{pet ? `${pet.name} · ${pet.species}` : t.choosePet}</h2></div><div className="language"><button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button><button className={language === 'hi' ? 'active' : ''} onClick={() => setLanguage('hi')}>हिं</button></div></div>
      {pets.length ? <label>{t.pet}<select value={petId} onChange={(e) => { setPetId(e.target.value); setResult(null) }}>{pets.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.species}</option>)}</select></label> : <p className="muted">{t.emptyPets} <a href="/pet/new">{t.createPet}</a></p>}
      <label>{t.contextLabel}<textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="e.g. I had just returned home and my dog was at the door." rows={3} /></label>
    </div>

    {samples.length > 0 && <div className="card sample-card"><div className="eyebrow">00 · Explore</div><div className="row-between sample-heading"><div><h2>{t.samples}</h2><p className="muted">{t.sampleIntro}</p></div><span className="sample-count">{samples.length} public samples</span></div><div className="sample-grid">{samples.map((sample) => <article className="sample-item" key={sample.id}><div className="sample-icon" aria-hidden="true">{sample.species === 'cat' ? '◐' : '◒'}</div><div className="sample-copy"><div className="sample-topline"><strong>{sample.title}</strong><span>{sample.species}</span></div><p>{sample.description}</p><audio controls preload="none" src={`/api/demo-audio/${encodeURIComponent(sample.id)}`} /><div className="sample-actions"><button className="secondary" type="button" onClick={() => void useSample(sample)} disabled={busy || sampleBusy !== '' || !petId}>{sampleBusy === sample.id ? t.loading : t.useSample}</button><a href={sample.sourceUrl} target="_blank" rel="noreferrer">Source · {sample.license}</a></div></div></article>)}</div></div>}

    <div className="card"><div className="eyebrow">01 · Capture</div><h2>Record or upload a pet signal</h2><div className="actions"><AudioRecorder onAudioReady={acceptAudio} disabled={busy || !petId} /><button className="secondary" type="button" onClick={() => inputRef.current?.click()} disabled={busy || !petId}>{t.upload}</button><input ref={inputRef} hidden type="file" accept="audio/*" onChange={(e) => e.target.files?.[0] && void acceptAudio(e.target.files[0])} /></div>{file && <div className="audio-preview"><strong>{file.name}</strong><span>{(file.size / 1024).toFixed(0)} KB</span>{preview && <audio controls src={preview} />}</div>}<p className="muted">Audio is normalized to MP3/WAV-compatible analysis input before secure owner-scoped storage.</p></div>

    <div className="card"><div className="eyebrow">02 · Interpret</div><h2>Analyze the signal</h2><p className="muted">PET AI provides a probabilistic interpretation, not a literal translation.</p><button className="primary" onClick={analyze} disabled={!file || !petId || busy}>{busy ? 'Analyzing…' : t.analyze}</button></div>

    {result && <div className="result-card"><div className="eyebrow">03 · PET AI interpretation</div><div className="row-between"><div><span className="result-label">{t.mostLikely}</span><h2>{result.likely_intent}</h2></div><div className="confidence">{Math.round(result.confidence * 100)}%<small>{t.confidence}</small></div></div><p className="emotion">{result.emotional_state}</p>{result.acoustic_features && <div className="evidence-panel"><div className="eyebrow">{t.evidence}</div><div className="evidence-grid"><div><small>{t.duration}</small><strong>{(result.acoustic_features.durationMs / 1000).toFixed(1)}s</strong></div><div><small>{t.energy}</small><strong>{Math.round(result.acoustic_features.rms * 100)}%</strong></div><div><small>{t.arousal}</small><strong>{result.acoustic_features.estimatedArousal}</strong></div><div><small>{t.quality}</small><strong>{result.acoustic_features.acousticQuality}</strong></div><div><small>{t.signal}</small><strong>{result.acoustic_features.voiced ? 'Detected' : 'Weak'}</strong></div></div><p className="microcopy">These are acoustic measurements, not proof of emotion or intent.</p></div>}<div className="result-grid"><div><strong>{t.signals}</strong><p>{result.signals.join(' · ') || 'Insufficient signal evidence'}</p></div><div><strong>{t.alternatives}</strong><p>{result.alternative_interpretations.join(' · ') || 'None'}</p></div><div><strong>{t.context}</strong><p>{result.context_used.join(' · ') || 'No context supplied'}</p></div></div>{result.safety_flag && <div className="safety"><strong>{t.safety}</strong><p>Persistent, unusual, or severe distress should be assessed by a qualified veterinarian.</p></div>}<p className="notice">AI-assisted interpretation only. Not literal pet-language translation and not a veterinary diagnosis. Model: {result.model_version}</p><div className="feedback"><span>Was this useful?</span><button onClick={() => sendFeedback('correct')}>{t.correct}</button><button onClick={() => sendFeedback('partly')}>{t.partly}</button><button onClick={() => sendFeedback('incorrect')}>{t.incorrect}</button></div>{feedback && <p className="muted">{feedback}</p>}</div>}
  </div>
}
