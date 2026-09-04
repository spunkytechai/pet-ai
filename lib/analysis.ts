import { z } from 'zod'

export const InterpretationSchema = z.object({
  species: z.string(),
  vocalization_type: z.string(),
  signals: z.array(z.string()),
  likely_intent: z.string(),
  emotional_state: z.string(),
  confidence: z.number().min(0).max(1),
  alternative_interpretations: z.array(z.string()),
  context_used: z.array(z.string()),
  safety_flag: z.boolean(),
  model_version: z.string(),
  language: z.enum(['en','hi']),
})

export type Interpretation = z.infer<typeof InterpretationSchema>

export function abstain(reason = 'Insufficient evidence') : Interpretation {
  return {species:'unknown',vocalization_type:'unknown',signals:[],likely_intent:'UNKNOWN / INSUFFICIENT_EVIDENCE',emotional_state:'unknown',confidence:0,alternative_interpretations:[reason],context_used:[],safety_flag:false,model_version:'mvp-rule-engine-0.1',language:'en'}
}
