-- PET AI security model
-- Application data is private to the authenticated owner.

alter table pets enable row level security;
alter table recordings enable row level security;
alter table interpretations enable row level security;
alter table feedback enable row level security;
alter table pet_patterns enable row level security;
alter table model_versions enable row level security;
alter table ai_evaluations enable row level security;

create policy "owners manage their pets" on pets
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "owners manage their recordings" on recordings
  for all to authenticated
  using (exists (select 1 from pets where pets.id = recordings.pet_id and pets.owner_id = auth.uid()))
  with check (exists (select 1 from pets where pets.id = recordings.pet_id and pets.owner_id = auth.uid()));

create policy "owners read their interpretations" on interpretations
  for select to authenticated
  using (exists (select 1 from recordings join pets on pets.id = recordings.pet_id where recordings.id = interpretations.recording_id and pets.owner_id = auth.uid()));

create policy "owners create their interpretations" on interpretations
  for insert to authenticated
  with check (exists (select 1 from recordings join pets on pets.id = recordings.pet_id where recordings.id = interpretations.recording_id and pets.owner_id = auth.uid()));

create policy "owners read their feedback" on feedback
  for select to authenticated
  using (exists (select 1 from interpretations join recordings on recordings.id = interpretations.recording_id join pets on pets.id = recordings.pet_id where interpretations.id = feedback.interpretation_id and pets.owner_id = auth.uid()));

create policy "owners create their feedback" on feedback
  for insert to authenticated
  with check (exists (select 1 from interpretations join recordings on recordings.id = interpretations.recording_id join pets on pets.id = recordings.pet_id where interpretations.id = feedback.interpretation_id and pets.owner_id = auth.uid()));

create policy "owners manage their pet patterns" on pet_patterns
  for all to authenticated
  using (exists (select 1 from pets where pets.id = pet_patterns.pet_id and pets.owner_id = auth.uid()))
  with check (exists (select 1 from pets where pets.id = pet_patterns.pet_id and pets.owner_id = auth.uid()));

create policy "authenticated read model versions" on model_versions
  for select to authenticated using (true);

create policy "owners read their evaluations" on ai_evaluations
  for select to authenticated
  using (exists (select 1 from interpretations join recordings on recordings.id = interpretations.recording_id join pets on pets.id = recordings.pet_id where interpretations.id = ai_evaluations.interpretation_id and pets.owner_id = auth.uid()));

-- Private bucket for recordings. Create this bucket in the Storage dashboard or via the Storage API.
insert into storage.buckets (id, name, public)
values ('pet-recordings', 'pet-recordings', false)
on conflict (id) do update set public = excluded.public;

create policy "owners upload pet recordings" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'pet-recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owners read pet recordings" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'pet-recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owners delete pet recordings" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'pet-recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
