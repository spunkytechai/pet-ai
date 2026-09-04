import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({
    ok: true,
    service: 'pet-ai',
    version: '0.3.0',
    intelligence: process.env.OPENAI_API_KEY ? 'openai-audio-with-fallback' : 'deterministic-fallback',
  })
}
