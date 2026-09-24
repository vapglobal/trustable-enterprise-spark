import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DEMO_TENANT_ID } from "./tenant";
import { type Ctx, ledger, myRole, requirePerm, ownerEmail } from "./authz.server";
import { CONTROLS } from "./controls";
import type { Json } from "@/integrations/supabase/types";

const auth = requireSupabaseAuth;
const c = (x: unknown) => x as Ctx;
const uuid = z.string().uuid();
const permKey = z.string().regex(/^[a-z_]+\.[a-z_]+$/);

async function admin() {
  return (await import("@/integrations/supabase/client.server")).supabaseAdmin;
}
async function assertNotOwnerTarget(userId: string) {
  const a = await admin();
  const { data } = await a.from("user_roles").select("role").eq("tenant_id", DEMO_TENANT_ID).eq("user_id", userId).maybeSingle();
  if (data?.role === "owner") throw new Error("The owner account cannot be changed here");
}

/* ------------------------------ RBAC ------------------------------ */

export const getRbac = createServerFn({ method: "GET" })
  .middleware([auth])
  .handler(async ({ context }) => {
    const ctx = c(context);
    await requirePerm(ctx, "access.view");
    const a = await admin();
    const [perms, roles, rp, mr, groups, gm, gp, ov, members] = await Promise.all([
      a.from("permissions").select("key, area, description").order("key"),
      a.from("tenant_roles").select("id, key, name, description, is_system").eq("tenant_id", DEMO_TENANT_ID).order("is_system", { ascending: false }).order("name"),
      a.from("role_permissions").select("role_id, permission"),
      a.from("member_roles").select("user_id, role_id").eq("tenant_id", DEMO_TENANT_ID),
      a.from("access_groups").select("id, name, description").eq("tenant_id", DEMO_TENANT_ID).order("name"),
      a.from("group_members").select("group_id, user_id"),
      a.from("group_permissions").select("group_id, permission"),
      a.from("user_permission_overrides").select("user_id, permission, effect").eq("tenant_id", DEMO_TENANT_ID),
      a.from("user_roles").select("user_id, email, role, created_at").eq("tenant_id", DEMO_TENANT_ID).order("created_at"),
    ]);
    const { data: list } = await a.auth.admin.listUsers({ perPage: 1000 });
    const byId = new Map((list?.users ?? []).map((u) => [u.id, u]));
    const roleIds = new Set((roles.data ?? []).map((r) => r.id));
    const groupIds = new Set((groups.data ?? []).map((g) => g.id));
    const canManage = !!(await ctx.supabase.rpc("has_permission", { _user: ctx.userId, _tenant: DEMO_TENANT_ID, _perm: "access.manage" })).data;
    return {
      canManage,
      isOwner: (await myRole(ctx)) === "owner",
      permissions: perms.data ?? [],
      roles: (roles.data ?? []).map((r) => ({ ...r, permissions: (rp.data ?? []).filter((x) => x.role_id === r.id).map((x) => x.permission) })),
      groups: (groups.data ?? []).map((g) => ({
        ...g,
        permissions: (gp.data ?? []).filter((x) => x.group_id === g.id).map((x) => x.permission),
        members: (gm.data ?? []).filter((x) => x.group_id === g.id).map((x) => x.user_id),
      })),
      members: (members.data ?? []).map((m) => {
        const u = byId.get(m.user_id);
        const bannedUntil = (u as { banned_until?: string } | undefined)?.banned_until;
        return {
          userId: m.user_id,
          email: m.email ?? u?.email ?? "",
          systemRole: m.role,
          customRoles: (mr.data ?? []).filter((x) => x.user_id === m.user_id && roleIds.has(x.role_id)).map((x) => x.role_id),
          groups: (gm.data ?? []).filter((x) => x.user_id === m.user_id && groupIds.has(x.group_id)).map((x) => x.group_id),
          overrides: (ov.data ?? []).filter((x) => x.user_id === m.user_id).map((x) => ({ permission: x.permission, effect: x.effect })),
          suspended: !!bannedUntil && new Date(bannedUntil) > new Date(),
          lastSignIn: u?.last_sign_in_at ?? null,
          confirmed: !!u?.email_confirmed_at,
        };
      }),
    };
  });

export const saveRole = createServerFn({ method: "POST" })
  .middleware([auth])
  .inputValidator((d) =>
    z.object({ id: uuid.optional(), name: z.string().trim().min(2).max(60), description: z.string().trim().max(200).optional(), permissions: z.array(permKey).max(50) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const ctx = c(context);
    await requirePerm(ctx, "access.manage");
    const a = await admin();
    let id = data.id;
    if (id) {
      const { data: r } = await a.from("tenant_roles").select("key, tenant_id").eq("id", id).single();
      if (!r || r.tenant_id !== DEMO_TENANT_ID) throw new Error("Role not found");
      if (r.key === "owner") throw new Error("The owner role is fixed");
      await a.from("tenant_roles").update({ name: data.name, description: data.description ?? null }).eq("id", id);
    } else {
      const key = "custom_" + data.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40);
      const { data: r, error } = await a.from("tenant_roles").insert({ tenant_id: DEMO_TENANT_ID, key, name: data.name, description: data.description ?? null }).select("id").single();
      if (error) throw new Error("A role with that name already exists");
      id = r.id;
    }
    await a.from("role_permissions").delete().eq("role_id", id!);
    if (data.permissions.length) await a.from("role_permissions").insert(data.permissions.map((p) => ({ role_id: id!, permission: p })));
    await ledger(ctx, data.id ? "admin.role_updated" : "admin.role_created", { roleId: id, name: data.name, permissions: data.permissions });
    return { id };
  });

export const deleteRole = createServerFn({ method: "POST" })
  .middleware([auth])
  .inputValidator((d) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    const ctx = c(context);
    await requirePerm(ctx, "access.manage");
    const a = await admin();
    const { data: r } = await a.from("tenant_roles").select("is_system, name, tenant_id").eq("id", data.id).single();
    if (!r || r.tenant_id !== DEMO_TENANT_ID || r.is_system) throw new Error("System roles cannot be deleted");
    await a.from("tenant_roles").delete().eq("id", data.id);
    await ledger(ctx, "admin.role_deleted", { roleId: data.id, name: r.name });
    return { ok: true };
  });

export const saveGroup = createServerFn({ method: "POST" })
  .middleware([auth])
  .inputValidator((d) =>
    z.object({ id: uuid.optional(), name: z.string().trim().min(2).max(60), description: z.string().trim().max(200).optional(), permissions: z.array(permKey).max(50), members: z.array(uuid).max(500) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const ctx = c(context);
    await requirePerm(ctx, "access.manage");
    const a = await admin();
    let id = data.id;
    if (id) {
      const { data: g } = await a.from("access_groups").select("tenant_id").eq("id", id).single();
      if (!g || g.tenant_id !== DEMO_TENANT_ID) throw new Error("Group not found");
      await a.from("access_groups").update({ name: data.name, description: data.description ?? null }).eq("id", id);
    } else {
      const { data: g, error } = await a.from("access_groups").insert({ tenant_id: DEMO_TENANT_ID, name: data.name, description: data.description ?? null }).select("id").single();
      if (error) throw new Error("A group with that name already exists");
      id = g.id;
    }
    const { data: valid } = await a.from("user_roles").select("user_id").eq("tenant_id", DEMO_TENANT_ID).in("user_id", data.members.length ? data.members : ["00000000-0000-0000-0000-000000000000"]);
    const members = (valid ?? []).map((v) => v.user_id);
    await a.from("group_permissions").delete().eq("group_id", id!);
    await a.from("group_members").delete().eq("group_id", id!);
    if (data.permissions.length) await a.from("group_permissions").insert(data.permissions.map((p) => ({ group_id: id!, permission: p })));
    if (members.length) await a.from("group_members").insert(members.map((u) => ({ group_id: id!, user_id: u })));
    await ledger(ctx, data.id ? "admin.group_updated" : "admin.group_created", { groupId: id, name: data.name, permissions: data.permissions, members: members.length });
    return { id };
  });

export const deleteGroup = createServerFn({ method: "POST" })
  .middleware([auth])
  .inputValidator((d) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    const ctx = c(context);
    await requirePerm(ctx, "access.manage");
    const a = await admin();
    await a.from("access_groups").delete().eq("id", data.id).eq("tenant_id", DEMO_TENANT_ID);
    await ledger(ctx, "admin.group_deleted", { groupId: data.id });
    return { ok: true };
  });

export const updateMember = createServerFn({ method: "POST" })
  .middleware([auth])
  .inputValidator((d) =>
    z.object({
      userId: uuid,
      systemRole: z.enum(["admin", "operator", "auditor"]),
      customRoles: z.array(uuid).max(20),
      overrides: z.array(z.object({ permission: permKey, effect: z.enum(["grant", "deny"]) })).max(50),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const ctx = c(context);
    await requirePerm(ctx, "access.manage");
    await assertNotOwnerTarget(data.userId);
    if (data.systemRole === "admin" && (await myRole(ctx)) !== "owner") throw new Error("Only the owner can grant admin");
    const a = await admin();
    const { data: m } = await a.from("user_roles").select("id").eq("tenant_id", DEMO_TENANT_ID).eq("user_id", data.userId).single();
    if (!m) throw new Error("Member not found");
    await a.from("user_roles").update({ role: data.systemRole }).eq("id", m.id);
    const { data: roles } = await a.from("tenant_roles").select("id").eq("tenant_id", DEMO_TENANT_ID).eq("is_system", false).in("id", data.customRoles.length ? data.customRoles : ["00000000-0000-0000-0000-000000000000"]);
    await a.from("member_roles").delete().eq("tenant_id", DEMO_TENANT_ID).eq("user_id", data.userId);
    if (roles?.length) await a.from("member_roles").insert(roles.map((r) => ({ tenant_id: DEMO_TENANT_ID, user_id: data.userId, role_id: r.id })));
    await a.from("user_permission_overrides").delete().eq("tenant_id", DEMO_TENANT_ID).eq("user_id", data.userId);
    if (data.overrides.length) await a.from("user_permission_overrides").insert(data.overrides.map((o) => ({ tenant_id: DEMO_TENANT_ID, user_id: data.userId, ...o })));
    await ledger(ctx, "admin.member_updated", { userId: data.userId, systemRole: data.systemRole, customRoles: roles?.length ?? 0, overrides: data.overrides });
    return { ok: true };
  });

/* ------------------------ User lifecycle ------------------------ */

export const createUser = createServerFn({ method: "POST" })
  .middleware([auth])
  .inputValidator((d) =>
    z.object({ email: z.string().trim().toLowerCase().email().max(255), role: z.enum(["admin", "operator", "auditor"]), displayName: z.string().trim().max(80).optional(), redirectTo: z.string().url() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const ctx = c(context);
    await requirePerm(ctx, "access.manage");
    if (data.role === "admin" && (await myRole(ctx)) !== "owner") throw new Error("Only the owner can create admins");
    if (data.email === ownerEmail()) throw new Error("That address is the secured owner identity");
    const a = await admin();
    const { data: inv, error } = await a.auth.admin.inviteUserByEmail(data.email, { redirectTo: data.redirectTo, data: { display_name: data.displayName ?? null } });
    if (error || !inv.user) throw new Error(error?.message ?? "Could not create user");
    await a.from("user_roles").upsert({ user_id: inv.user.id, tenant_id: DEMO_TENANT_ID, role: data.role, email: data.email }, { onConflict: "user_id,tenant_id" });
    await a.from("invites").upsert(
      { tenant_id: DEMO_TENANT_ID, email: data.email, role: data.role, display_name: data.displayName ?? null, created_by: ctx.userId, accepted_at: new Date().toISOString() },
      { onConflict: "tenant_id,email" },
    );
    await ledger(ctx, "admin.user_created", { email: data.email, role: data.role });
    return { ok: true };
  });

export const sendPasswordReset = createServerFn({ method: "POST" })
  .middleware([auth])
  .inputValidator((d) => z.object({ userId: uuid, redirectTo: z.string().url() }).parse(d))
  .handler(async ({ data, context }) => {
    const ctx = c(context);
    await requirePerm(ctx, "access.manage");
    const a = await admin();
    const { data: m } = await a.from("user_roles").select("email, role").eq("tenant_id", DEMO_TENANT_ID).eq("user_id", data.userId).single();
    if (!m?.email) throw new Error("Member not found");
    if (m.role === "owner" && data.userId !== ctx.userId) throw new Error("The owner resets their own password");
    const { error } = await ctx.supabase.auth.resetPasswordForEmail(m.email, { redirectTo: data.redirectTo });
    if (error) throw new Error(error.message);
    await ledger(ctx, "admin.password_reset_sent", { userId: data.userId });
    return { ok: true };
  });

export const setSuspended = createServerFn({ method: "POST" })
  .middleware([auth])
  .inputValidator((d) => z.object({ userId: uuid, suspended: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const ctx = c(context);
    await requirePerm(ctx, "access.manage");
    if (data.userId === ctx.userId) throw new Error("You cannot suspend yourself");
    await assertNotOwnerTarget(data.userId);
    const a = await admin();
    const { error } = await a.auth.admin.updateUserById(data.userId, { ban_duration: data.suspended ? "876000h" : "none" });
    if (error) throw new Error(error.message);
    await ledger(ctx, data.suspended ? "admin.user_suspended" : "admin.user_reinstated", { userId: data.userId });
    return { ok: true };
  });

export const removeMember = createServerFn({ method: "POST" })
  .middleware([auth])
  .inputValidator((d) => z.object({ userId: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    const ctx = c(context);
    await requirePerm(ctx, "access.manage");
    if (data.userId === ctx.userId) throw new Error("You cannot remove yourself");
    await assertNotOwnerTarget(data.userId);
    const a = await admin();
    const { data: m } = await a.from("user_roles").select("email").eq("tenant_id", DEMO_TENANT_ID).eq("user_id", data.userId).single();
    await a.from("member_roles").delete().eq("tenant_id", DEMO_TENANT_ID).eq("user_id", data.userId);
    await a.from("user_permission_overrides").delete().eq("tenant_id", DEMO_TENANT_ID).eq("user_id", data.userId);
    const { data: gs } = await a.from("access_groups").select("id").eq("tenant_id", DEMO_TENANT_ID);
    if (gs?.length) await a.from("group_members").delete().eq("user_id", data.userId).in("group_id", gs.map((g) => g.id));
    await a.from("user_roles").delete().eq("tenant_id", DEMO_TENANT_ID).eq("user_id", data.userId);
    if (m?.email) await a.from("invites").delete().eq("tenant_id", DEMO_TENANT_ID).eq("email", m.email);
    await a.auth.admin.signOut(data.userId).catch(() => undefined);
    await ledger(ctx, "admin.member_removed", { userId: data.userId });
    return { ok: true };
  });

/* --------------------------- Evidence --------------------------- */

export const listEvidence = createServerFn({ method: "GET" })
  .middleware([auth])
  .handler(async ({ context }) => {
    const ctx = c(context);
    await requirePerm(ctx, "evidence.view");
    const { data } = await ctx.supabase
      .from("evidence")
      .select("id, title, kind, framework, created_by_email, analyzed_at, created_at, covered_controls, analysis_summary")
      .eq("tenant_id", DEMO_TENANT_ID)
      .order("created_at", { ascending: false });
    return (data ?? []) as { id: string; title: string; kind: string; framework: string | null; created_by_email: string | null; analyzed_at: string | null; created_at: string; covered_controls: string[]; analysis_summary: string | null }[];
  });

export const getEvidence = createServerFn({ method: "POST" })
  .middleware([auth])
  .inputValidator((d) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    const ctx = c(context);
    await requirePerm(ctx, "evidence.view");
    const { data: e } = await ctx.supabase.from("evidence").select("id, title, kind, framework, content, image_data, created_at").eq("id", data.id).single();
    if (!e) throw new Error("Not found");
    await ledger(ctx, "evidence.viewed", { evidenceId: data.id, title: e.title });
    return e as { id: string; title: string; kind: string; framework: string | null; content: string; image_data: string | null; created_at: string };
  });

export const submitEvidence = createServerFn({ method: "POST" })
  .middleware([auth])
  .inputValidator((d) =>
    z.object({
      title: z.string().trim().min(3).max(160),
      kind: z.enum(["architecture", "policy", "compliance"]),
      framework: z.string().trim().max(60).optional(),
      content: z.string().max(200000),
      imageData: z.string().regex(/^data:image\/(png|jpeg|webp);base64,/).max(3_000_000).optional(),
    }).refine((v) => v.content.trim().length >= 20 || !!v.imageData, "Provide text (20+ characters) or a diagram image").parse(d),
  )
  .handler(async ({ data, context }) => {
    const ctx = c(context);
    await requirePerm(ctx, "evidence.upload");
    const { data: row, error } = await ctx.supabase
      .from("evidence")
      .insert({ tenant_id: DEMO_TENANT_ID, title: data.title, kind: data.kind, framework: data.framework || null, content: data.content, image_data: data.imageData ?? null, created_by: ctx.userId, created_by_email: ctx.claims.email ?? null })
      .select("id")
      .single();
    if (error) throw new Error("Could not store evidence");
    await ledger(ctx, "evidence.submitted", { evidenceId: row.id, title: data.title, kind: data.kind, hasImage: !!data.imageData });
    return { id: row.id as string };
  });

export const analyzeEvidenceFn = createServerFn({ method: "POST" })
  .middleware([auth])
  .inputValidator((d) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    const ctx = c(context);
    await requirePerm(ctx, "evidence.analyze");
    const { data: e } = await ctx.supabase.from("evidence").select("id, title, kind, framework, content, image_data").eq("id", data.id).single();
    if (!e) throw new Error("Not found");
    const { analyzeEvidence } = await import("./analyze.server");
    let result;
    try {
      result = await analyzeEvidence({ title: e.title, kind: e.kind, framework: e.framework, content: e.content, image: e.image_data });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      await ledger(ctx, "evidence.analysis_failed", { evidenceId: e.id });
      if (/402|credit/i.test(msg)) throw new Error("AI credits are exhausted. Add credits in Settings → Plans & credits.");
      if (/429|rate/i.test(msg)) throw new Error("AI is rate limited right now. Try again in a minute.");
      throw new Error("Analysis failed. Try again.");
    }
    const findings = result.findings.slice(0, 10).map((f) => ({
      tenant_id: DEMO_TENANT_ID,
      evidence_id: e.id,
      control_id: f.control_id,
      title: f.title.slice(0, 200),
      severity: f.severity,
      priority: Math.min(5, Math.max(1, f.priority)),
      gap: f.gap.slice(0, 2000),
      remediation: f.remediation.slice(0, 3000),
    }));
    if (findings.length) {
      const { error } = await ctx.supabase.from("security_findings").insert(findings);
      if (error) throw new Error("Could not record findings");
    }
    await ctx.supabase.from("evidence").update({ analyzed_at: new Date().toISOString(), covered_controls: result.covered_controls, analysis_summary: result.summary.slice(0, 1000) }).eq("id", e.id);
    await ledger(ctx, "evidence.analyzed", { evidenceId: e.id, findings: findings.length, covered: result.covered_controls });
    return { summary: result.summary, covered: result.covered_controls, findings: findings.length };
  });

/* --------------------------- Findings --------------------------- */

export const listFindings = createServerFn({ method: "GET" })
  .middleware([auth])
  .handler(async ({ context }) => {
    const ctx = c(context);
    await requirePerm(ctx, "evidence.view");
    const { data } = await ctx.supabase
      .from("security_findings")
      .select("id, evidence_id, control_id, title, severity, priority, gap, remediation, status, owner_email, due_date, created_at, updated_at")
      .eq("tenant_id", DEMO_TENANT_ID)
      .order("priority")
      .order("created_at", { ascending: false });
    const canManage = !!(await ctx.supabase.rpc("has_permission", { _user: ctx.userId, _tenant: DEMO_TENANT_ID, _perm: "findings.manage" })).data;
    return { canManage, findings: (data ?? []) as Finding[] };
  });

export type Finding = {
  id: string; evidence_id: string | null; control_id: string; title: string; severity: "critical" | "high" | "medium" | "low";
  priority: number; gap: string; remediation: string; status: "open" | "in_progress" | "resolved" | "accepted";
  owner_email: string | null; due_date: string | null; created_at: string; updated_at: string;
};

export const updateFinding = createServerFn({ method: "POST" })
  .middleware([auth])
  .inputValidator((d) =>
    z.object({
      id: uuid,
      status: z.enum(["open", "in_progress", "resolved", "accepted"]),
      ownerEmail: z.string().trim().toLowerCase().email().max(255).nullable(),
      dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const ctx = c(context);
    await requirePerm(ctx, "findings.manage");
    const { error } = await ctx.supabase
      .from("security_findings")
      .update({ status: data.status, owner_email: data.ownerEmail, due_date: data.dueDate, updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("tenant_id", DEMO_TENANT_ID);
    if (error) throw new Error("Could not update finding");
    await ledger(ctx, "findings.updated", { findingId: data.id, status: data.status, owner: data.ownerEmail, due: data.dueDate });
    return { ok: true };
  });

/* ----------------------------- Audit ----------------------------- */

const AuditFilter = z.object({
  category: z.string().regex(/^[a-z_]*$/).max(30).optional(),
  actor: z.string().max(120).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

async function queryAudit(ctx: Ctx, f: z.infer<typeof AuditFilter>, limit: number) {
  let q = ctx.supabase
    .from("audit_ledger")
    .select("seq, event, actor, payload, prev_hash, block_hash, created_at")
    .eq("tenant_id", DEMO_TENANT_ID)
    .order("seq", { ascending: false })
    .limit(limit);
  if (f.category) q = q.like("event", `${f.category}.%`);
  if (f.actor) q = q.ilike("actor", `%${f.actor.replace(/[%_]/g, "")}%`);
  if (f.from) q = q.gte("created_at", `${f.from}T00:00:00Z`);
  if (f.to) q = q.lte("created_at", `${f.to}T23:59:59.999Z`);
  const { data, error } = await q;
  if (error) throw new Error("Could not read audit log");
  return (data ?? []) as { seq: number; event: string; actor: string; payload: Json; prev_hash: string; block_hash: string; created_at: string }[];
}

export const listAudit = createServerFn({ method: "POST" })
  .middleware([auth])
  .inputValidator((d) => AuditFilter.parse(d))
  .handler(async ({ data, context }) => {
    const ctx = c(context);
    await requirePerm(ctx, "audit.view");
    const rows = await queryAudit(ctx, data, 500);
    const canExport = !!(await ctx.supabase.rpc("has_permission", { _user: ctx.userId, _tenant: DEMO_TENANT_ID, _perm: "audit.export" })).data;
    return { rows, canExport };
  });

export const exportAudit = createServerFn({ method: "POST" })
  .middleware([auth])
  .inputValidator((d) => AuditFilter.parse(d))
  .handler(async ({ data, context }) => {
    const ctx = c(context);
    await requirePerm(ctx, "audit.export");
    const rows = await queryAudit(ctx, data, 10000);
    await ledger(ctx, "audit.exported", { rows: rows.length, filters: data });
    return rows;
  });

/* ---------------------------- Posture ---------------------------- */

export const getPosture = createServerFn({ method: "GET" })
  .middleware([auth])
  .handler(async ({ context }) => {
    const ctx = c(context);
    await requirePerm(ctx, "posture.view");
    const [{ data: f }, { data: ev }, { data: verify }] = await Promise.all([
      ctx.supabase.from("security_findings").select("control_id, severity, status, owner_email, due_date, priority, title").eq("tenant_id", DEMO_TENANT_ID),
      ctx.supabase.from("evidence").select("id, title, kind, created_at, analyzed_at, covered_controls").eq("tenant_id", DEMO_TENANT_ID),
      ctx.supabase.rpc("verify_ledger", { _tenant: DEMO_TENANT_ID }),
    ]);
    const findings = (f ?? []) as Pick<Finding, "control_id" | "severity" | "status" | "owner_email" | "due_date" | "priority" | "title">[];
    const evidence = (ev ?? []) as { id: string; title: string; kind: string; created_at: string; analyzed_at: string | null; covered_controls: string[] }[];
    const open = findings.filter((x) => x.status === "open" || x.status === "in_progress");
    const W = { critical: 25, high: 12, medium: 5, low: 1 } as const;
    const risk = Math.min(100, open.reduce((a, x) => a + W[x.severity], 0));
    const today = new Date().toISOString().slice(0, 10);
    const controls = CONTROLS.map((ctl) => {
      const evidenced = evidence.some((e) => e.covered_controls?.includes(ctl.id));
      const blocking = open.filter((x) => x.control_id === ctl.id && (x.severity === "critical" || x.severity === "high")).length;
      const openCount = open.filter((x) => x.control_id === ctl.id).length;
      const status = evidenced && blocking === 0 ? "covered" : evidenced || openCount ? "partial" : "gap";
      return { ...ctl, status, openFindings: openCount };
    });
    const owners = new Map<string, { owner: string; open: number; overdue: number; critical: number }>();
    for (const x of open) {
      const k = x.owner_email ?? "Unassigned";
      const o = owners.get(k) ?? { owner: k, open: 0, overdue: 0, critical: 0 };
      o.open++;
      if (x.due_date && x.due_date < today) o.overdue++;
      if (x.severity === "critical" || x.severity === "high") o.critical++;
      owners.set(k, o);
    }
    const now = Date.now();
    const freshness = evidence
      .map((e) => ({ id: e.id, title: e.title, kind: e.kind, ageDays: Math.floor((now - new Date(e.created_at).getTime()) / 86400000), analyzed: !!e.analyzed_at }))
      .sort((a, b) => b.ageDays - a.ageDays);
    const vs = (verify ?? []) as { link_ok: boolean; hash_ok: boolean }[];
    return {
      risk,
      riskLevel: risk >= 60 ? "High" : risk >= 25 ? "Elevated" : risk > 0 ? "Moderate" : "Low",
      findings: {
        open: open.length,
        bySeverity: (["critical", "high", "medium", "low"] as const).map((s) => ({ severity: s, count: open.filter((x) => x.severity === s).length })),
        resolved: findings.filter((x) => x.status === "resolved").length,
        overdue: open.filter((x) => x.due_date && x.due_date < today).length,
        unassigned: open.filter((x) => !x.owner_email).length,
        top: open.sort((a, b) => a.priority - b.priority).slice(0, 5),
      },
      coverage: { covered: controls.filter((x) => x.status === "covered").length, total: controls.length, controls },
      owners: [...owners.values()].sort((a, b) => b.open - a.open),
      freshness: {
        items: freshness,
        stale: freshness.filter((x) => x.ageDays > 90).length,
        fresh: freshness.filter((x) => x.ageDays <= 30).length,
      },
      ledger: { blocks: vs.length, intact: vs.every((v) => v.link_ok && v.hash_ok) },
    };
  });
