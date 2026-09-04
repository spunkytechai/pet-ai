# PET AI Production Architecture

## System flow

User → Auth → Pet Profile → Audio Capture/Upload → Audio Validation → Signal Analysis → Interpretation Engine → Confidence/Abstention → English/Hindi Renderer → Owner Feedback → Pet Memory → Evaluation

## Application layers

### Web
- Next.js App Router
- TypeScript
- Tailwind CSS + accessible component primitives
- Responsive mobile-first recording experience

### AI
- Vercel AI SDK
- Vercel AI Gateway for provider abstraction
- Structured JSON output with schema validation
- Model/version tracking on every interpretation
- Explicit abstention state: `UNKNOWN` / `INSUFFICIENT_EVIDENCE`

### Data
- PostgreSQL
- `users`
- `pets`
- `recordings`
- `audio_features`
- `interpretations`
- `feedback`
- `pet_patterns`
- `model_versions`
- `ai_evaluations`
- `consents`

### Storage
- Private object storage for recordings
- Signed URLs only
- Recording retention and deletion controls

## Interpretation contract

Every result should contain species, vocalization type, detected signals, likely intent, emotional state, confidence, alternatives, context used, safety flag, model version and output language.

## Safety

The product must communicate uncertainty. It must never present an interpretation as a verified translation or medical diagnosis. Persistent or unusual distress should be directed to a qualified veterinarian.

## Data provenance

Research-only datasets must remain clearly segregated from commercial training data. Commercial learning data should be based on recordings for which PET AI has appropriate rights and user consent.

## Environments

`development` → `preview` → `production`

Secrets must be supplied through environment configuration and never committed to Git.