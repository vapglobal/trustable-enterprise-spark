import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { listAudit, exportAudit } from "@/lib/security.functions";
import { AUDIT_CATEGORIES } from "@/lib/controls";
import { CONFIDENTIAL_NOTICE } from "@/lib/tenant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DrillDown, drillableClass } from "@/components/trustable/DrillDown";
import { EmphasizedControl, EmphasizedField } from "@/components/trustable/EmphasizedField";

export const Route = createFileRoute("/_authenticated/app/audit")({
  head: () => ({ meta: [{ title: "Audit log — Trustable" }, { name: "description", content: "Tamper-evident audit log with filters and CSV export." }] }),
  component: AuditPage,
});

function csvCell(v: unknown) {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s; // neutralise spreadsheet formula injection
  return `"${safe.replace(/"/g, '""')}"`;
}

function AuditPage() {
  const list = useServerFn(listAudit);
  const exp = useServerFn(exportAudit);
  const [f, setF] = useState({ category: "", actor: "", from: "", to: "" });
  const [applied, setApplied] = useState(f);
  const clean = (x: typeof f) => Object.fromEntries(Object.entries(x).filter(([, v]) => v)) as Partial<typeof f>;
  const q = useQuery({ queryKey: ["audit", applied], queryFn: () => list({ data: clean(applied) }) });

  async function doExport() {
    try {
      const rows = await exp({ data: clean(applied) });
      const header = ["seq", "timestamp", "event", "actor", "payload", "prev_hash", "block_hash"];
      const lines = [header.join(","), ...rows.map((r) => [r.seq, r.created_at, r.event, r.actor, r.payload, r.prev_hash, r.block_hash].map(csvCell).join(","))];
      lines.push("", csvCell(CONFIDENTIAL_NOTICE));
      const blob = new Blob([lines.join("\n")], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `TRUSTABLE_AUDIT_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success(`Exported ${rows.length} entries. The export itself is logged.`);
      q.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Tamper-evident · SHA-512 hash chain</p>
          <h1 className="text-3xl font-bold">Audit log</h1>
        </div>
        {q.data?.canExport && <Button onClick={doExport}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>}
      </div>
      <form
        className="panel grid gap-4 p-5 md:grid-cols-5"
        onSubmit={(e) => { e.preventDefault(); setApplied(f); }}
      >
        <EmphasizedControl label="Category">
          <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
            <option value="">All</option>
            {AUDIT_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </EmphasizedControl>
        <EmphasizedField label="Actor" ai={false} value={f.actor} onChange={(actor) => setF({ ...f, actor })}><Input value={f.actor} maxLength={120} onChange={(e) => setF({ ...f, actor: e.target.value })} placeholder="email" /></EmphasizedField>
        <EmphasizedControl label="From"><Input type="date" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></EmphasizedControl>
        <EmphasizedControl label="To"><Input type="date" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} /></EmphasizedControl>
        <div className="flex items-end"><Button type="submit" variant="outline" className="w-full">Apply</Button></div>
      </form>
      <section className="panel overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr><th className="px-4 py-2">#</th><th>Time (UTC)</th><th>Event</th><th>Actor</th><th>Detail</th><th className="pr-4">Block</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {q.isLoading && <tr><td colSpan={6} className="px-4 py-3 text-muted-foreground">Loading…</td></tr>}
            {q.error && <tr><td colSpan={6} className="px-4 py-3 text-destructive">{(q.error as Error).message}</td></tr>}
            {q.data?.rows.length === 0 && <tr><td colSpan={6} className="px-4 py-3 text-muted-foreground">No entries match.</td></tr>}
            {q.data?.rows.map((r) => (
              <tr key={r.seq} className="align-top">
                <td className="px-4 py-2 font-mono text-xs">{r.seq}</td>
                <td className="whitespace-nowrap py-2 font-mono text-xs">{r.created_at.replace("T", " ").slice(0, 19)}</td>
                <td className={`py-2 font-mono text-xs ${r.event.startsWith("authz.") ? "text-destructive" : "text-primary"}`}>{r.event}</td>
                <td className="py-2 text-xs">{r.actor}</td>
                <td className="max-w-xs py-2 font-mono text-[11px] text-muted-foreground"><DrillDown title={`Audit block #${r.seq}`} description={`${r.event} · ${r.actor}`} trigger={<button className={`max-w-xs truncate ${drillableClass}`}>{JSON.stringify(r.payload)}</button>}><pre className="max-h-96 overflow-auto rounded bg-muted/50 p-3 text-xs">{JSON.stringify(r, null, 2)}</pre></DrillDown></td>
                <td className="py-2 pr-4 font-mono text-[11px] text-muted-foreground">{r.block_hash.slice(7, 19)}…</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
