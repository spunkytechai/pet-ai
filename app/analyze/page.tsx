import Link from 'next/link'
import { AnalysisWorkbench } from '@/components/analysis-workbench'

export default function AnalyzePage() {
  return (
    <main className="app-page">
      <div className="container">
        <header className="nav app-nav">
          <Link href="/" className="brand brand-lockup"><span className="brand-mark" aria-hidden="true">◒</span><span>PET AI</span></Link>
          <nav className="nav-links app-nav-links">
            <Link href="/species">Species</Link><Link href="/history">History</Link>
            <Link className="badge" href="/pet/new">+ Add pet</Link>
          </nav>
        </header>
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
