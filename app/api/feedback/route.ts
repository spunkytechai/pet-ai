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

  const { error } = await supabase.from('feedback').insert({
    interpretation_id: body.interpretation_id,
    label: body.rating,
    note: typeof body.note === 'string' ? body.note.slice(0, 1000) : null,
  })

  if (error) return NextResponse.json({ error: 'Feedback could not be saved.' }, { status: 500 })
  return NextResponse.json({ accepted: true, rating: body.rating, persisted: true })
}
