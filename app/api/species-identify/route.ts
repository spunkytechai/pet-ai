import { NextResponse } from 'next/server'

const MAX_IMAGE_BYTES = 6 * 1024 * 1024

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

  return NextResponse.json({
    configured: false,
    provider: 'local',
    model: null,
    error: 'Local photo identification is not installed yet. Choose Dog or Cat for general species guidance, or add an open-source vision model when local inference is ready.',
    profile: null,
  }, { status: 503 })
}
