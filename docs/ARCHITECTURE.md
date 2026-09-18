# PET AI Production Architecture

## System flow

User → Supabase Auth → Pet Profile → Audio Capture/Upload → Canonical PCM/WAV Normalization → Acoustic Feature Extraction → Deterministic Interpretation → Confidence/Abstention → English/Hindi UI → Owner Feedback → Pet Memory → Evaluation

## Application layers

### Web

- Next.js App Router
- TypeScript
- Responsive mobile-first product UI
- proxy.ts refreshes Supabase Auth claims and protects authenticated routes

### Audio / AI

PET AI does not require paid or metered inference APIs.

Current production intelligence is:

1. Browser audio is decoded with Web Audio APIs.
2. Audio is resampled to mono 16 kHz, 16-bit PCM WAV.
3. The server extracts deterministic acoustic features.
4. lib/ai/deterministic-interpreter.ts combines acoustic evidence with owner-supplied context using explicit rules.
5. If evidence is inadequate, the engine abstains with UNKNOWN / INSUFFICIENT_EVIDENCE.
6. lib/ai/local-model.ts is an extension point for a future open-source/self-hosted model. It is currently unconfigured.
7. If a future local model fails, the deterministic interpreter remains the fallback.

The current confidence value is a heuristic model score, not a calibrated probability and must not be presented as scientifically validated certainty.

### Data

PostgreSQL tables currently used by the application:

- pets
- recordings
- interpretations
- feedback
- pet_patterns
- model_versions
- ai_evaluations

All application tables have Row Level Security enabled. Owner-scoped policies connect recordings and downstream records back to the owning pet.

### Storage

- Supabase Storage bucket: pet-recordings
- Private objects
- Object paths begin with the authenticated user's UUID
- Storage policies restrict select/insert/delete to the authenticated user's folder
- Audio is stored in canonical WAV form by the analysis API

### Interpretation contract

Every persisted result contains species, vocalization type, detected signals, likely intent, emotional state, confidence, alternatives, context used, safety flag, model version and output language.

Interpretations are hypotheses about a pet signal, not literal animal-language translation or veterinary diagnosis.

### Feedback and Pet Memory

Owner feedback is stored as feedback/evaluation data. Recurring observations in pet_patterns represent user feedback and observed history; they are not scientific ground truth.

### Safety

The product must communicate uncertainty. It must never present an interpretation as verified translation or medical diagnosis. Persistent or unusual distress should be directed to a qualified veterinarian.

## Future local-ML evaluation

A future open-source/local model should be evaluated before deployment using held-out data with at least:

- sample ID
- species
- audio
- context
- human label
- model prediction
- confidence
- alternatives
- safety flag
- owner feedback

Candidate metrics include accuracy, precision, recall, F1, confusion matrix, calibration, abstention rate and per-species performance.

No model performance numbers should be published until measured on an actual evaluation dataset.

## Environments

development → preview → production

Secrets must be supplied through environment configuration and never committed to Git.
