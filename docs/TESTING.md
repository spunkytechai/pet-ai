# Smoke Checks

1. Home page renders PET AI positioning and safety disclaimer.
2. Pet onboarding route renders name/species/age inputs.
3. Analyze route calls POST `/api/analyze` and renders intent, emotion, confidence and alternatives.
4. Missing species yields `UNKNOWN / INSUFFICIENT_EVIDENCE`.
5. `/api/ping` and `/api/health` return JSON success payloads.
