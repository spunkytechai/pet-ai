import { AnalysisWorkbench } from '@/components/analysis-workbench'

export default function AnalyzePage() {
  return <main><div className="container"><header className="nav"><div className="brand">PET AI</div><div className="badge">Step 2 · Analyze</div></header><section className="hero"><div className="eyebrow">Sound analysis</div><h1>What might this sound mean?</h1><p>Record or upload a real pet vocalization, add context, and receive a probabilistic interpretation with confidence and alternatives.</p></section><AnalysisWorkbench /></div></main>
}
