# PET AI

**AI-assisted pet communication.**

PET AI analyzes pet vocalizations and context to produce probabilistic interpretations. It does not claim literal animal-language translation and is not a veterinary diagnostic service.

## Current MVP
- Next.js App Router + TypeScript
- Pet onboarding UI
- Sample sound-analysis flow
- Structured interpretation contract with abstention
- English/Hindi-ready output contract
- PostgreSQL/Supabase migration foundation
- Vercel deployment configuration

## Run

`npm install`

`npm run dev`

## Safety

Every interpretation should expose confidence, alternative hypotheses, context used and model version. The system can return `UNKNOWN / INSUFFICIENT_EVIDENCE`. Persistent, unusual or severe distress should be assessed by a qualified veterinarian.
