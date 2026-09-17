import Link from 'next/link'
import { SpeciesAnalyzer } from '@/components/species-analyzer'

export default function SpeciesPage() {
  return (
    <main className="app-page">
      <div className="container">
        <header className="nav app-nav">
          <Link href="/" className="brand brand-lockup"><span className="brand-mark" aria-hidden="true">◒</span><span>PET AI</span></Link>
          <nav className="nav-links app-nav-links">
            <Link href="/analyze">Analyze sound</Link>
            <Link className="badge" href="/history">History</Link>
          </nav>
        </header>
        <section className="hero app-hero">
          <div className="eyebrow">PET AI Species Analyzer</div>
          <h1>Know your pet from A to Z.</h1>
          <p>Take a photo. Get a visual identification estimate and a practical owner guide covering traits, care, behavior, enrichment, and what to watch for.</p>
        </section>
        <SpeciesAnalyzer />
      </div>
    </main>
  )
}
