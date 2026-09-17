import { NextResponse } from 'next/server'
import { buildSpeciesProfile } from '@/lib/species-profile'

const MAX_IMAGE_BYTES = 6 * 1024 * 1024
const MODEL = process.env.OPENAI_SPECIES_MODEL || 'gpt-5.6-luna'

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

  const key = process.env.OPENAI_API_KEY
  if (!key) {
    return NextResponse.json({
      configured: false,
      error: 'AI species identification is not configured yet. Add an OpenAI API key to enable photo identification.',
      profile: null,
    }, { status: 503 })
  }

  const base64 = Buffer.from(await image.arrayBuffer()).toString('base64')
  const dataUrl = 'data:' + image.type + ';base64,' + base64
  const instructions = `You are PET AI Species Analyzer. Identify the animal visible in the supplied photo. Be conservative: if species is unclear, say so. Breed identification is probabilistic, especially for mixed breeds. Never infer medical diagnosis, age, sex, pedigree, or health status as fact. Return ONLY JSON with: commonName, scientificName, group, confidence (0 to 1), alternatives (array), visibleTraits (array), uncertainty (array), ownerShouldKnow (array), careNotes (array). Focus on dog/cat first, but identify another animal if clearly visible.`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      signal: controller.signal,
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        input: [{
          role: 'user',
          content: [
            { type: 'input_text', text: instructions },
            { type: 'input_image', image_url: dataUrl, detail: 'high' }
          ]
        }],
        text: { format: { type: 'json_object' } }
      })
    })
    if (!response.ok) return NextResponse.json({ error: 'The visual model could not identify this photo.' }, { status: 502 })
    const payload = await response.json() as { output_text?: string }
    if (!payload.output_text) return NextResponse.json({ error: 'No identification result was returned.' }, { status: 502 })
    const parsed = JSON.parse(payload.output_text)
    const profile = buildSpeciesProfile({
      commonName: parsed.commonName,
      scientificName: parsed.scientificName,
      group: parsed.group,
      confidence: Number(parsed.confidence) || 0,
      imageNotes: Array.isArray(parsed.visibleTraits) ? parsed.visibleTraits : []
    })
    return NextResponse.json({
      configured: true,
      model: MODEL,
      identification: {
        commonName: parsed.commonName,
        scientificName: parsed.scientificName,
        group: parsed.group,
        confidence: Number(parsed.confidence) || 0,
        alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives : [],
        visibleTraits: Array.isArray(parsed.visibleTraits) ? parsed.visibleTraits : [],
        uncertainty: Array.isArray(parsed.uncertainty) ? parsed.uncertainty : []
      },
      profile: {
        ...profile,
        ownerShouldKnow: Array.isArray(parsed.ownerShouldKnow) && parsed.ownerShouldKnow.length ? parsed.ownerShouldKnow : profile.ownerShouldKnow,
        careChecklist: Array.isArray(parsed.careNotes) && parsed.careNotes.length ? [...profile.careChecklist, ...parsed.careNotes] : profile.careChecklist
      }
    })
  } catch {
    return NextResponse.json({ error: 'Species analysis timed out or failed.' }, { status: 502 })
  } finally {
    clearTimeout(timeout)
  }
}
