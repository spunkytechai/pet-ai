import { NextResponse } from 'next/server'
import { abstain } from '@/lib/analysis'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  if (!body.species) return NextResponse.json(abstain('Species is required before interpretation.'), {status:200})
  return NextResponse.json({species:body.species,vocalization_type:'vocalization',signals:['short vocal event'],likely_intent:'ATTENTION_SEEKING',emotional_state:'neutral-to-engaged',confidence:0.56,alternative_interpretations:['greeting','response to nearby stimulus'],context_used:[body.context||'none'],safety_flag:false,model_version:'mvp-rule-engine-0.1',language:'en'})
}
