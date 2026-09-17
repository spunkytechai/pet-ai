import { NextResponse } from 'next/server'
import { DEMO_AUDIO_SAMPLES } from '@/lib/demo-audio'

export function GET() {
  return NextResponse.json({ samples: DEMO_AUDIO_SAMPLES })
}
