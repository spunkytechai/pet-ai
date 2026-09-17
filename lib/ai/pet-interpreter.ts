import { InterpretationSchema, type Interpretation } from '@/lib/analysis'

const MODEL = process.env.OPENAI_PET_AUDIO_MODEL || 'gpt-4o-audio-preview'
const API_URL = 'https://api.openai.com/v1/chat/completions'

function supportedAudioFormat(mime: string, name: string) {
  if (mime === 'audio/wav' || mime === 'audio/x-wav' || /\.wav$/i.test(name)) return 'wav'
  if (mime === 'audio/mpeg' || mime === 'audio/mp3' || /\.mp3$/i.test(name)) return 'mp3'
  return null
}

export async function interpretPetAudio(input: {
  audio: File
  species: 'dog' | 'cat'
  context: string
  language: 'en' | 'hi'
}): Promise<Interpretation | null> {
  const key = process.env.OPENAI_API_KEY
  const format = supportedAudioFormat(input.audio.type, input.audio.name)
  if (!key || !format) return null

  const base64 = Buffer.from(await input.audio.arrayBuffer()).toString('base64')
  const languageName = input.language === 'hi' ? 'Hindi' : 'English'

  const instructions = `You are PET AI, an animal-vocalization interpretation assistant. Analyze the supplied ${input.species} audio as acoustic evidence, not as literal language translation. Never claim certainty about what the animal "said". Produce a cautious hypothesis. Consider the owner's context, but do not let context override weak audio evidence. If the evidence is insufficient, abstain. Output ONLY valid JSON with these keys: species, vocalization_type, signals (array), likely_intent, emotional_state, confidence (0 to 1), alternative_interpretations (array), context_used (array), safety_flag (boolean), model_version, language. Use ${languageName} for human-readable intent, emotion, signals, and alternatives. Keep model_version exactly "openai-audio-${MODEL}". Set safety_flag true for possible pain, respiratory distress, prolonged distress, aggression risk, or other potentially urgent welfare concern. This is not veterinary diagnosis.`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        modalities: ['text'],
        messages: [
          { role: 'system', content: instructions },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Pet species: ${input.species}\nOwner context: ${input.context || 'none'}\nAnalyze the animal audio and return the required JSON.` },
              { type: 'input_audio', input_audio: { data: base64, format } },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) return null
    const payload = await response.json() as {
      choices?: Array<{ message?: { content?: string | null } }>
    }
    const outputText = payload.choices?.[0]?.message?.content
    if (!outputText) return null

    const parsed = JSON.parse(outputText)
    return InterpretationSchema.parse({
      ...parsed,
      species: input.species,
      model_version: `openai-audio-${MODEL}`,
      language: input.language,
    })
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}
