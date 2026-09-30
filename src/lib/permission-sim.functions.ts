import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DEMO_TENANT_ID } from "./tenant";
import { type Ctx, requirePerm } from "./authz.server";
import { WORKSPACES } from "./workspaces";

async function logDenied(ctx: Ctx | null, reason: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const req = getRequest();
  await supabaseAdmin.rpc("ledger_append_internal", {
    _tenant: DEMO_TENANT_ID,
    _event: "authz.catalog_denied",
    _actor: ctx?.claims.email ?? ctx?.userId ?? "anonymous",
    _payload: {
      resource: "permissions_catalog",
      reason,
      tenant_id: DEMO_TENANT_ID,
      user_id: ctx?.userId ?? null,
      email: ctx?.claims.email ?? null,
      user_agent: req?.headers.get("user-agent")?.slice(0, 200) ?? null,
    },
  });
}

/** Permissions catalog; denied requests are written to the tamper-evident ledger. */
export const getPermissionCatalog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as Ctx;
    const { data: member } = await ctx.supabase.rpc("is_member", { _user: ctx.userId, _tenant: DEMO_TENANT_ID });
    if (!member) {
      await logDenied(ctx, "not_a_tenant_member");
      throw new Error("Forbidden: not a member of this tenant");
    }
    const { data, error } = await ctx.supabase.from("permissions").select("key, area, description").order("area");
    if (error) {
      await logDenied(ctx, `query_rejected: ${error.code ?? "unknown"}`);
      throw new Error("Forbidden: catalog unavailable");
    }
    return data as { key: string; area: string; description: string }[];
  });

/** Admin simulator: evaluates the real has_permission() for every member × workspace. */
export const simulateAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as Ctx;
    await requirePerm(ctx, "access.manage");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: members } = await supabaseAdmin
      .from("user_roles").select("user_id, email, role").eq("tenant_id", DEMO_TENANT_ID);
    const perms = Array.from(new Set(WORKSPACES.map((w) => w.perm)));
    const rows = [];
    for (const m of members ?? []) {
      const granted: Record<string, boolean> = {};
      for (const p of perms) {
        const { data } = await supabaseAdmin.rpc("has_permission", { _user: m.user_id, _tenant: DEMO_TENANT_ID, _perm: p });
        granted[p] = !!data;
      }
      rows.push({ userId: m.user_id, email: m.email ?? m.user_id, role: m.role, granted });
    }
    return { workspaces: WORKSPACES.map(({ to, label, perm }) => ({ to, label, perm })), rows };
  });
