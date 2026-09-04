import { z } from 'zod'
export const AnalyzeRequest = z.object({species:z.string().min(1),context:z.string().optional(),language:z.enum(['en','hi']).default('en')})
export type AnalyzeRequest = z.infer<typeof AnalyzeRequest>
