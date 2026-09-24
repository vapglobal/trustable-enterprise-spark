alter table public.evidence add column covered_controls text[] not null default '{}';
alter table public.evidence add column analysis_summary text;