import { NextResponse } from 'next/server'

const ratings = new Set(['correct', 'partly', 'incorrect'])

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || !ratings.has(body.rating)) return NextResponse.json({ error: 'Invalid feedback rating.' }, { status: 400 })

  // Persistence is intentionally deferred until auth + database wiring is enabled.
  // Keeping this endpoint now gives the UI a stable contract for the learning loop.
  return NextResponse.json({ accepted: true, rating: body.rating, persisted: false, reason: 'persistence_pending' })
}
