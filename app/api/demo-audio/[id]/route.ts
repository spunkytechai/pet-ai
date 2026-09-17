import { NextResponse } from 'next/server'
import { DEMO_AUDIO_SAMPLES } from '@/lib/demo-audio'

const MEDIA_ORIGINS = ['https://commons.wikimedia.org/wiki/Special:Redirect/file/']

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sample = DEMO_AUDIO_SAMPLES.find((item) => item.id === id)
  if (!sample) return NextResponse.json({ error: 'Demo sample not found.' }, { status: 404 })

  const fileName = sample.id === 'cat-meow-cc0' ? 'MeowUSA.wav' : 'Barking_of_a_dog.ogg'
  const source = `${MEDIA_ORIGINS[0]}${encodeURIComponent(fileName)}`

  const response = await fetch(source, { cache: 'force-cache' })
  if (!response.ok || !response.body) {
    return NextResponse.json({ error: 'Demo sample is temporarily unavailable.' }, { status: 502 })
  }

  const headers = new Headers()
  headers.set('Content-Type', response.headers.get('content-type') || (fileName.endsWith('.wav') ? 'audio/wav' : 'audio/ogg'))
  headers.set('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400')
  headers.set('X-Content-Source', sample.sourceUrl)
  headers.set('X-License', sample.license)

  return new Response(response.body, { status: 200, headers })
}
