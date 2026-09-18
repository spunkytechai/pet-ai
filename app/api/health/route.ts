import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({
    ok: true,
    service: 'pet-ai',
    version: '0.9.0',
    intelligence: 'local-deterministic',
    acoustic_model: 'local-feature-extraction',
    paid_api_required: false,
  })
}