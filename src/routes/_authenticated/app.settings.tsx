import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAccess } from "@/hooks/use-access";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pageMeta } from "@/lib/site";

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
    if (pw.a.length < 10) return toast.error("Use at least 10 characters");
    if (pw.a !== pw.b) return toast.error("Passwords don't match");
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
        <div className="space-y-1.5"><Label>New password</Label><Input type="password" autoComplete="new-password" value={pw.a} onChange={(e) => setPw({ ...pw, a: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Confirm</Label><Input type="password" autoComplete="new-password" value={pw.b} onChange={(e) => setPw({ ...pw, b: e.target.value })} /></div>
        <Button disabled={busy}>Update password</Button>
      </form>
      <section className="panel p-6 lg:col-span-2">
        <h2 className="text-lg font-semibold">Your library</h2>
        <p className="mt-1 text-sm text-muted-foreground">Files, links and notes you save are private to your account and can be inserted into Trustable Flow.</p>
        <Button asChild variant="outline" className="mt-4"><Link to="/app/library">Open library</Link></Button>
      </section>
    </div>
  );
}
