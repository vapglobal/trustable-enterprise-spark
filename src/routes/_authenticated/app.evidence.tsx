import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { FileUp, Sparkles, Eye } from "lucide-react";
import { listEvidence, submitEvidence, analyzeEvidenceFn, getEvidence, listFindings, updateFinding, type Finding } from "@/lib/security.functions";
import { useAccess } from "@/hooks/use-access";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProofBadge } from "@/components/trustable/Chrome";

export const Route = createFileRoute("/_authenticated/app/evidence")({
  head: () => ({ meta: [{ title: "Evidence & control gaps — Trustable" }, { name: "description", content: "Submit security evidence and get AI control-gap analysis." }] }),
  component: EvidencePage,
});

const SEV: Record<string, string> = {
  critical: "border-destructive text-destructive",
  high: "border-destructive/60 text-destructive",
  medium: "border-warning text-warning",
  low: "border-border text-muted-foreground",
};

function EvidencePage() {
  const { can } = useAccess();
  const qc = useQueryClient();
  const listE = useServerFn(listEvidence);
  const listF = useServerFn(listFindings);
  const submit = useServerFn(submitEvidence);
  const analyze = useServerFn(analyzeEvidenceFn);
  const view = useServerFn(getEvidence);
  const ev = useQuery({ queryKey: ["evidence"], queryFn: () => listE() });
  const fi = useQuery({ queryKey: ["findings"], queryFn: () => listF() });
  const [form, setForm] = useState({ title: "", kind: "policy" as "architecture" | "policy" | "compliance", framework: "", content: "" });
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState<Awaited<ReturnType<typeof view>> | null>(null);

  function refresh() {
    ["evidence", "findings", "posture"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
  }

  async function onFile(file: File) {
    if (file.size > 2_000_000) return toast.error("Files must be under 2 MB.");
    if (file.type.startsWith("image/")) {
      const r = new FileReader();
      r.onload = () => setImage(String(r.result));
      r.readAsDataURL(file);
    } else {
      const text = await file.text();
      setForm((f) => ({ ...f, content: text.slice(0, 200000), title: f.title || file.name }));
    }
  }

  async function doSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy("submit");
    try {
      const { id } = await submit({ data: { ...form, framework: form.framework || undefined, imageData: image ?? undefined } });
      toast.success("Evidence stored.");
      setForm({ title: "", kind: form.kind, framework: "", content: "" });
      setImage(null);
      refresh();
      if (can("evidence.analyze")) await doAnalyze(id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setBusy(null);
    }
  }

  async function doAnalyze(id: string) {
    setBusy(id);
    try {
      const r = await analyze({ data: { id } });
      toast.success(`Analysis complete: ${r.findings} findings, ${r.covered.length} controls evidenced.`);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Evidence intake · AI control-gap analysis</p>
          <h1 className="text-3xl font-bold">Evidence & remediation</h1>
        </div>
        <ProofBadge kind="live" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {can("evidence.upload") && (
          <form onSubmit={doSubmit} className="panel space-y-4 p-6">
            <h2 className="text-lg font-semibold">Submit evidence</h2>
            <p className="text-xs text-muted-foreground">Architecture diagrams (PNG/JPG/WebP), policies and compliance reports (text, Markdown, JSON). Content is treated as untrusted and never follows embedded instructions.</p>
            <div className="space-y-1.5"><Label>Title</Label><Input required minLength={3} maxLength={160} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as typeof form.kind })}>
                  <option value="architecture">Architecture diagram</option>
                  <option value="policy">Policy</option>
                  <option value="compliance">Compliance evidence</option>
                </select>
              </div>
              <div className="space-y-1.5"><Label>Framework</Label><Input placeholder="SOC 2, ISO 27001…" maxLength={60} value={form.framework} onChange={(e) => setForm({ ...form, framework: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5">
              <Label>File</Label>
              <Input type="file" accept=".txt,.md,.json,.csv,.yaml,.yml,image/png,image/jpeg,image/webp" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
              {image && <img src={image} alt="Diagram preview" className="mt-2 max-h-40 rounded border border-border" />}
            </div>
            <div className="space-y-1.5"><Label>Or paste content</Label><Textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
            <Button type="submit" className="w-full" disabled={!!busy}>
              <FileUp className="mr-2 h-4 w-4" /> {busy === "submit" ? "Storing…" : can("evidence.analyze") ? "Submit & analyze" : "Submit"}
            </Button>
          </form>
        )}

        <section className="panel p-6">
          <h2 className="text-lg font-semibold">Evidence library</h2>
          <ul className="mt-3 divide-y divide-border">
            {ev.data?.length === 0 && <li className="py-3 text-sm text-muted-foreground">No evidence yet.</li>}
            {ev.data?.map((e) => (
              <li key={e.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.kind}{e.framework ? ` · ${e.framework}` : ""} · {e.created_by_email ?? "—"} · {e.created_at.slice(0, 10)}</p>
                    {e.analysis_summary && <p className="mt-1 text-xs">{e.analysis_summary}</p>}
                    {e.covered_controls.length > 0 && <p className="mt-1 font-mono text-[10px] text-success">Evidenced: {e.covered_controls.join(" · ")}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="sm" variant="ghost" onClick={async () => setOpen(await view({ data: { id: e.id } }))} title="View (logged)"><Eye className="h-4 w-4" /></Button>
                    {can("evidence.analyze") && (
                      <Button size="sm" variant="outline" disabled={!!busy} onClick={() => doAnalyze(e.id)}>
                        <Sparkles className="mr-1 h-3.5 w-3.5" /> {busy === e.id ? "Analyzing…" : e.analyzed_at ? "Re-run" : "Analyze"}
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {open && (
        <section className="panel p-6">
          <div className="flex justify-between"><h2 className="text-lg font-semibold">{open.title}</h2><Button size="sm" variant="ghost" onClick={() => setOpen(null)}>Close</Button></div>
          <p className="text-xs text-muted-foreground">This view was recorded in the audit log.</p>
          {open.image_data && <img src={open.image_data} alt={open.title} className="mt-3 max-h-96 rounded border border-border" />}
          {open.content && <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded bg-muted/40 p-3 text-xs">{open.content}</pre>}
        </section>
      )}

      <section className="panel p-6">
        <h2 className="text-lg font-semibold">Prioritized remediation</h2>
        <div className="mt-3 space-y-3">
          {fi.data?.findings.length === 0 && <p className="text-sm text-muted-foreground">No findings yet. Analyze evidence to generate them.</p>}
          {fi.data?.findings.map((f) => <FindingRow key={f.id} f={f} canManage={fi.data!.canManage} onSaved={refresh} />)}
        </div>
      </section>
    </div>
  );
}

function FindingRow({ f, canManage, onSaved }: { f: Finding; canManage: boolean; onSaved: () => void }) {
  const upd = useServerFn(updateFinding);
  const [status, setStatus] = useState(f.status);
  const [owner, setOwner] = useState(f.owner_email ?? "");
  const [due, setDue] = useState(f.due_date ?? "");
  async function save() {
    try {
      await upd({ data: { id: f.id, status, ownerEmail: owner || null, dueDate: due || null } });
      toast.success("Finding updated.");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  }
  return (
    <div className={`rounded-md border-l-2 bg-muted/20 p-4 ${SEV[f.severity]}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">P{f.priority} · {f.title}</p>
        <span className="font-mono text-[10px] uppercase tracking-widest">{f.severity} · {f.control_id} · {f.status.replace("_", " ")}</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground"><b className="text-foreground">Gap:</b> {f.gap}</p>
      <p className="mt-1 text-xs text-muted-foreground"><b className="text-foreground">Remediation:</b> {f.remediation}</p>
      {canManage ? (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <select className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground" value={status} onChange={(e) => setStatus(e.target.value as Finding["status"])}>
            <option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="accepted">Risk accepted</option>
          </select>
          <Input className="h-8 w-56 text-xs" type="email" placeholder="owner@company.com" value={owner} onChange={(e) => setOwner(e.target.value)} />
          <Input className="h-8 w-40 text-xs" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          <Button size="sm" variant="outline" onClick={save}>Save</Button>
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">Owner: {f.owner_email ?? "Unassigned"}{f.due_date ? ` · due ${f.due_date}` : ""}</p>
      )}
    </div>
  );
}
