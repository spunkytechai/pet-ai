import { NextResponse } from 'next/server'
import { InterpretationSchema, abstain } from '@/lib/analysis'

const MAX_AUDIO_BYTES = 6 * 1024 * 1024
const MODEL_VERSION = 'mvp-rule-engine-0.2'

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  if (!form) return NextResponse.json(abstain('Invalid multipart form data.'), { status: 400 })

  const species = String(form.get('species') || '')
  const language = String(form.get('language') || 'en')
  const context = String(form.get('context') || '').trim()
  const petName = String(form.get('pet_name') || '').trim()
  const audio = form.get('audio')

  if (!['dog', 'cat'].includes(species)) {
    return NextResponse.json(abstain('Dog or cat species is required before interpretation.'), { status: 400 })
  }
  if (!['en', 'hi'].includes(language)) {
    return NextResponse.json(abstain('Language must be en or hi.'), { status: 400 })
  }
  if (!(audio instanceof File) || !audio.type.startsWith('audio/')) {
    return NextResponse.json(abstain('A valid audio recording is required.'), { status: 400 })
  }
  if (audio.size === 0 || audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json(abstain('Audio must be larger than 0 bytes and no larger than 6 MB.'), { status: 400 })
  }
  if (context.length > 1000 || petName.length > 80) {
    return NextResponse.json(abstain('Pet name or context is too long.'), { status: 400 })
  }

  const interpretation = InterpretationSchema.parse({
    species,
    vocalization_type: 'vocalization',
    signals: ['short vocal event'],
    likely_intent: 'ATTENTION_SEEKING',
    emotional_state: 'neutral-to-engaged',
    confidence: 0.56,
    alternative_interpretations: ['greeting', 'response to nearby stimulus'],
    context_used: [context || 'none'],
    safety_flag: false,
    model_version: MODEL_VERSION,
    language,
  })

  return NextResponse.json(interpretation)
}
