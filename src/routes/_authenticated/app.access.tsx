import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { listAccess, createInvite } from "@/lib/trustable.functions";
import { useWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/app/access")({
  component: AccessPage,
});

const SUGGESTED = [
  { name: "Matt Norton", role: "auditor" },
  { name: "Jessica", role: "auditor" },
  { name: "Katie", role: "auditor" },
  { name: "Kevin", role: "operator" },
  { name: "Luke", role: "operator" },
] as const;

function AccessPage() {
  const ws = useWorkspace();
  const list = useServerFn(listAccess);
  const invite = useServerFn(createInvite);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["access-list"], queryFn: () => list(), enabled: ws.data?.role !== "operator" });
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "operator" | "auditor">("auditor");
  const [busy, setBusy] = useState(false);

  if (ws.data?.role === "operator") {
    return <p className="text-muted-foreground">Access management is available to owners, admins and auditors.</p>;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await invite({ data: { email, role, displayName: name || undefined } });
      toast.success(`Invite recorded for ${email}. Send them the sign-in link.`);
      setEmail("");
      setName("");
      qc.invalidateQueries({ queryKey: ["access-list"] });
      qc.invalidateQueries({ queryKey: ["workspace"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      {q.data?.canInvite && (
        <section className="panel p-6">
          <h1 className="text-2xl font-bold">Invite a reviewer</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Named, revocable access. No shared passwords, no tokens in links. The invitee signs up with this exact email.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {SUGGESTED.map((s) => (
              <button key={s.name} type="button" onClick={() => { setName(s.name); setRole(s.role); }} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground">
                {s.name}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auditor">Auditor — read everything, change nothing</SelectItem>
                  <SelectItem value="operator">Operator — run flows</SelectItem>
                  <SelectItem value="admin">Admin — manage access (owner only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={busy} className="w-full"><UserPlus className="mr-2 h-4 w-4" /> Record invite</Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">Sign-in link to send: {typeof window !== "undefined" ? `${window.location.origin}/auth` : "/auth"}</p>
        </section>
      )}
      <section className="panel p-6">
        <h2 className="text-lg font-semibold">Members</h2>
        <div className="mt-3 divide-y divide-border">
          {q.data?.members.map((m, i) => (
            <div key={i} className="flex justify-between py-2.5 text-sm">
              <span>{m.email ?? "—"}</span>
              <span className="font-mono text-xs uppercase tracking-widest text-primary">{m.role}</span>
            </div>
          ))}
        </div>
        {q.data?.canInvite && (
          <>
            <h2 className="mt-8 text-lg font-semibold">Invites</h2>
            <div className="mt-3 divide-y divide-border">
              {q.data.invites.length === 0 && <p className="py-2 text-sm text-muted-foreground">No invites yet.</p>}
              {q.data.invites.map((i) => (
                <div key={i.id} className="flex justify-between py-2.5 text-sm">
                  <span>{i.display_name ? `${i.display_name} · ` : ""}{i.email}</span>
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {i.role} · {i.accepted_at ? "accepted" : "pending"}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
