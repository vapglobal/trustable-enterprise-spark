import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAccess } from "@/hooks/use-access";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pageMeta } from "@/lib/site";
import { EmphasizedControl } from "@/components/trustable/EmphasizedField";
import { BellRing, Mail, ShieldAlert } from "lucide-react";
import { ProofBadge } from "@/components/trustable/Chrome";

export const Route = createFileRoute("/_authenticated/app/settings")({
  head: () => pageMeta({ title: "Settings — Trustable", description: "Your account, password and library settings.", path: "/app/settings", index: false }),
  component: SettingsPage,
});

function SettingsPage() {
  const access = useAccess();
  const [pw, setPw] = useState({ a: "", b: "" });
  const [busy, setBusy] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.a.length < 10) { toast.error("Use at least 10 characters"); return; }
    if (pw.a !== pw.b) { toast.error("Passwords don't match"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw.a });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Password updated"); setPw({ a: "", b: "" }); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="panel p-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>{access.data?.email}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Role</dt><dd className="capitalize">{access.data?.role}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Permissions</dt><dd>{access.data?.perms?.length ?? 0}</dd></div>
        </dl>
      </section>
      <form onSubmit={changePassword} className="panel space-y-4 p-6">
        <h2 className="text-lg font-semibold">Change password</h2>
        <EmphasizedControl label="New password" hint="Sensitive fields intentionally exclude AI and clipboard actions."><Input type="password" autoComplete="new-password" value={pw.a} onChange={(e) => setPw({ ...pw, a: e.target.value })} /></EmphasizedControl>
        <EmphasizedControl label="Confirm"><Input type="password" autoComplete="new-password" value={pw.b} onChange={(e) => setPw({ ...pw, b: e.target.value })} /></EmphasizedControl>
        <Button disabled={busy}>Update password</Button>
      </form>
      <section className="panel p-6 lg:col-span-2">
        <h2 className="text-lg font-semibold">Your library</h2>
        <p className="mt-1 text-sm text-muted-foreground">Files, links and notes you save are private to your account and can be inserted into Trustable Flow.</p>
        <Button asChild variant="outline" className="mt-4"><Link to="/app/library">Open library</Link></Button>
      </section>
      <section className="panel p-6 lg:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="eyebrow">Security operations</p><h2 className="mt-1 text-lg font-semibold">Sign-in alerts and summaries</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Notify the owner when named reviewers or any user attempts to access Trustable, with critical escalation for suspicious or denied activity.</p></div><ProofBadge kind="reference" /></div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">{[[Mail,"Owner email alerts","Successful, failed, denied, and suspended-user attempts."],[BellRing,"Push notifications","Immediate critical alerts with a link to the audit entry."],[ShieldAlert,"Security summary","Daily sign-in activity, anomalies, outcomes, and unresolved incidents."]].map(([Icon,title,detail])=>{const I=Icon as typeof Mail; return <div key={title as string} className="border border-border bg-muted/25 p-4 shadow-md"><I className="h-5 w-5 text-primary"/><p className="mt-3 text-sm font-semibold">{title as string}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail as string}</p></div>;})}</div>
        <div className="mt-4 border border-warning/35 bg-warning/10 p-3 text-xs text-warning">Delivery is not enabled yet. Sign-ins are ledgered today; email and push require verified notification contracts before these controls become Live.</div>
      </section>
    </div>
  );
}
