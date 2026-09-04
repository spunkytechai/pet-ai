# PET AI

**AI-assisted pet communication.**

PET AI is a privacy-first web application that helps owners explore what a dog or cat vocalization may be expressing. It combines a pet profile, audio capture, contextual information and owner feedback to produce structured, probabilistic interpretations.

> PET AI does **not** claim literal animal-language translation and does not provide veterinary diagnosis.

## Product loop

1. Create an account.
2. Create a pet profile.
3. Record or upload a vocalization.
4. Add context.
5. Store the recording in private, owner-scoped Supabase Storage.
6. Generate a structured interpretation.
7. Review confidence, signals, alternatives and safety notes.
8. Tell PET AI whether the interpretation was correct, partly correct or incorrect.
9. Use positive feedback to strengthen pet-specific pattern memory.
10. Review private interpretation history.

## Stack

- Next.js 16 App Router + TypeScript
- React 19
- Supabase Auth, Postgres, Row Level Security and private Storage
- Zod interpretation contract
- Vercel deployment target
- Browser MediaRecorder API for capture

## Routes

- `/` — product landing page
- `/signup` — account creation
- `/login` — sign in
- `/pet/new` — pet onboarding
- `/analyze` — recording and interpretation workbench
- `/history` — owner-scoped interpretation history
- `/auth/confirm` — Supabase email confirmation callback

## API

- `GET /api/pets` — authenticated pet list
- `POST /api/pets` — authenticated pet creation
- `POST /api/analyze` — authenticated pet-scoped audio ingestion and interpretation persistence
- `POST /api/feedback` — feedback + evaluation logging + pet memory update
- `GET /api/history` — authenticated history
- `GET /api/health` — health check

## Interpretation contract

Every result contains species, vocalization type, signals, likely intent, emotional state, confidence, alternatives, context used, safety flag, model version and language. The system must abstain with `UNKNOWN / INSUFFICIENT_EVIDENCE` when evidence is inadequate.

The current `mvp-rule-engine-0.3` implementation is a deterministic integration baseline. It validates and persists real audio but does **not** yet represent a trained animal-communication model. A production signal-analysis model can replace the deterministic inference seam without changing the application contract.

## Environment

Copy `.env.example` to `.env.local` and provide:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- optional future AI provider variables

Never expose a Supabase secret/service key to the browser.

## Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm start
```

## Supabase

The production project uses a versioned migration baseline under `supabase/migrations/`. The migration creates owner-scoped tables, RLS policies, the private `pet-recordings` bucket, storage access policies and the model-version seed.

For email confirmation, configure the Supabase **Confirm signup** template to route through:

`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`

## Safety and research

PET AI should communicate uncertainty rather than inventing certainty. Persistent, unusual or severe distress should be assessed by a qualified veterinarian. Research datasets must be reviewed for license, provenance, consent and commercial-use restrictions before entering any production training pipeline.
