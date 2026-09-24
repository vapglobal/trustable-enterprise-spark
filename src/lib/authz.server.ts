import { DEMO_TENANT_ID, type AppRole } from "./tenant";
import type { Perm } from "./controls";
import type { Json } from "@/integrations/supabase/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Ctx = { supabase: any; userId: string; claims: { email?: string } };

export function ownerEmail() {
  return (process.env["TRUSTABLE_OWNER_EMAIL"] ?? "").trim().toLowerCase();
}

export async function ledger(ctx: Ctx, event: string, payload: Record<string, unknown>) {
  const { error } = await ctx.supabase.rpc("append_ledger", {
    _tenant: DEMO_TENANT_ID,
    _event: event,
    _payload: payload as Json,
  });
  if (error) console.error("ledger append failed", error.message);
}

/** System role; an "owner" row is only honoured when it matches the secured owner identity. */
export async function myRole(ctx: Ctx): Promise<AppRole | null> {
  const { data } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .eq("tenant_id", DEMO_TENANT_ID)
    .maybeSingle();
  const role = (data?.role as AppRole) ?? null;
  if (role === "owner" && (ctx.claims.email ?? "").toLowerCase() !== ownerEmail()) return null;
  return role;
}

export async function myPermissions(ctx: Ctx): Promise<Perm[]> {
  const { data } = await ctx.supabase.rpc("my_permissions", { _tenant: DEMO_TENANT_ID });
  return ((data ?? []) as unknown as string[]).map((p) => (typeof p === "string" ? p : Object.values(p)[0])) as Perm[];
}

export async function requirePerm(ctx: Ctx, perm: Perm) {
  if ((await myRole(ctx)) === null) throw new Error("Forbidden: not a member");
  const { data } = await ctx.supabase.rpc("has_permission", { _user: ctx.userId, _tenant: DEMO_TENANT_ID, _perm: perm });
  if (!data) {
    await ledger(ctx, "authz.denied", { permission: perm });
    throw new Error(`Forbidden: missing permission ${perm}`);
  }
}
