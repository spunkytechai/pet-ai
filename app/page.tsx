import Link from 'next/link'
import { PetVisual } from '@/components/pet-visual'

const features = [
  { icon: '◉', title: 'Audio Analysis', text: 'Record or upload a dog or cat vocalization and get a cautious, evidence-based interpretation.' },
  { icon: '◌', title: 'Species Analyzer', text: 'Use a photo for supported visual guidance, with uncertainty made explicit.' },
  { icon: '⌂', title: 'Pet Profiles', text: 'Keep each pet’s context, language, and recurring signals connected.' },
  { icon: '◷', title: 'Pet Memory', text: 'Review history, patterns, owner feedback, and changes over time.' },
  { icon: '✓', title: 'Safe & Responsible', text: 'No diagnosis claims. PET AI shows uncertainty and recommends professional care when appropriate.' },
]

export default function Home() {
  return (
    <main className="landing landing-v2">
      <div className="container landing-shell">
        <header className="landing-nav-v2">
          <Link href="/" className="brand landing-brand" aria-label="PET AI home">
            <span className="brand-mark brand-mark-paw" aria-hidden="true">✣</span>
            <span><strong>PET AI</strong><small>Understand better.</small></span>
          </Link>

          <nav className="landing-main-nav" aria-label="Main navigation">
            <a className="active" href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#about">About</a>
          </nav>

          <div className="landing-nav-actions">
            <button className="language-pill" type="button" aria-label="Language">EN <span>⌄</span></button>
            <Link className="landing-signin" href="/login">Sign in</Link>
            <Link className="primary landing-start" href="/signup">Get Started</Link>
          </div>
        </header>

        <section id="home" className="landing-hero-v2">
          <div className="hero-copy-v2">
            <div className="landing-kicker"><span className="live-dot" /> AI-assisted pet understanding</div>
            <h1>Because<br />They Have<br />A Lot to Say</h1>
            <div className="hero-accent" aria-hidden="true" />
            <p className="hero-lede-v2">AI-powered insights into your pet’s sounds, behavior and emotions.</p>
            <p className="hero-subline">Not a translator. A better way to understand.</p>

            <div className="hero-actions-v2">
              <Link className="primary hero-cta-v2" href="/signup">Get Started Free <span>→</span></Link>
              <a className="secondary hero-video" href="#how-it-works"><span className="play-dot">▶</span> See how it works</a>
            </div>

            <div className="hero-trust-v2">
              <span>✣ For dog &amp; cat parents</span>
              <span>♢ Secure &amp; private</span>
              <span>◈ No paid APIs</span>
              <span>◎ English &amp; Hindi</span>
            </div>
          </div>

          <div className="hero-stage-v2" aria-label="PET AI product preview">
            <div className="hero-note hero-note-one">“Woof?<br />Play?<br />Hungry?”</div>
            <div className="hero-note hero-note-two">“Meow?<br />Happy?<br />Comfort?”</div>
            <div className="hero-quote">“Same love.<br /><em>A deeper understanding.</em>” ♡</div>

            <div className="hero-pet hero-pet-dog"><PetVisual species="dog" size="lg" label="Dog illustration" /></div>
            <div className="hero-pet hero-pet-cat"><PetVisual species="cat" size="md" label="Cat illustration" /></div>

            <div className="phone-mockup" aria-hidden="true">
              <div className="phone-notch" />
              <div className="phone-brand">✣ <strong>PET AI</strong></div>
              <div className="phone-recording">Recording<span>...</span></div>
              <div className="phone-wave"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
              <div className="phone-mic">●</div>
              <strong className="phone-time">00:12</strong>
              <small>Listening to your pet...</small>
            </div>

            <div className="interpretation-popover">
              <div className="popover-avatar">🐶</div>
              <div>
                <strong>Your pet may be excited!</strong>
                <span>✓ High energy vocalization</span>
                <span>✓ Possible play behavior</span>
                <small>Confidence: 78%</small>
              </div>
              <span className="popover-arrow">→</span>
            </div>
          </div>
        </section>

        <section className="landing-stats" aria-label="PET AI capabilities">
          <div><strong>2</strong><span>Species</span></div>
          <div><strong>Local</strong><span>Acoustic signal analysis</span></div>
          <div><strong>2</strong><span>Languages (EN / HI)</span></div>
          <div><strong>100%</strong><span>Private history</span></div>
          <div><strong>∞</strong><span>Deeper bond</span></div>
        </section>

        <section id="features" className="landing-feature-section">
          <div className="landing-section-title">
            <div><span className="eyebrow">Everything in one place</span><h2>Everything You Need<br />to Understand Better</h2></div>
            <p>Powerful tools designed for modern pet parents.</p>
          </div>
          <div className="feature-grid-v2">
            {features.map((feature) => (
              <article className="feature-card-v2" key={feature.title}>
                <span className="feature-icon-v2">{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="understanding-section">
          <div className="understanding-visual">
            <div className="dashboard-phone">
              <div className="mini-notch" />
              <div className="mini-brand">✣ PET AI</div>
              <div className="mini-profile"><PetVisual species="dog" size="sm" /><div><strong>Bruno</strong><small>Golden Retriever</small></div></div>
              <div className="mini-menu"><span>◉ New Analysis</span><span>◷ History</span><span>▥ Insights</span><span>♡ Care Tips</span><span>⚙ Settings</span></div>
            </div>
            <div className="photo-card-v2"><PetVisual species="dog" size="md" label="Dog illustration" /><p>“He may not speak<br />our language, but<br />he speaks to our hearts.”</p><span>♡</span></div>
          </div>
          <div className="understanding-copy">
            <span className="eyebrow">Built for a happier, healthier tomorrow</span>
            <h2>Understand more.<br />Respond better.</h2>
            <p>Whether it’s a bark, a meow, or a curious sound — PET AI helps you understand what your pet may be feeling, so you can respond with more care, confidence and love.</p>
            <ul>
              <li>Understand behavior and emotional signals</li>
              <li>Track changes and recurring patterns</li>
              <li>Get personalized insights over time</li>
              <li>Available in English &amp; Hindi</li>
              <li>No paid AI APIs — local-first intelligence</li>
              <li>Your pet data stays private</li>
            </ul>
            <Link className="primary landing-start" href="/signup">Get Started Free <span>→</span></Link>
          </div>
        </section>

        <section id="pricing" className="simple-cta-section">
          <div>
            <span className="eyebrow">Start understanding today</span>
            <h2>Your pet is already talking.<br />Start listening.</h2>
            <p>Create your pet profile and explore PET AI’s analysis workflow.</p>
          </div>
          <div className="simple-cta-actions">
            <Link className="primary landing-start" href="/signup">Create Free Account <span>→</span></Link>
            <Link className="secondary" href="/login">Sign in</Link>
          </div>
        </section>

        <section id="about" className="landing-safety-v2">
          <div className="safety-mark">i</div>
          <div><strong>Useful, not overconfident.</strong><p>PET AI does not claim to literally translate animal language or diagnose medical conditions. Persistent, unusual, or severe distress should be assessed by a qualified veterinarian.</p></div>
        </section>

        <footer className="landing-footer-v2">
          <div className="footer-brand"><span className="brand-mark brand-mark-paw">✣</span><strong>PET AI</strong><small>Understand better.</small></div>
          <nav><a href="#about">About</a><a href="#about">Privacy</a><a href="#about">Terms</a><a href="#about">Support</a><a href="#how-it-works">How It Works</a></nav>
          <div className="footer-social"><span>𝕏</span><span>◎</span><span>▶</span><span>in</span><small>A Spunky Tech Product</small></div>
        </footer>
      </div>
    </main>
  )
}
