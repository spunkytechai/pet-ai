import { PetSignalLab } from '@/components/pet-signal-lab'

export default function RecordPage() {
  return <main><div className="container"><header className="nav"><div className="brand">PET AI</div><div className="badge">Private Beta · v0.2</div></header><section className="hero"><div className="eyebrow">Pet signal lab</div><h1>Record a sound. Add context. Explore what it may mean.</h1><p>PET AI combines the captured signal with context and returns an uncertain, evidence-based hypothesis. It does not claim literal pet-language translation.</p></section><PetSignalLab /><footer className="notice">PET AI is an AI-assisted communication aid, not a veterinary diagnostic service. Persistent, unusual, or severe distress should be assessed by a qualified veterinarian.</footer></div></main>
}
