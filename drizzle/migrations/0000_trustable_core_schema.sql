
create extension if not exists pgcrypto with schema extensions;

create type public.app_role as enum ('owner','admin','operator','auditor');

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sector text not null default 'Enterprise',
  created_at timestamptz not null default now()
);
grant select on public.tenants to authenticated;
grant all on public.tenants to service_role;
alter table public.tenants enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  role public.app_role not null,
  email text,
  created_at timestamptz not null default now(),
  unique (user_id, tenant_id)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.is_member(_user uuid, _tenant uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user and tenant_id = _tenant)
$$;

create or replace function public.has_tenant_role(_user uuid, _tenant uuid, _roles public.app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user and tenant_id = _tenant and role = any(_roles))
$$;

create policy "members read tenant" on public.tenants for select to authenticated
  using (public.is_member(auth.uid(), id));
create policy "read own role" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_tenant_role(auth.uid(), tenant_id, array['owner','admin','auditor']::public.app_role[]));

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  email text not null,
  role public.app_role not null,
  display_name text,
  accepted_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  unique (tenant_id, email)
);
grant select on public.invites to authenticated;
grant all on public.invites to service_role;
alter table public.invites enable row level security;
create policy "admins read invites" on public.invites for select to authenticated
  using (public.has_tenant_role(auth.uid(), tenant_id, array['owner','admin']::public.app_role[]));

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  headcount int not null default 10,
  loaded_hourly_rate numeric not null default 95,
  created_at timestamptz not null default now()
);
grant select on public.departments to authenticated;
grant all on public.departments to service_role;
alter table public.departments enable row level security;
create policy "members read departments" on public.departments for select to authenticated
  using (public.is_member(auth.uid(), tenant_id));

create table public.flow_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  operator_label text not null,
  task text not null,
  decision jsonb not null default '{}'::jsonb,
  status text not null default 'executed',
  minutes_saved int not null default 0,
  created_by uuid,
  created_at timestamptz not null default now()
);
grant select, insert on public.flow_runs to authenticated;
grant all on public.flow_runs to service_role;
alter table public.flow_runs enable row level security;
create policy "members read runs" on public.flow_runs for select to authenticated
  using (public.is_member(auth.uid(), tenant_id));
create policy "operators create runs" on public.flow_runs for insert to authenticated
  with check (created_by = auth.uid()
    and public.has_tenant_role(auth.uid(), tenant_id, array['owner','admin','operator']::public.app_role[]));

create table public.audit_ledger (
  id bigserial primary key,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  seq int not null,
  event text not null,
  actor text not null,
  payload jsonb not null default '{}'::jsonb,
  prev_hash text not null,
  block_hash text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, seq)
);
grant select on public.audit_ledger to authenticated;
grant all on public.audit_ledger to service_role;
alter table public.audit_ledger enable row level security;
create policy "members read ledger" on public.audit_ledger for select to authenticated
  using (public.is_member(auth.uid(), tenant_id));

create or replace function public.ledger_block_immutable()
returns trigger language plpgsql set search_path = public as $$
begin
  raise exception 'audit_ledger is append-only';
end $$;
create trigger audit_ledger_no_update before update or delete on public.audit_ledger
  for each row execute function public.ledger_block_immutable();

create or replace function public.ledger_hash(_prev text, _event text, _actor text, _payload jsonb, _ts timestamptz)
returns text language sql immutable set search_path = public, extensions as $$
  select 'sha512-' || encode(extensions.digest(_prev || '|' || _event || '|' || _actor || '|' || _payload::text || '|' || to_char(_ts at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'), 'sha512'), 'hex')
$$;

create or replace function public.ledger_append_internal(_tenant uuid, _event text, _actor text, _payload jsonb, _ts timestamptz default now())
returns public.audit_ledger language plpgsql security definer set search_path = public as $$
declare
  _prev text; _seq int; _row public.audit_ledger;
begin
  perform pg_advisory_xact_lock(hashtext(_tenant::text));
  select block_hash, seq into _prev, _seq from public.audit_ledger where tenant_id = _tenant order by seq desc limit 1;
  if _prev is null then _prev := 'GENESIS'; _seq := 0; end if;
  insert into public.audit_ledger(tenant_id, seq, event, actor, payload, prev_hash, block_hash, created_at)
  values (_tenant, _seq + 1, _event, _actor, _payload, _prev, public.ledger_hash(_prev, _event, _actor, _payload, _ts), _ts)
  returning * into _row;
  return _row;
end $$;
revoke all on function public.ledger_append_internal(uuid, text, text, jsonb, timestamptz) from public, anon, authenticated;
grant execute on function public.ledger_append_internal(uuid, text, text, jsonb, timestamptz) to service_role;

create or replace function public.append_ledger(_tenant uuid, _event text, _payload jsonb)
returns public.audit_ledger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_member(auth.uid(), _tenant) then raise exception 'forbidden'; end if;
  if _event !~ '^[a-z_]+\.[a-z_]+$' then raise exception 'invalid event'; end if;
  return public.ledger_append_internal(_tenant, _event, coalesce((select email from public.user_roles where user_id = auth.uid() and tenant_id = _tenant), auth.uid()::text), _payload, now());
end $$;
revoke all on function public.append_ledger(uuid, text, jsonb) from public, anon;
grant execute on function public.append_ledger(uuid, text, jsonb) to authenticated;

create or replace function public.verify_ledger(_tenant uuid, _tamper_seq int default null, _tamper_payload jsonb default null)
returns table(seq int, event text, stored_hash text, computed_hash text, link_ok boolean, hash_ok boolean)
language plpgsql stable security definer set search_path = public as $$
declare r record; _prev text := 'GENESIS'; _computed text; _p jsonb;
begin
  if not public.is_member(auth.uid(), _tenant) then raise exception 'forbidden'; end if;
  for r in select * from public.audit_ledger l where l.tenant_id = _tenant order by l.seq loop
    _p := case when r.seq = _tamper_seq and _tamper_payload is not null then _tamper_payload else r.payload end;
    _computed := public.ledger_hash(r.prev_hash, r.event, r.actor, _p, r.created_at);
    seq := r.seq; event := r.event; stored_hash := r.block_hash; computed_hash := _computed;
    link_ok := (r.prev_hash = _prev); hash_ok := (_computed = r.block_hash);
    return next;
    _prev := r.block_hash;
  end loop;
end $$;
revoke all on function public.verify_ledger(uuid, int, jsonb) from public, anon;
grant execute on function public.verify_ledger(uuid, int, jsonb) to authenticated;

insert into public.tenants(id, name, slug, sector) values
 ('11111111-1111-4111-8111-111111111111','Meridian Global Holdings (Demo)','meridian','Financial Services'),
 ('22222222-2222-4222-8222-222222222222','Northwind Health (Isolation Target)','northwind','Healthcare');

insert into public.departments(id, tenant_id, name, headcount, loaded_hourly_rate) values
 ('a0000000-0000-4000-8000-000000000001','11111111-1111-4111-8111-111111111111','Sales Operations',120,95),
 ('a0000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111','Executive Operations',40,140),
 ('a0000000-0000-4000-8000-000000000003','11111111-1111-4111-8111-111111111111','Security & Compliance',25,165),
 ('a0000000-0000-4000-8000-000000000004','11111111-1111-4111-8111-111111111111','Global Operations',300,110),
 ('a0000000-0000-4000-8000-000000000005','11111111-1111-4111-8111-111111111111','Office of the CIO',15,210),
 ('b0000000-0000-4000-8000-000000000001','22222222-2222-4222-8222-222222222222','Clinical Trial Ops',80,150);

insert into public.flow_runs(tenant_id, department_id, operator_label, task, decision, status, minutes_saved, created_at) values
 ('11111111-1111-4111-8111-111111111111','a0000000-0000-4000-8000-000000000001','Bob Henderson','Reconcile 400-row Monday pipeline spreadsheet and email VP summary','{"action":"AUTOMATE","category":"reconciliation","confidence":0.94}','executed',35, now() - interval '41 days'),
 ('11111111-1111-4111-8111-111111111111','a0000000-0000-4000-8000-000000000001','Bob Henderson','Archive weekly report to Dropbox with retention tag','{"action":"AUTOMATE","category":"filing","confidence":0.91}','executed',15, now() - interval '38 days'),
 ('11111111-1111-4111-8111-111111111111','a0000000-0000-4000-8000-000000000002','Sally Martinez','Meeting notes to action matrix: 5 leadership syncs, 42 action items to Jira & Salesforce','{"action":"AUTOMATE","category":"meeting_actions","confidence":0.93}','executed',210, now() - interval '34 days'),
 ('11111111-1111-4111-8111-111111111111','a0000000-0000-4000-8000-000000000002','Sally Martinez','Daily executive morning briefing broadcast','{"action":"AUTOMATE","category":"reporting","confidence":0.9}','executed',25, now() - interval '31 days'),
 ('11111111-1111-4111-8111-111111111111','a0000000-0000-4000-8000-000000000003','Kathy Chen','Quarterly vendor access review across 14 SaaS tools','{"action":"REVIEW","category":"access_review","confidence":0.62}','review',0, now() - interval '27 days'),
 ('11111111-1111-4111-8111-111111111111','a0000000-0000-4000-8000-000000000003','Kathy Chen','Zero-PII verification sweep of flow telemetry','{"action":"AUTOMATE","category":"compliance","confidence":0.96}','executed',90, now() - interval '24 days'),
 ('11111111-1111-4111-8111-111111111111','a0000000-0000-4000-8000-000000000004','Diane Foster','Aggregate ROI rollup across 500 team members for budget request','{"action":"AUTOMATE","category":"reporting","confidence":0.92}','executed',120, now() - interval '14 days'),
 ('11111111-1111-4111-8111-111111111111','a0000000-0000-4000-8000-000000000004','Diane Foster','Supplier delay escalation routing','{"action":"AUTOMATE","category":"escalation","confidence":0.88}','executed',45, now() - interval '10 days'),
 ('11111111-1111-4111-8111-111111111111','a0000000-0000-4000-8000-000000000005','Frank Kowalski','SSO onboarding checklist for regional fleet rollout','{"action":"AUTOMATE","category":"provisioning","confidence":0.9}','executed',60, now() - interval '4 days'),
 ('22222222-2222-4222-8222-222222222222','b0000000-0000-4000-8000-000000000001','Dr. R. Patel','CONFIDENTIAL patient cohort intake summary','{"action":"AUTOMATE","category":"clinical","confidence":0.9}','executed',50, now() - interval '3 days');

do $$
declare t uuid := '11111111-1111-4111-8111-111111111111';
begin
  perform public.ledger_append_internal(t,'tenant.provisioned','system','{"tenant":"Meridian Global Holdings","region":"us-west","isolation":"row_level"}', now() - interval '45 days');
  perform public.ledger_append_internal(t,'policy.enforced','system','{"policy":"zero_egress","mode":"airgap","firewallRulesAudited":4,"status":"CONTAINMENT_PASS_100_PERCENT","source":"VAULTABLE_ZERO_EGRESS_AUDIT_RECEIPT"}', now() - interval '44 days');
  perform public.ledger_append_internal(t,'flow.executed','Bob Henderson','{"task":"Monday pipeline reconciliation","minutesSaved":35}', now() - interval '41 days');
  perform public.ledger_append_internal(t,'flow.executed','Sally Martinez','{"scenario":"Sally''s Meeting Notes to Action Matrix","department":"Executive Operations","minutesSaved":210,"steps":4,"source":"TRUSTABLE_FLOW_AUDIT_RECEIPT"}', now() - interval '34 days');
  perform public.ledger_append_internal(t,'flow.review_queued','Kathy Chen','{"task":"Vendor access review","reason":"confidence below 0.70 threshold"}', now() - interval '27 days');
  perform public.ledger_append_internal(t,'compliance.verified','Kathy Chen','{"check":"zero_pii","result":"pass","recordsScanned":1842}', now() - interval '24 days');
  perform public.ledger_append_internal(t,'flow.executed','Diane Foster','{"task":"ROI rollup","minutesSaved":120}', now() - interval '14 days');
  perform public.ledger_append_internal(t,'flow.executed','Frank Kowalski','{"task":"SSO fleet onboarding","minutesSaved":60}', now() - interval '4 days');
  perform public.ledger_append_internal('22222222-2222-4222-8222-222222222222','tenant.provisioned','system','{"tenant":"Northwind Health"}', now() - interval '5 days');
end $$;
