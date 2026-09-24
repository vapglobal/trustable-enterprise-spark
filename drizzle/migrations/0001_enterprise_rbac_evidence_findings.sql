-- Permission catalog
create table public.permissions (
  key text primary key,
  area text not null,
  description text not null
);
grant select on public.permissions to authenticated;
grant all on public.permissions to service_role;
alter table public.permissions enable row level security;
create policy "authenticated read catalog" on public.permissions for select to authenticated using (true);

insert into public.permissions(key, area, description) values
 ('overview.view','Overview','View tenant overview and ROI'),
 ('posture.view','Posture','View security posture dashboard'),
 ('flow.view','Flow','View flow runs'),
 ('flow.run','Flow','Run bounded AI flows'),
 ('ciso.view','CISO','Open CISO console'),
 ('ledger.verify','CISO','Verify the audit hash chain'),
 ('report.export','CISO','Export signed surface report'),
 ('redteam.run','Red Team','Run live red-team attacks'),
 ('evidence.view','Evidence','View submitted evidence'),
 ('evidence.upload','Evidence','Submit evidence'),
 ('evidence.analyze','Evidence','Run AI control-gap analysis'),
 ('findings.manage','Evidence','Assign owners and update findings'),
 ('audit.view','Audit','View the audit log'),
 ('audit.export','Audit','Export the audit log as CSV'),
 ('access.view','Access','View members, roles and groups'),
 ('access.invite','Access','Invite members'),
 ('access.manage','Access','Manage roles, groups and user overrides');

-- Configurable tenant roles
create table public.tenant_roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  unique (tenant_id, key)
);
create table public.role_permissions (
  role_id uuid not null references public.tenant_roles(id) on delete cascade,
  permission text not null references public.permissions(key),
  primary key (role_id, permission)
);
create table public.member_roles (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null,
  role_id uuid not null references public.tenant_roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);
create table public.access_groups (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (tenant_id, name)
);
create table public.group_members (
  group_id uuid not null references public.access_groups(id) on delete cascade,
  user_id uuid not null,
  primary key (group_id, user_id)
);
create table public.group_permissions (
  group_id uuid not null references public.access_groups(id) on delete cascade,
  permission text not null references public.permissions(key),
  primary key (group_id, permission)
);
create table public.user_permission_overrides (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null,
  permission text not null references public.permissions(key),
  effect text not null check (effect in ('grant','deny')),
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id, permission)
);

-- Resolution: deny override wins; owner system role holds all; else role, group or grant.
create or replace function public.has_permission(_user uuid, _tenant uuid, _perm text)
returns boolean language sql stable security definer set search_path = public as $$
  select
    public.is_member(_user, _tenant)
    and not exists (select 1 from user_permission_overrides where tenant_id=_tenant and user_id=_user and permission=_perm and effect='deny')
    and (
      exists (select 1 from user_roles where user_id=_user and tenant_id=_tenant and role='owner')
      or exists (select 1 from member_roles mr join role_permissions rp on rp.role_id=mr.role_id where mr.user_id=_user and mr.tenant_id=_tenant and rp.permission=_perm)
      or exists (select 1 from tenant_roles tr join role_permissions rp on rp.role_id=tr.id join user_roles ur on ur.tenant_id=tr.tenant_id and ur.role::text=tr.key and tr.is_system where ur.user_id=_user and ur.tenant_id=_tenant and rp.permission=_perm)
      or exists (select 1 from group_members gm join access_groups g on g.id=gm.group_id join group_permissions gp on gp.group_id=g.id where gm.user_id=_user and g.tenant_id=_tenant and gp.permission=_perm)
      or exists (select 1 from user_permission_overrides where tenant_id=_tenant and user_id=_user and permission=_perm and effect='grant')
    )
$$;

create or replace function public.my_permissions(_tenant uuid)
returns setof text language sql stable security definer set search_path = public as $$
  select p.key from permissions p where public.has_permission(auth.uid(), _tenant, p.key)
$$;

grant select on public.tenant_roles, public.role_permissions, public.member_roles, public.access_groups, public.group_members, public.group_permissions, public.user_permission_overrides to authenticated;
grant all on public.tenant_roles, public.role_permissions, public.member_roles, public.access_groups, public.group_members, public.group_permissions, public.user_permission_overrides to service_role;
alter table public.tenant_roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.member_roles enable row level security;
alter table public.access_groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_permissions enable row level security;
alter table public.user_permission_overrides enable row level security;
create policy "access viewers read roles" on public.tenant_roles for select to authenticated using (public.has_permission(auth.uid(), tenant_id, 'access.view'));
create policy "access viewers read role perms" on public.role_permissions for select to authenticated using (exists (select 1 from public.tenant_roles r where r.id=role_id and public.has_permission(auth.uid(), r.tenant_id, 'access.view')));
create policy "access viewers read member roles" on public.member_roles for select to authenticated using (user_id = auth.uid() or public.has_permission(auth.uid(), tenant_id, 'access.view'));
create policy "access viewers read groups" on public.access_groups for select to authenticated using (public.has_permission(auth.uid(), tenant_id, 'access.view'));
create policy "access viewers read group members" on public.group_members for select to authenticated using (user_id = auth.uid() or exists (select 1 from public.access_groups g where g.id=group_id and public.has_permission(auth.uid(), g.tenant_id, 'access.view')));
create policy "access viewers read group perms" on public.group_permissions for select to authenticated using (exists (select 1 from public.access_groups g where g.id=group_id and public.has_permission(auth.uid(), g.tenant_id, 'access.view')));
create policy "access viewers read overrides" on public.user_permission_overrides for select to authenticated using (user_id = auth.uid() or public.has_permission(auth.uid(), tenant_id, 'access.view'));

-- System roles per tenant (least privilege)
insert into public.tenant_roles(tenant_id, key, name, description, is_system)
select t.id, r.key, r.name, r.descr, true from public.tenants t
cross join (values
  ('owner','Owner','Full control; bound to the secured owner identity'),
  ('admin','Administrator','Manages access and security operations'),
  ('operator','Operator','Runs flows and submits evidence'),
  ('auditor','Auditor','Read-only oversight and exports')
) as r(key,name,descr);

insert into public.role_permissions(role_id, permission)
select tr.id, p.perm from public.tenant_roles tr
join (values
  ('admin','overview.view'),('admin','posture.view'),('admin','flow.view'),('admin','flow.run'),('admin','ciso.view'),('admin','ledger.verify'),('admin','report.export'),('admin','redteam.run'),('admin','evidence.view'),('admin','evidence.upload'),('admin','evidence.analyze'),('admin','findings.manage'),('admin','audit.view'),('admin','audit.export'),('admin','access.view'),('admin','access.invite'),
  ('operator','overview.view'),('operator','flow.view'),('operator','flow.run'),('operator','evidence.view'),('operator','evidence.upload'),
  ('auditor','overview.view'),('auditor','posture.view'),('auditor','flow.view'),('auditor','ciso.view'),('auditor','ledger.verify'),('auditor','report.export'),('auditor','evidence.view'),('auditor','audit.view'),('auditor','audit.export'),('auditor','access.view')
) as p(role,perm) on p.role = tr.key
where tr.is_system;

-- Evidence
create table public.evidence (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  kind text not null check (kind in ('architecture','policy','compliance')),
  framework text,
  content text not null default '',
  image_data text,
  created_by uuid,
  created_by_email text,
  analyzed_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert on public.evidence to authenticated;
grant all on public.evidence to service_role;
alter table public.evidence enable row level security;
create policy "evidence viewers read" on public.evidence for select to authenticated using (public.has_permission(auth.uid(), tenant_id, 'evidence.view'));
create policy "evidence uploaders insert" on public.evidence for insert to authenticated with check (created_by = auth.uid() and public.has_permission(auth.uid(), tenant_id, 'evidence.upload'));

-- Findings
create table public.security_findings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  evidence_id uuid references public.evidence(id) on delete set null,
  control_id text not null,
  title text not null,
  severity text not null check (severity in ('critical','high','medium','low')),
  priority integer not null default 3,
  gap text not null,
  remediation text not null,
  status text not null default 'open' check (status in ('open','in_progress','resolved','accepted')),
  owner_email text,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.security_findings to authenticated;
grant all on public.security_findings to service_role;
alter table public.security_findings enable row level security;
create policy "findings viewers read" on public.security_findings for select to authenticated using (public.has_permission(auth.uid(), tenant_id, 'evidence.view') or public.has_permission(auth.uid(), tenant_id, 'posture.view'));
create policy "analysts insert findings" on public.security_findings for insert to authenticated with check (public.has_permission(auth.uid(), tenant_id, 'evidence.analyze'));
create policy "managers update findings" on public.security_findings for update to authenticated using (public.has_permission(auth.uid(), tenant_id, 'findings.manage')) with check (public.has_permission(auth.uid(), tenant_id, 'findings.manage'));

create policy "analysts mark evidence analyzed" on public.evidence for update to authenticated using (public.has_permission(auth.uid(), tenant_id, 'evidence.analyze')) with check (public.has_permission(auth.uid(), tenant_id, 'evidence.analyze'));
grant update on public.evidence to authenticated;
