import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({
    ok: true,
    service: 'pet-ai',
    version: '0.7.0',
    intelligence: process.env.OPENAI_API_KEY ? 'openai-audio-with-v0.7-fallback' : 'deterministic-v0.6',
    acoustic_model: process.env.OPENAI_API_KEY ? 'optional' : 'not-configured',
  })
}
