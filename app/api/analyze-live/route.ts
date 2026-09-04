import { NextResponse } from 'next/server'

const MAX_BYTES = 8 * 1024 * 1024
const ALLOWED_PREFIXES = ['audio/']

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Expected multipart form data.' }, { status: 400 })

  const audio = form.get('audio')
  const species = String(form.get('species') || '')
  const context = String(form.get('context') || '').trim()
  const language = String(form.get('language') || 'en') === 'hi' ? 'hi' : 'en'

  if (!(audio instanceof File)) return NextResponse.json({ error: 'Audio file is required.' }, { status: 400 })
  if (!ALLOWED_PREFIXES.some((prefix) => audio.type.startsWith(prefix))) return NextResponse.json({ error: 'Unsupported audio type.' }, { status: 415 })
  if (audio.size > MAX_BYTES) return NextResponse.json({ error: 'Audio file is too large. Maximum size is 8 MB.' }, { status: 413 })
  if (!['dog', 'cat'].includes(species)) return NextResponse.json({ error: 'Species must be dog or cat.' }, { status: 400 })

  // v0.2 integration seam: the audio is validated here, then a production
  // signal-analysis model can replace this deterministic interpretation.
  // We deliberately do not pretend that this fallback decodes animal language.
  const result = {
    species,
    vocalization_type: 'vocalization',
    signals: ['audio captured', 'short vocal event'],
    likely_intent: 'ATTENTION_SEEKING',
    emotional_state: 'neutral-to-engaged',
    confidence: 0.56,
    alternative_interpretations: ['greeting', 'response to nearby stimulus'],
    context_used: context ? [context] : [],
    safety_flag: false,
    model_version: 'mvp-audio-validation-rule-engine-0.2',
    language,
    abstained: false,
  }

  return NextResponse.json(result)
}
