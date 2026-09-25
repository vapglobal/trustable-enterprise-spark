import type { Ctx } from "./authz.server";
import { DEMO_TENANT_ID } from "./tenant";

export async function getWorkspaceSnapshot(ctx: Ctx, paths: string[]) {
  const selected = new Set(paths.length ? paths : ["posture", "findings"]);
  const out: Record<string, unknown> = { tenantId: DEMO_TENANT_ID, selected: [...selected] };
  if (selected.has("posture") || selected.has("findings") || selected.has("evidence")) {
    const [evidence, findings] = await Promise.all([
      ctx.supabase.from("evidence").select("id,title,kind,framework,covered_controls,analysis_summary,analyzed_at,created_at").eq("tenant_id", DEMO_TENANT_ID).order("created_at", { ascending: false }).limit(30),
      ctx.supabase.from("security_findings").select("title,control_id,severity,priority,gap,remediation,status,owner_email,due_date").eq("tenant_id", DEMO_TENANT_ID).order("priority").limit(50),
    ]);
    if (selected.has("evidence") || selected.has("posture")) out.evidence = evidence.data ?? [];
    if (selected.has("findings") || selected.has("posture")) out.findings = findings.data ?? [];
  }
  if (selected.has("flows")) {
    const { data } = await ctx.supabase.from("flow_runs").select("task,status,operator_label,minutes_saved,category,created_at").eq("tenant_id", DEMO_TENANT_ID).order("created_at", { ascending: false }).limit(30);
    out.flows = data ?? [];
  }
  if (selected.has("audit")) {
    const { data } = await ctx.supabase.from("audit_ledger").select("seq,event,actor,payload,created_at").eq("tenant_id", DEMO_TENANT_ID).order("seq", { ascending: false }).limit(40);
    out.audit = data ?? [];
  }
  if (selected.has("library")) {
    const { data } = await ctx.supabase.from("library_items").select("title,kind,tags,url,body,created_at").eq("user_id", ctx.userId).order("pinned", { ascending: false }).limit(30);
    out.library = data ?? [];
  }
  return out;
}
