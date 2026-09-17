import { AnalysisWorkbench } from '@/components/analysis-workbench'
import { AppNav } from '@/components/app-nav'

export default function AnalyzePage() {
  return (
    <main className="app-page">
      <div className="container">
        <AppNav />
        <div className="progress-strip"><span className="progress-active" /> <span /> <span /> <b>Listen</b><em>Interpret</em><em>Learn</em></div>
        <section className="hero app-hero">
          <div className="eyebrow">Your pet's signal</div>
          <h1>What might they be trying to tell you?</h1>
          <p>Choose your pet, capture the moment, and let PET AI build a careful hypothesis from sound + context.</p>
        </section>
        <AnalysisWorkbench />
      </div>
    </main>
  )
}
