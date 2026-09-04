# PET AI Initial Data Model

## Core tables

### users
- `id` UUID primary key
- `created_at`
- `locale`

### pets
- `id` UUID primary key
- `user_id` UUID foreign key
- `name`
- `species`
- `breed`
- `sex` nullable
- `birth_date` nullable
- `notes` nullable
- `created_at`

### recordings
- `id` UUID primary key
- `pet_id` UUID foreign key
- `storage_key`
- `duration_ms`
- `mime_type`
- `sample_rate_hz` nullable
- `recorded_at`
- `consent_id`
- `status`

### audio_features
- `recording_id` UUID foreign key
- `features_json`
- `extractor_version`
- `created_at`

### interpretations
- `id` UUID primary key
- `recording_id` UUID foreign key
- `likely_intent`
- `emotional_state`
- `confidence`
- `alternatives_json`
- `context_json`
- `safety_flag`
- `model_version`
- `language`
- `abstained`
- `created_at`

### feedback
- `id` UUID primary key
- `interpretation_id` UUID foreign key
- `label` (`confirmed`, `incorrect`, `unsure`)
- `corrected_intent` nullable
- `comment` nullable
- `created_at`

### pet_patterns
- `id` UUID primary key
- `pet_id` UUID foreign key
- `pattern_type`
- `pattern_json`
- `evidence_count`
- `confidence`
- `updated_at`

### model_versions
- `id` UUID primary key
- `name`
- `version`
- `provider`
- `configuration_json`
- `active`
- `created_at`

### ai_evaluations
- `id` UUID primary key
- `recording_id` UUID foreign key
- `interpretation_id` UUID foreign key
- `expected_label` nullable
- `predicted_label`
- `confidence`
- `abstained`
- `evaluation_source`
- `created_at`

### consents
- `id` UUID primary key
- `user_id` UUID foreign key
- `purpose`
- `version`
- `granted_at`
- `revoked_at` nullable

## Rules

1. Never train on a recording without the appropriate consent and rights.
2. Preserve dataset provenance and license metadata.
3. Keep research-only datasets segregated from commercial training data.
4. Store model version and evidence for every interpretation.
5. Allow users to delete recordings and associated derived data according to the retention policy.
