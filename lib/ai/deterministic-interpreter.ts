import { InterpretationSchema, type Interpretation } from '@/lib/analysis'
import type { AudioFeatures } from '@/lib/ai/audio-features'

const MODEL_VERSION = 'mvp-rule-engine-0.4'

type Species = 'dog' | 'cat'
type Language = 'en' | 'hi'

type Rule = {
  intent: string
  emotion: string
  signals: string[]
  alternatives: string[]
  keywords: string[]
  weight: number
  safety?: boolean
}

const RULES: Record<Species, Rule[]> = {
  dog: [
    { intent: 'ATTENTION_SEEKING', emotion: 'engaged', signals: ['owner-directed context'], alternatives: ['greeting', 'response to nearby stimulus'], keywords: ['attention', 'look at me', 'come here', 'where are you', 'notice me', 'ध्यान', 'इधर आओ', 'देखो'], weight: 0.72 },
    { intent: 'EXCITEMENT_OR_PLAY', emotion: 'excited', signals: ['high-energy context cue'], alternatives: ['attention seeking', 'anticipation'], keywords: ['play', 'toy', 'park', 'walk', 'ball', 'excited', 'खेल', 'खिलौना', 'पार्क', 'घूमना'], weight: 0.70 },
    { intent: 'ALERT_OR_ENVIRONMENTAL_RESPONSE', emotion: 'alert', signals: ['environmental trigger described'], alternatives: ['attention seeking', 'fear or uncertainty'], keywords: ['door', 'stranger', 'outside', 'noise', 'sound', 'alarm', 'intruder', 'दरवाज़ा', 'बाहर', 'आवाज़', 'अजनबी'], weight: 0.68 },
    { intent: 'SEPARATION_OR_DISTRESS', emotion: 'distressed', signals: ['distress-related context cue'], alternatives: ['attention seeking', 'frustration'], keywords: ['alone', 'left', 'separation', 'crying', 'distress', 'panic', 'anxious', 'अकेला', 'अकेली', 'छोड़', 'परेशान', 'घबर'], weight: 0.66, safety: true },
    { intent: 'POSSIBLE_WELFARE_CONCERN', emotion: 'distressed', signals: ['possible welfare concern in context'], alternatives: ['fear or anxiety', 'attention seeking'], keywords: ['pain', 'hurt', 'injured', 'breathing', 'difficulty breathing', 'vomit', 'collapse', 'bleeding', 'दर्द', 'चोट', 'सांस', 'खून', 'बेहोश'], weight: 0.90, safety: true },
  ],
  cat: [
    { intent: 'ATTENTION_SEEKING', emotion: 'engaged', signals: ['owner-directed context cue'], alternatives: ['greeting', 'request for access or food'], keywords: ['attention', 'look at me', 'come here', 'notice me', 'ध्यान', 'इधर आओ', 'देखो'], weight: 0.70 },
    { intent: 'FOOD_OR_ACCESS_REQUEST', emotion: 'expectant', signals: ['resource or access context cue'], alternatives: ['attention seeking', 'routine greeting'], keywords: ['food', 'hungry', 'feed', 'treat', 'door', 'outside', 'open', 'खाना', 'भूख', 'खिलाओ', 'ट्रीट', 'दरवाज़ा', 'बाहर', 'खोलो'], weight: 0.72 },
    { intent: 'GREETING_OR_SOCIAL_RESPONSE', emotion: 'social', signals: ['social interaction context cue'], alternatives: ['attention seeking', 'response to nearby stimulus'], keywords: ['hello', 'home', 'came back', 'greeting', 'petting', 'welcome', 'घर', 'वापस', 'प्यार'], weight: 0.66 },
    { intent: 'STRESS_OR_DISTRESS', emotion: 'distressed', signals: ['distress-related context cue'], alternatives: ['fear or uncertainty', 'attention seeking'], keywords: ['alone', 'scared', 'fear', 'stress', 'distress', 'hiding', 'anxious', 'अकेला', 'अकेली', 'डर', 'तनाव', 'परेशान', 'छिप'], weight: 0.70, safety: true },
    { intent: 'POSSIBLE_WELFARE_CONCERN', emotion: 'distressed', signals: ['possible welfare concern in context'], alternatives: ['fear or anxiety', 'stress or distress'], keywords: ['pain', 'hurt', 'injured', 'breathing', 'difficulty breathing', 'vomit', 'collapse', 'bleeding', 'दर्द', 'चोट', 'सांस', 'खून', 'बेहोश'], weight: 0.90, safety: true },
  ],
}

function normalize(value: string) {
  return value.toLocaleLowerCase().replace(/\s+/g, ' ').trim()
}

function matchingRules(species: Species, context: string) {
  const normalized = normalize(context)
  return RULES[species]
    .map((rule) => ({
      rule,
      matches: rule.keywords.filter((keyword) => normalized.includes(normalize(keyword))).length,
    }))
    .filter(({ matches }) => matches > 0)
    .sort((a, b) => (b.matches * b.rule.weight) - (a.matches * a.rule.weight))
}

function acousticSignals(features: AudioFeatures | null) {
  if (!features) return []
  const signals: string[] = []
  if (features.durationMs < 700) signals.push('very short vocal event')
  else if (features.durationMs > 6000) signals.push('sustained vocal event')
  if (features.rms >= 0.08) signals.push('higher acoustic energy')
  else if (features.rms > 0 && features.rms < 0.025) signals.push('low acoustic energy')
  if (features.zeroCrossingRate >= 0.12) signals.push('higher-frequency acoustic texture')
  if (!features.voiced) signals.push('low-confidence voiced signal')
  return signals
}

export function interpretDeterministically(input: {
  species: Species
  context: string
  language: Language
  audioBytes: number
  audioMime: string
  features?: AudioFeatures | null
}): Interpretation {
  const context = normalize(input.context)
  const candidates = matchingRules(input.species, context)
  const audioSignals = acousticSignals(input.features ?? null)

  if (!input.features) {
    return InterpretationSchema.parse({
      species: input.species,
      vocalization_type: 'unknown',
      signals: ['audio received', 'acoustic features unavailable'],
      likely_intent: 'UNKNOWN / INSUFFICIENT_EVIDENCE',
      emotional_state: 'unknown',
      confidence: 0,
      alternative_interpretations: ['This recording format cannot be acoustically inspected by the current fallback engine.', 'Use a short WAV recording or provide context about what was happening before the sound.'],
      context_used: context ? [context] : [],
      safety_flag: false,
      model_version: MODEL_VERSION,
      language: input.language,
    })
  }

  if (!input.features.voiced || input.features.durationMs < 40 || (!context && audioSignals.length === 0)) {
    return InterpretationSchema.parse({
      species: input.species,
      vocalization_type: 'unknown',
      signals: audioSignals.length ? audioSignals : ['insufficient acoustic signal'],
      likely_intent: 'UNKNOWN / INSUFFICIENT_EVIDENCE',
      emotional_state: 'unknown',
      confidence: 0,
      alternative_interpretations: ['The available acoustic evidence is too weak for a responsible intent hypothesis.', 'Add brief context and record a clearer vocalization.'],
      context_used: context ? [context] : [],
      safety_flag: false,
      model_version: MODEL_VERSION,
      language: input.language,
    })
  }

  if (!context || !candidates.length) {
    return InterpretationSchema.parse({
      species: input.species,
      vocalization_type: input.features.durationMs < 900 ? 'short vocalization' : 'sustained vocalization',
      signals: [...audioSignals, 'context not provided'],
      likely_intent: 'UNKNOWN / INSUFFICIENT_EVIDENCE',
      emotional_state: 'unknown',
      confidence: 0,
      alternative_interpretations: ['Acoustic features alone do not establish intent.', 'Add brief context about what was happening before the sound.'],
      context_used: [],
      safety_flag: false,
      model_version: MODEL_VERSION,
      language: input.language,
    })
  }

  const { rule, matches } = candidates[0]
  const second = candidates[1]?.rule
  const contextStrength = Math.min(1, 0.5 + matches * 0.14)
  const acousticSupport = audioSignals.length ? 0.05 : 0
  const confidence = Math.min(0.78, Math.max(0.42, rule.weight * contextStrength + acousticSupport))
  const alternatives = second
    ? [second.intent, ...rule.alternatives].slice(0, 3)
    : rule.alternatives.slice(0, 3)

  return InterpretationSchema.parse({
    species: input.species,
    vocalization_type: input.features.durationMs < 900 ? 'short vocalization' : 'sustained vocalization',
    signals: [...audioSignals, ...rule.signals],
    likely_intent: rule.intent,
    emotional_state: rule.emotion,
    confidence: Number(confidence.toFixed(2)),
    alternative_interpretations: alternatives,
    context_used: [context],
    safety_flag: Boolean(rule.safety),
    model_version: MODEL_VERSION,
    language: input.language,
  })
}
