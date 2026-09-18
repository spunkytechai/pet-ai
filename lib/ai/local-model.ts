import type { Interpretation } from '@/lib/analysis'
import type { AudioFeatures } from '@/lib/ai/audio-features'

export type LocalAudioModelInput = {
  species: 'dog' | 'cat'
  context: string
  language: 'en' | 'hi'
  audio: Uint8Array
  features: AudioFeatures | null
}

export type LocalAudioModel = {
  id: string
  analyze(input: LocalAudioModelInput): Promise<Interpretation | null> | Interpretation | null
}

/**
 * Extension point for open-source/self-hosted animal-audio models.
 * Returning null is intentional: the deterministic engine remains the safe fallback.
 */
export function getLocalAudioModel(): LocalAudioModel | null {
  return null
}
