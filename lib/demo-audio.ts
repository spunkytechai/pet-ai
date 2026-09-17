export type DemoAudioSample = {
  id: string
  species: 'dog' | 'cat'
  title: string
  description: string
  sourceUrl: string
  license: string
  attribution: string
}

/**
 * Curated public demo recordings. Keep source/license metadata with every sample.
 * Only add recordings after verifying the source permits the intended use.
 */
export const DEMO_AUDIO_SAMPLES: DemoAudioSample[] = [
  {
    id: 'cat-meow-cc0',
    species: 'cat',
    title: 'Cat meow',
    description: 'Short cat vocalization for a basic analysis demo.',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:MeowUSA.wav',
    license: 'CC0',
    attribution: 'Wikimedia Commons — MeowUSA.wav',
  },
  {
    id: 'dog-bark-cc-by-sa',
    species: 'dog',
    title: 'Dog bark',
    description: 'Dog barking sample for a basic analysis demo.',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dog_barking.ogg',
    license: 'CC BY-SA 4.0',
    attribution: 'Wikimedia Commons — Dog barking.ogg',
  },
]
