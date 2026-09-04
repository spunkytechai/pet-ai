create extension if not exists pgcrypto;

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80), species text not null check (species in ('dog','cat')),
  age_years numeric check (age_years is null or (age_years >= 0 and age_years <= 50)), created_at timestamptz not null default now()
);
create table if not exists public.recordings (
  id uuid primary key default gen_random_uuid(), pet_id uuid not null references public.pets(id) on delete cascade,
  storage_path text, duration_ms integer check (duration_ms is null or duration_ms >= 0), mime_type text, created_at timestamptz not null default now()
);
create table if not exists public.interpretations (
  id uuid primary key default gen_random_uuid(), recording_id uuid not null references public.recordings(id) on delete cascade,
  species text, vocalization_type text, likely_intent text not null, emotional_state text not null,
  confidence numeric not null check (confidence >= 0 and confidence <= 1), alternatives jsonb not null default '[]'::jsonb,
  signals jsonb not null default '[]'::jsonb, context_used jsonb not null default '[]'::jsonb, safety_flag boolean not null default false,
  model_version text not null, language text not null default 'en' check (language in ('en','hi')), created_at timestamptz not null default now()
);
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(), interpretation_id uuid not null references public.interpretations(id) on delete cascade,
  label text not null check (label in ('correct','partly','incorrect')), note text, created_at timestamptz not null default now()
);
create table if not exists public.pet_patterns (
  id uuid primary key default gen_random_uuid(), pet_id uuid not null references public.pets(id) on delete cascade,
  pattern text not null, evidence_count integer not null default 1 check (evidence_count >= 1), validated boolean not null default false,
  updated_at timestamptz not null default now()
);
create table if not exists public.model_versions (
  id uuid primary key default gen_random_uuid(), version text unique not null, notes text, created_at timestamptz not null default now()
);
create table if not exists public.ai_evaluations (
  id uuid primary key default gen_random_uuid(), interpretation_id uuid not null references public.interpretations(id) on delete cascade,
  expected_label text, predicted_label text, confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  feedback_label text, created_at timestamptz not null default now()
);

create index if not exists pets_owner_id_idx on public.pets(owner_id);
create index if not exists recordings_pet_id_idx on public.recordings(pet_id);
create index if not exists interpretations_recording_id_idx on public.interpretations(recording_id);
create index if not exists feedback_interpretation_id_idx on public.feedback(interpretation_id);
create unique index if not exists pet_patterns_pet_pattern_uidx on public.pet_patterns(pet_id, pattern);

alter table public.pets enable row level security;
alter table public.recordings enable row level security;
alter table public.interpretations enable row level security;
alter table public.feedback enable row level security;
alter table public.pet_patterns enable row level security;
alter table public.model_versions enable row level security;
alter table public.ai_evaluations enable row level security;

create policy pets_select_own on public.pets for select to authenticated using ((select auth.uid()) = owner_id);
create policy pets_insert_own on public.pets for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy pets_update_own on public.pets for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy pets_delete_own on public.pets for delete to authenticated using ((select auth.uid()) = owner_id);
create policy recordings_select_own on public.recordings for select to authenticated using (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = (select auth.uid())));
create policy recordings_insert_own on public.recordings for insert to authenticated with check (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = (select auth.uid())));
create policy recordings_delete_own on public.recordings for delete to authenticated using (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = (select auth.uid())));
create policy interpretations_select_own on public.interpretations for select to authenticated using (exists (select 1 from public.recordings r join public.pets p on p.id = r.pet_id where r.id = recording_id and p.owner_id = (select auth.uid())));
create policy interpretations_insert_own on public.interpretations for insert to authenticated with check (exists (select 1 from public.recordings r join public.pets p on p.id = r.pet_id where r.id = recording_id and p.owner_id = (select auth.uid())));
create policy feedback_select_own on public.feedback for select to authenticated using (exists (select 1 from public.interpretations i join public.recordings r on r.id = i.recording_id join public.pets p on p.id = r.pet_id where i.id = interpretation_id and p.owner_id = (select auth.uid())));
create policy feedback_insert_own on public.feedback for insert to authenticated with check (exists (select 1 from public.interpretations i join public.recordings r on r.id = i.recording_id join public.pets p on p.id = r.pet_id where i.id = interpretation_id and p.owner_id = (select auth.uid())));
create policy pet_patterns_select_own on public.pet_patterns for select to authenticated using (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = (select auth.uid())));
create policy pet_patterns_insert_own on public.pet_patterns for insert to authenticated with check (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = (select auth.uid())));
create policy pet_patterns_update_own on public.pet_patterns for update to authenticated using (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = (select auth.uid()))) with check (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = (select auth.uid())));
create policy pet_patterns_delete_own on public.pet_patterns for delete to authenticated using (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = (select auth.uid())));
create policy model_versions_select_authenticated on public.model_versions for select to authenticated using (true);
create policy ai_evaluations_select_own on public.ai_evaluations for select to authenticated using (exists (select 1 from public.interpretations i join public.recordings r on r.id = i.recording_id join public.pets p on p.id = r.pet_id where i.id = interpretation_id and p.owner_id = (select auth.uid())));

revoke all on table public.pets, public.recordings, public.interpretations, public.feedback, public.pet_patterns, public.model_versions, public.ai_evaluations from anon;
grant select, insert, update, delete on public.pets to authenticated;
grant select, insert, delete on public.recordings to authenticated;
grant select, insert on public.interpretations to authenticated;
grant select, insert on public.feedback to authenticated;
grant select, insert, update, delete on public.pet_patterns to authenticated;
grant select on public.model_versions to authenticated;
grant select on public.ai_evaluations to authenticated;

insert into storage.buckets (id, name, public) values ('pet-recordings','pet-recordings',false) on conflict (id) do update set public=false;
create policy pet_recordings_insert_own on storage.objects for insert to authenticated with check (bucket_id = 'pet-recordings' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy pet_recordings_select_own on storage.objects for select to authenticated using (bucket_id = 'pet-recordings' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy pet_recordings_delete_own on storage.objects for delete to authenticated using (bucket_id = 'pet-recordings' and (storage.foldername(name))[1] = (select auth.uid()::text));
