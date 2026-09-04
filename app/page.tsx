import Link from 'next/link'

export default function Home() {
  return (
    <main className="landing">
      <div className="container landing-shell">
        <header className="nav landing-nav">
          <Link href="/" className="brand brand-lockup" aria-label="PET AI home">
            <span className="brand-mark" aria-hidden="true">◒</span>
            <span>PET AI</span>
          </Link>
          <nav className="nav-links">
            <Link href="/login">Sign in</Link>
            <Link className="secondary small" href="/signup">Create account</Link>
          </nav>
        </header>

        <section className="landing-hero">
          <div className="hero-copy">
            <div className="eyebrow landing-eyebrow"><span className="live-dot" /> AI-assisted pet communication</div>
            <h1>Understand the little things your pet is trying to tell you.</h1>
            <p className="hero-lede">Record a sound. Tell us what was happening. PET AI turns those signals into a thoughtful, probabilistic interpretation — personalized over time to your pet.</p>
            <div className="actions hero-actions">
              <Link className="primary hero-cta" href="/signup">Start with my pet <span>→</span></Link>
              <Link className="secondary hero-secondary" href="/login">I already have an account</Link>
            </div>
            <div className="trust-row">
              <span>Dog + cat</span><i />
              <span>English + Hindi</span><i />
              <span>Built around uncertainty</span>
            </div>
          </div>

          <div className="pet-product-card" aria-label="Example PET AI interpretation">
            <div className="product-glow" />
            <div className="pet-card-top">
              <div>
                <span className="tiny-label">TODAY WITH</span>
                <strong>Bruno</strong>
              </div>
              <span className="status-pill"><span className="status-dot" /> Ready</span>
            </div>
            <div className="pet-avatar" aria-hidden="true">
              <div className="avatar-ear left" />
              <div className="avatar-ear right" />
              <div className="avatar-face"><span className="eye left-eye" /><span className="eye right-eye" /><span className="nose" /></div>
            </div>
            <div className="listening-card">
              <div className="wave" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
              <div className="listening-copy"><span className="tiny-label">LAST SIGNAL</span><strong>Bruno may be asking for attention</strong><small>Confidence 78% · 14:32</small></div>
            </div>
            <div className="product-actions"><span className="mini-chip">Attention seeking</span><span className="mini-chip">Engaged</span><Link href="/signup" className="round-arrow">→</Link></div>
          </div>
        </section>

        <section className="how-section">
          <div className="section-heading"><div><div className="eyebrow">A simpler way to understand them</div><h2>From sound to a useful hypothesis.</h2></div><p>PET AI keeps the experience simple while keeping the science honest.</p></div>
          <div className="product-steps">
            <article className="product-step"><span className="step-icon">01</span><div><h3>Capture the moment</h3><p>Record a vocalization or upload one. Add a little context about what was happening.</p></div></article>
            <article className="product-step featured-step"><span className="step-icon">02</span><div><h3>See what it may mean</h3><p>Audio signals and context become ranked hypotheses, confidence, alternatives, and evidence.</p></div><div className="hypothesis-pill">Likely intent <strong>Attention</strong></div></article>
            <article className="product-step"><span className="step-icon">03</span><div><h3>Teach it about your pet</h3><p>Your feedback helps PET AI recognize recurring patterns without turning guesses into facts.</p></div></article>
          </div>
        </section>

        <section className="memory-section">
          <div className="memory-card">
            <div className="memory-copy"><div className="eyebrow">Your pet, not a generic model</div><h2>PET AI gets more useful as you use it.</h2><p>Patterns stay connected to your pet: what happened, what PET AI predicted, and what you confirmed. Over time, that creates a more personal interaction history.</p><Link href="/signup" className="text-link">Create Bruno's profile <span>→</span></Link></div>
            <div className="memory-timeline">
              <div className="memory-line" />
              <div className="memory-event"><span className="memory-dot" /><div><small>Today</small><strong>Attention-seeking pattern</strong><p>3 similar evening signals</p></div></div>
              <div className="memory-event"><span className="memory-dot" /><div><small>Yesterday</small><strong>Greeting pattern</strong><p>Confirmed by you</p></div></div>
              <div className="memory-event"><span className="memory-dot" /><div><small>Earlier</small><strong>New pet profile</strong><p>Bruno joined PET AI</p></div></div>
            </div>
          </div>
        </section>

        <section className="safety-section">
          <div className="safety-mark">i</div>
          <div><strong>Useful, not overconfident.</strong><p>PET AI does not claim to literally translate animal language or diagnose medical conditions. Persistent, unusual, or severe distress should be assessed by a qualified veterinarian.</p></div>
        </section>

        <footer className="landing-footer"><span>PET AI</span><span>AI-assisted · probabilistic · pet-specific</span></footer>
      </div>
    </main>
  )
}
