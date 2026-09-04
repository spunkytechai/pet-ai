import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ratings = new Set(['correct', 'partly', 'incorrect'])

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || !ratings.has(body.rating) || !body.interpretation_id) {
    return NextResponse.json({ error: 'Rating and interpretation_id are required.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  const { data: interpretation } = await supabase.from('interpretations').select('id,recording_id,likely_intent,confidence').eq('id', body.interpretation_id).single()
  if (!interpretation) return NextResponse.json({ error: 'Interpretation not found.' }, { status: 404 })

  const { data: recording } = await supabase.from('recordings').select('pet_id').eq('id', interpretation.recording_id).single()
  if (!recording) return NextResponse.json({ error: 'Recording not found.' }, { status: 404 })

  const { data: feedback, error } = await supabase.from('feedback').insert({
    interpretation_id: interpretation.id,
    label: body.rating,
    note: typeof body.note === 'string' ? body.note.slice(0, 1000) : null,
  }).select('id,label,created_at').single()
  if (error) return NextResponse.json({ error: 'Feedback could not be saved.' }, { status: 500 })

  await supabase.from('ai_evaluations').insert({
    interpretation_id: interpretation.id,
    predicted_label: interpretation.likely_intent,
    confidence: interpretation.confidence,
    feedback_label: body.rating,
  })

  let memoryUpdated = false
  if (body.rating === 'correct' || body.rating === 'partly') {
    const { data: existing } = await supabase.from('pet_patterns').select('id,evidence_count,validated').eq('pet_id', recording.pet_id).eq('pattern', interpretation.likely_intent).maybeSingle()
    if (existing) {
      const { error: memoryError } = await supabase.from('pet_patterns').update({ evidence_count: existing.evidence_count + 1, validated: existing.validated || body.rating === 'correct', updated_at: new Date().toISOString() }).eq('id', existing.id)
      memoryUpdated = !memoryError
    } else {
      const { error: memoryError } = await supabase.from('pet_patterns').insert({ pet_id: recording.pet_id, pattern: interpretation.likely_intent, evidence_count: 1, validated: body.rating === 'correct', updated_at: new Date().toISOString() })
      memoryUpdated = !memoryError
    }
  }

  return NextResponse.json({ accepted: true, rating: body.rating, feedback_id: feedback.id, memory_updated: memoryUpdated, persisted: true })
}
