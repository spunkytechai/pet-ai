import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { InterpretationSchema, abstain } from '@/lib/analysis'

const MAX_AUDIO_BYTES = 6 * 1024 * 1024
const MODEL_VERSION = 'mvp-rule-engine-0.2'

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Invalid multipart form data.' }, { status: 400 })

  const species = String(form.get('species') || '')
  const language = String(form.get('language') || 'en')
  const context = String(form.get('context') || '').trim()
  const petName = String(form.get('pet_name') || '').trim()
  const audio = form.get('audio')

  if (!['dog', 'cat'].includes(species)) return NextResponse.json(abstain('Dog or cat species is required before interpretation.'), { status: 400 })
  if (!['en', 'hi'].includes(language)) return NextResponse.json(abstain('Language must be en or hi.'), { status: 400 })
  if (!(audio instanceof File) || !audio.type.startsWith('audio/')) return NextResponse.json(abstain('A valid audio recording is required.'), { status: 400 })
  if (audio.size === 0 || audio.size > MAX_AUDIO_BYTES) return NextResponse.json(abstain('Audio must be larger than 0 bytes and no larger than 6 MB.'), { status: 400 })
  if (context.length > 1000 || petName.length > 80) return NextResponse.json(abstain('Pet name or context is too long.'), { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  const petId = crypto.randomUUID()
  const recordingId = crypto.randomUUID()
  const interpretationId = crypto.randomUUID()
  const extension = audio.name.includes('.') ? audio.name.split('.').pop()?.toLowerCase() : 'webm'
  const safeExtension = extension && /^[a-z0-9]+$/.test(extension) ? extension : 'webm'
  const storagePath = `${user.id}/${petId}/${recordingId}.${safeExtension}`

  const { error: petError } = await supabase.from('pets').insert({
    id: petId,
    owner_id: user.id,
    name: petName || `My ${species}`,
    species,
  })
  if (petError) return NextResponse.json({ error: 'Pet profile could not be saved.' }, { status: 500 })

  const bytes = new Uint8Array(await audio.arrayBuffer())
  const { error: uploadError } = await supabase.storage.from('pet-recordings').upload(storagePath, bytes, {
    contentType: audio.type,
    upsert: false,
  })
  if (uploadError) {
    await supabase.from('pets').delete().eq('id', petId)
    return NextResponse.json({ error: 'Audio could not be securely stored.' }, { status: 500 })
  }

  const { error: recordingError } = await supabase.from('recordings').insert({
    id: recordingId,
    pet_id: petId,
    storage_path: storagePath,
    mime_type: audio.type,
  })
  if (recordingError) {
    await supabase.storage.from('pet-recordings').remove([storagePath])
    await supabase.from('pets').delete().eq('id', petId)
    return NextResponse.json({ error: 'Recording metadata could not be saved.' }, { status: 500 })
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

  const { error: interpretationError } = await supabase.from('interpretations').insert({
    id: interpretationId,
    recording_id: recordingId,
    species: interpretation.species,
    vocalization_type: interpretation.vocalization_type,
    likely_intent: interpretation.likely_intent,
    emotional_state: interpretation.emotional_state,
    confidence: interpretation.confidence,
    alternatives: interpretation.alternative_interpretations,
    signals: interpretation.signals,
    context_used: interpretation.context_used,
    safety_flag: interpretation.safety_flag,
    model_version: interpretation.model_version,
    language: interpretation.language,
  })

  if (interpretationError) return NextResponse.json({ error: 'Interpretation could not be saved.' }, { status: 500 })
  return NextResponse.json({ id: interpretationId, pet_id: petId, recording_id: recordingId, ...interpretation })
}
