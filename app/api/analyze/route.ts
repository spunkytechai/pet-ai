import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { abstain } from '@/lib/analysis'
import { interpretDeterministically } from '@/lib/ai/deterministic-interpreter'
import { getLocalAudioModel } from '@/lib/ai/local-model'
import { extractWavFeatures } from '@/lib/ai/audio-features'
import type { Interpretation } from '@/lib/analysis'

const MAX_AUDIO_BYTES = 4 * 1024 * 1024

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Invalid multipart form data.' }, { status: 400 })

  const petId = String(form.get('pet_id') || '')
  const language = String(form.get('language') || 'en')
  const context = String(form.get('context') || '').trim()
  const audio = form.get('audio')

  if (!petId) return NextResponse.json(abstain('A pet profile is required before interpretation.'), { status: 400 })
  if (!['en', 'hi'].includes(language)) return NextResponse.json(abstain('Language must be en or hi.'), { status: 400 })
  if (!(audio instanceof File) || !audio.type.startsWith('audio/')) return NextResponse.json(abstain('A valid audio recording is required.'), { status: 400 })
  if (audio.size === 0 || audio.size > MAX_AUDIO_BYTES) return NextResponse.json(abstain('Audio must be larger than 0 bytes and no larger than 4 MB.'), { status: 400 })
  if (context.length > 1000) return NextResponse.json(abstain('Context is too long.'), { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  const { data: pet, error: petLookupError } = await supabase.from('pets').select('id,name,species').eq('id', petId).single()
  if (petLookupError || !pet) return NextResponse.json({ error: 'Pet profile not found.' }, { status: 404 })

  const recordingId = crypto.randomUUID()
  const interpretationId = crypto.randomUUID()
  const extension = audio.name.includes('.') ? audio.name.split('.').pop()?.toLowerCase() : 'webm'
  const safeExtension = extension && /^[a-z0-9]+$/.test(extension) ? extension : 'webm'
  const storagePath = user.id + '/' + pet.id + '/' + recordingId + '.' + safeExtension
  const bytes = new Uint8Array(await audio.arrayBuffer())

  const { error: uploadError } = await supabase.storage.from('pet-recordings').upload(storagePath, bytes, { contentType: audio.type, upsert: false })
  if (uploadError) return NextResponse.json({ error: 'Audio could not be securely stored.' }, { status: 500 })

  const { error: recordingError } = await supabase.from('recordings').insert({ id: recordingId, pet_id: pet.id, storage_path: storagePath, mime_type: audio.type })
  if (recordingError) {
    await supabase.storage.from('pet-recordings').remove([storagePath])
    return NextResponse.json({ error: 'Recording metadata could not be saved.' }, { status: 500 })
  }

  const features = extractWavFeatures(bytes)
  const localModel = getLocalAudioModel()
  let modelInterpretation: Interpretation | null = null
  if (localModel) {
    try {
      modelInterpretation = await Promise.resolve(localModel.analyze({
        species: pet.species as 'dog' | 'cat',
        context,
        language: language as 'en' | 'hi',
        audio: bytes,
        features,
      }))
    } catch {
      modelInterpretation = null
    }
  }
  const interpretation = modelInterpretation || interpretDeterministically({
    species: pet.species as 'dog' | 'cat',
    context,
    language: language as 'en' | 'hi',
    audioBytes: audio.size,
    audioMime: audio.type,
    features,
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

  if (interpretationError) {
    await supabase.storage.from('pet-recordings').remove([storagePath])
    await supabase.from('recordings').delete().eq('id', recordingId)
    return NextResponse.json({ error: 'Interpretation could not be saved.' }, { status: 500 })
  }

  return NextResponse.json({
    id: interpretationId,
    pet_id: pet.id,
    pet_name: pet.name,
    recording_id: recordingId,
    ...interpretation,
    acoustic_features: features ? {
      durationMs: features.durationMs,
      rms: features.rms,
      peak: features.peak,
      zeroCrossingRate: features.zeroCrossingRate,
      dynamicRange: features.dynamicRange,
      crestFactor: features.crestFactor,
      spectralCentroidHz: features.spectralCentroidHz,
      estimatedArousal: features.estimatedArousal,
      acousticQuality: features.acousticQuality,
      voiced: features.voiced,
    } : null,
  })
}
