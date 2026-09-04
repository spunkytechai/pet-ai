# PET AI

AI-assisted pet communication platform.

## Product principle
PET AI provides probabilistic interpretations of pet vocalizations and context. It does **not** claim literal or exact translation of animal language and is not a veterinary diagnostic tool.

## MVP flow

Create Pet → Record/Upload Sound → Validate Audio → Analyze Signals → Interpret with Context → Confidence + Alternatives → English/Hindi → Owner Feedback → Pet Memory

## Architecture

- Next.js + TypeScript
- Vercel
- AI orchestration via Vercel AI SDK / AI Gateway
- PostgreSQL
- Supabase Auth + Storage (planned)
- Pet-specific memory and evaluation layer

## Development status

Phase 1: repository and product foundation.

See `docs/ARCHITECTURE.md` and `docs/ROADMAP.md`.