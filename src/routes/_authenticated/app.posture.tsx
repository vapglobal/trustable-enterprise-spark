import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPosture } from "@/lib/security.functions";
import { ProofBadge } from "@/components/trustable/Chrome";
import { DrillDown, drillableClass } from "@/components/trustable/DrillDown";

export const Route = createFileRoute("/_authenticated/app/posture")({
  head: () => ({ meta: [{ title: "Security posture — Trustable" }, { name: "description", content: "Tenant risk, findings, coverage and evidence freshness." }] }),
  component: PosturePage,
});

const SEV: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-destructive/70 text-destructive-foreground",
  medium: "bg-warning/80 text-background",
  low: "bg-muted text-foreground",
};

function PosturePage() {
  const fn = useServerFn(getPosture);
  const { data: p, isLoading, error } = useQuery({ queryKey: ["posture"], queryFn: () => fn() });
  if (isLoading) return <p className="text-muted-foreground">Computing posture…</p>;
  if (error || !p) return <p className="text-destructive">{error instanceof Error ? error.message : "Unavailable"}</p>;
  const pct = Math.round((p.coverage.covered / p.coverage.total) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Security posture</p>
          <h1 className="text-3xl font-bold">Tenant risk overview</h1>
        </div>
        <ProofBadge kind="live" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <DrillDown title="Risk score factors" description="Current tenant risk is calculated from open findings by severity." trigger={<button className={`rounded-xl ${drillableClass}`}><Stat label="Risk score" value={`${p.risk}/100`} sub={p.riskLevel} tone={p.risk >= 60 ? "text-destructive" : p.risk >= 25 ? "text-warning" : "text-success"} /></button>}><ul className="space-y-2 text-sm">{p.findings.bySeverity.map((s) => <li key={s.severity} className="flex justify-between"><span className="capitalize">{s.severity}</span><strong>{s.count}</strong></li>)}</ul></DrillDown>
        <Link to="/app/evidence" className={`rounded-xl ${drillableClass}`} title="Open and manage findings"><Stat label="Open findings" value={p.findings.open} sub={`${p.findings.overdue} overdue · ${p.findings.unassigned} unassigned`} /></Link>
        <button onClick={() => document.getElementById("control-coverage")?.scrollIntoView({ behavior: "smooth" })} className={`rounded-xl ${drillableClass}`} title="Jump to every control"><Stat label="Control coverage" value={`${pct}%`} sub={`${p.coverage.covered} of ${p.coverage.total} controls`} /></button>
        <button onClick={() => document.getElementById("evidence-freshness")?.scrollIntoView({ behavior: "smooth" })} className={`rounded-xl ${drillableClass}`} title="Jump to evidence freshness"><Stat label="Evidence freshness" value={`${p.freshness.fresh}/${p.freshness.items.length}`} sub={`${p.freshness.stale} older than 90 days`} /></button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-6">
          <h2 className="text-lg font-semibold">Open findings by severity</h2>
          <div className="mt-4 space-y-2">
            {p.findings.bySeverity.map((s) => (
              <div key={s.severity} className="flex items-center gap-3">
                <span className="w-20 font-mono text-xs uppercase">{s.severity}</span>
                <div className="h-2 flex-1 rounded bg-muted">
                  <div className={`h-2 rounded ${SEV[s.severity]}`} style={{ width: `${p.findings.open ? (s.count / p.findings.open) * 100 : 0}%` }} />
                </div>
                <span className="w-6 text-right font-mono text-sm">{s.count}</span>
              </div>
            ))}
          </div>
          <h3 className="mt-6 text-sm font-semibold">Fix first</h3>
          <ul className="mt-2 divide-y divide-border text-sm">
            {p.findings.top.length === 0 && <li className="py-2 text-muted-foreground">No open findings. Submit evidence to assess controls.</li>}
            {p.findings.top.map((f, i) => (
              <li key={i}><Link to="/app/evidence" className="flex items-center justify-between gap-3 rounded py-2 hover:bg-accent/60" title="Open finding in Evidence">
                <span className="truncate">P{f.priority} · {f.title}</span>
                <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase ${SEV[f.severity]}`}>{f.severity}</span>
              </Link></li>
            ))}
          </ul>
          <Link to="/app/evidence" className="mt-3 inline-block text-sm text-primary hover:underline">Manage findings →</Link>
        </section>

        <section className="panel p-6">
          <h2 className="text-lg font-semibold">Remediation ownership</h2>
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground"><tr><th className="py-1">Owner</th><th>Open</th><th>High+</th><th>Overdue</th></tr></thead>
            <tbody className="divide-y divide-border">
              {p.owners.length === 0 && <tr><td colSpan={4} className="py-2 text-muted-foreground">Nothing assigned yet.</td></tr>}
              {p.owners.map((o) => (
                <tr key={o.owner} className="cursor-pointer transition hover:bg-accent/60" title={`Review findings assigned to ${o.owner}`}>
                  <td className={`py-2 ${o.owner === "Unassigned" ? "text-warning" : ""}`}>{o.owner}</td>
                  <td className="font-mono">{o.open}</td>
                  <td className="font-mono">{o.critical}</td>
                  <td className={`font-mono ${o.overdue ? "text-destructive" : ""}`}>{o.overdue}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-6 text-xs text-muted-foreground">
            Audit chain: {p.ledger.blocks} blocks · {p.ledger.intact ? <span className="text-success">intact</span> : <span className="text-destructive">BROKEN</span>}
          </p>
        </section>
      </div>

      <section id="control-coverage" className="panel scroll-mt-32 p-6">
        <h2 className="text-lg font-semibold">Control coverage</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {p.coverage.controls.map((c) => (
            <Link to="/app/evidence" key={c.id} className="flex items-center justify-between rounded border border-border px-3 py-2 text-sm transition hover:border-primary/50 hover:bg-accent/50" title={`Review evidence and findings for ${c.id}`}>
              <div>
                <span className="font-mono text-xs text-primary">{c.id}</span> {c.name}
                <div className="text-[11px] text-muted-foreground">{c.frameworks}</div>
              </div>
              <span className={`font-mono text-[10px] uppercase tracking-widest ${c.status === "covered" ? "text-success" : c.status === "partial" ? "text-warning" : "text-destructive"}`}>
                {c.status}{c.openFindings ? ` · ${c.openFindings}` : ""}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="evidence-freshness" className="panel scroll-mt-32 p-6">
        <h2 className="text-lg font-semibold">Evidence freshness</h2>
        <ul className="mt-3 divide-y divide-border text-sm">
          {p.freshness.items.length === 0 && <li className="py-2 text-muted-foreground">No evidence submitted yet.</li>}
          {p.freshness.items.map((e) => (
            <li key={e.id}><Link to="/app/evidence" className="flex justify-between rounded py-2 hover:bg-accent/60" title="Open evidence record">
              <span>{e.title} <span className="text-xs text-muted-foreground">· {e.kind}{e.analyzed ? "" : " · not analyzed"}</span></span>
              <span className={`font-mono text-xs ${e.ageDays > 90 ? "text-destructive" : e.ageDays > 30 ? "text-warning" : "text-success"}`}>{e.ageDays}d</span>
            </Link></li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string | number; sub: string; tone?: string }) {
  return (
    <div className="panel p-5">
      <p className="eyebrow">{label}</p>
      <p className={`mt-2 font-display text-3xl font-bold ${tone ?? ""}`}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
