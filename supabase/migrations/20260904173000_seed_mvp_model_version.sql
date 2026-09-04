insert into public.model_versions(version, notes)
values ('mvp-rule-engine-0.3', 'Authenticated pet-scoped audio ingestion, deterministic interpretation contract, owner feedback memory loop.')
on conflict (version) do update set notes = excluded.notes;
