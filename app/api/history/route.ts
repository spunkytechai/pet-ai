import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  const { data: pets, error: petsError } = await supabase
    .from('pets')
    .select('id,name,species')
    .order('created_at', { ascending: false })
  if (petsError) return NextResponse.json({ error: 'History could not be loaded.' }, { status: 500 })

  const petMap = new Map((pets ?? []).map((pet) => [pet.id, pet]))
  const petIds = [...petMap.keys()]
  if (!petIds.length) return NextResponse.json({ history: [] })

  const { data: recordings, error: recordingsError } = await supabase
    .from('recordings')
    .select('id,pet_id,created_at')
    .in('pet_id', petIds)
  if (recordingsError) return NextResponse.json({ error: 'History could not be loaded.' }, { status: 500 })

  const recordingMap = new Map((recordings ?? []).map((recording) => [recording.id, recording]))
  const recordingIds = [...recordingMap.keys()]
  if (!recordingIds.length) return NextResponse.json({ history: [] })

  const { data: interpretations, error: interpretationsError } = await supabase
    .from('interpretations')
    .select('id,recording_id,likely_intent,emotional_state,confidence,alternatives,signals,context_used,safety_flag,model_version,language,created_at')
    .in('recording_id', recordingIds)
    .order('created_at', { ascending: false })
    .limit(50)
  if (interpretationsError) return NextResponse.json({ error: 'History could not be loaded.' }, { status: 500 })

  const history = (interpretations ?? []).map((item) => {
    const recording = recordingMap.get(item.recording_id)
    const pet = recording ? petMap.get(recording.pet_id) : null
    return { ...item, pet }
  })

  return NextResponse.json({ history })
}
