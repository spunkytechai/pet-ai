import { NextResponse } from 'next/server'
import { buildSpeciesProfile } from '@/lib/species-profile'

const MAX_IMAGE_BYTES = 6 * 1024 * 1024
const GEMINI_MODEL = process.env.GEMINI_SPECIES_MODEL || 'gemini-3.8-flash'
const OPENAI_MODEL = process.env.OPENAI_SPECIES_MODEL || 'gpt-5.6-luna'

type Identification = {
  commonName: string
  scientificName: string
  group: string
  confidence: number
  alternatives: string[]
  visibleTraits: string[]
  uncertainty: string[]
  ownerShouldKnow: string[]
  careNotes: string[]
}

const identificationSchema = {
  type: 'object',
  properties: {
    commonName: { type: 'string' },
    scientificName: { type: 'string' },
    group: { type: 'string' },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    alternatives: { type: 'array', items: { type: 'string' } },
    visibleTraits: { type: 'array', items: { type: 'string' } },
    uncertainty: { type: 'array', items: { type: 'string' } },
    ownerShouldKnow: { type: 'array', items: { type: 'string' } },
    careNotes: { type: 'array', items: { type: 'string' } }
  },
  required: ['commonName', 'scientificName', 'group', 'confidence', 'alternatives', 'visibleTraits', 'uncertainty', 'ownerShouldKnow', 'careNotes'],
  additionalProperties: false
}

function instructions() {
  return `You are PET AI Species Analyzer. Identify the animal visible in the supplied photo. Be conservative: species identification is probabilistic and breed identification is especially uncertain for mixed breeds or similar-looking animals. Never infer medical diagnosis, exact age, sex, pedigree, or health status as fact. If the species is unclear, explicitly say so and keep confidence low. Focus on dogs and cats first, but identify another animal if clearly visible. Return only the requested JSON. Include practical, species-appropriate owner guidance, but do not invent breed-specific medical claims.`
}

function clampConfidence(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : 0
}

function normalizeIdentification(value: unknown): Identification {
  const item = (value && typeof value === 'object') ? value as Record<string, unknown> : {}
  const list = (key: string) => Array.isArray(item[key]) ? item[key].filter((v): v is string => typeof v === 'string').slice(0, 12) : []
  return {
    commonName: typeof item.commonName === 'string' && item.commonName.trim() ? item.commonName.trim() : 'Unknown companion animal',
    scientificName: typeof item.scientificName === 'string' ? item.scientificName.trim() : 'Species requires confirmation',
    group: typeof item.group === 'string' ? item.group.trim() : 'Companion animal',
    confidence: clampConfidence(item.confidence),
    alternatives: list('alternatives'),
    visibleTraits: list('visibleTraits'),
    uncertainty: list('uncertainty'),
    ownerShouldKnow: list('ownerShouldKnow'),
    careNotes: list('careNotes')
  }
}

function extractGeminiText(payload: unknown): string {
  const body = payload as { output_text?: string; steps?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }> }
  if (typeof body.output_text === 'string') return body.output_text
  for (const step of body.steps || []) {
    for (const part of step.content || []) {
      if (typeof part.text === 'string' && part.text.trim()) return part.text
    }
  }
  return ''
}

async function identifyWithGemini(image: File, apiKey: string): Promise<Identification> {
  const base64 = Buffer.from(await image.arrayBuffer()).toString('base64')
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    signal: AbortSignal.timeout(20000),
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json',
      'Api-Revision': '2026-05-20'
    },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      store: false,
      input: [
        { type: 'text', text: instructions() },
        { type: 'image', data: base64, mime_type: image.type }
      ],
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: identificationSchema
      }
    })
  })
  if (!response.ok) throw new Error('Gemini request failed')
  const payload = await response.json()
  const text = extractGeminiText(payload)
  if (!text) throw new Error('Gemini returned no text')
  return normalizeIdentification(JSON.parse(text))
}

async function identifyWithOpenAI(image: File, apiKey: string): Promise<Identification> {
  const base64 = Buffer.from(await image.arrayBuffer()).toString('base64')
  const dataUrl = 'data:' + image.type + ';base64,' + base64
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    signal: AbortSignal.timeout(20000),
    headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [{
        role: 'user',
        content: [
          { type: 'input_text', text: instructions() },
          { type: 'input_image', image_url: dataUrl, detail: 'high' }
        ]
      }],
      text: { format: { type: 'json_object' } }
    })
  })
  if (!response.ok) throw new Error('OpenAI request failed')
  const payload = await response.json() as { output_text?: string }
  if (!payload.output_text) throw new Error('OpenAI returned no text')
  return normalizeIdentification(JSON.parse(payload.output_text))
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Invalid multipart form data.' }, { status: 400 })

  const image = form.get('image')
  if (!(image instanceof File) || !image.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Please upload a pet photo.' }, { status: 400 })
  }
  if (image.size === 0 || image.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: 'Image must be larger than 0 bytes and no larger than 6 MB.' }, { status: 400 })
  }

  const geminiKey = process.env.GEMINI_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  if (!geminiKey && !openaiKey) {
    return NextResponse.json({
      configured: false,
      provider: null,
      error: 'AI species identification is not configured yet. Add a Gemini API key to enable the free-tier photo analyzer.',
      profile: null
    }, { status: 503 })
  }

  try {
    let identification: Identification
    let provider: 'gemini' | 'openai'

    if (geminiKey) {
      identification = await identifyWithGemini(image, geminiKey)
      provider = 'gemini'
    } else {
      identification = await identifyWithOpenAI(image, openaiKey!)
      provider = 'openai'
    }

    const profile = buildSpeciesProfile({
      commonName: identification.commonName,
      scientificName: identification.scientificName,
      group: identification.group,
      confidence: identification.confidence,
      imageNotes: identification.visibleTraits
    })

    return NextResponse.json({
      configured: true,
      provider,
      model: provider === 'gemini' ? GEMINI_MODEL : OPENAI_MODEL,
      identification: {
        commonName: identification.commonName,
        scientificName: identification.scientificName,
        group: identification.group,
        confidence: identification.confidence,
        alternatives: identification.alternatives,
        visibleTraits: identification.visibleTraits,
        uncertainty: identification.uncertainty
      },
      profile: {
        ...profile,
        ownerShouldKnow: identification.ownerShouldKnow.length ? identification.ownerShouldKnow : profile.ownerShouldKnow,
        careChecklist: identification.careNotes.length ? [...profile.careChecklist, ...identification.careNotes] : profile.careChecklist
      }
    })
  } catch {
    return NextResponse.json({
      error: 'Species analysis failed. Please try a clearer photo or try again later.'
    }, { status: 502 })
  }
}
