import { SpeciesAnalyzer } from '@/components/species-analyzer'
import { AppNav } from '@/components/app-nav'

export default function SpeciesPage() {
  return (
    <main className="app-page">
      <div className="container">
        <AppNav />
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
