import { createFileRoute } from "@tanstack/react-router";
import { Clock, DollarSign, Workflow, ShieldCheck } from "lucide-react";
import { useWorkspace, fmtMoney } from "@/hooks/use-workspace";
import { ProofBadge, StatusPill } from "@/components/trustable/Chrome";
import { DrillDown, drillableClass } from "@/components/trustable/DrillDown";

export const Route = createFileRoute("/_authenticated/app/")({
  component: Overview,
});

const PERSONAS: Record<string, { role: string; beat: string }> = {
  "Bob Henderson": { role: "Sales Ops Lead", beat: "The spark" },
  "Sally Martinez": { role: "Executive Assistant", beat: "The cascade" },
  "Kathy Chen": { role: "CISO", beat: "The security seal" },
  "Diane Foster": { role: "VP Global Operations", beat: "The budget expansion" },
  "Frank Kowalski": { role: "Global CIO", beat: "The fleet standard" },
};

function Overview() {
  const { data, isLoading, error } = useWorkspace();
  if (isLoading) return <p className="text-muted-foreground">Loading tenant…</p>;
  if (error || !data) return <p className="text-destructive">Could not load workspace.</p>;

  const deptById = new Map(data.departments.map((d) => [d.id, d]));
  const minutes = data.runs.reduce((a, r) => a + r.minutes_saved, 0);
  const weeklyValue = data.runs.reduce((a, r) => {
    const d = r.department_id ? deptById.get(r.department_id) : undefined;
    return a + (r.minutes_saved / 60) * (d?.loaded_hourly_rate ?? 100);
  }, 0);
  // Annualised: each executed flow recurs weekly across the department headcount adopting it (10% adoption assumption).
  const annual = data.runs.reduce((a, r) => {
    const d = r.department_id ? deptById.get(r.department_id) : undefined;
    if (!d) return a;
    return a + (r.minutes_saved / 60) * d.loaded_hourly_rate * 48 * Math.max(1, Math.round(d.headcount * 0.1));
  }, 0);
  const executed = data.runs.filter((r) => r.status === "executed").length;
  const review = data.runs.filter((r) => r.status === "review").length;

  const byDept = data.departments
    .map((d) => {
      const rs = data.runs.filter((r) => r.department_id === d.id);
      return { name: d.name, minutes: rs.reduce((a, r) => a + r.minutes_saved, 0), runs: rs.length };
    })
    .sort((a, b) => b.minutes - a.minutes);
  const maxM = Math.max(1, ...byDept.map((d) => d.minutes));

  const trail = Object.keys(PERSONAS)
    .map((name) => {
      const rs = data.runs.filter((r) => r.operator_label === name).sort((a, b) => a.created_at.localeCompare(b.created_at));
      return { name, first: rs[0]?.created_at, runs: rs.length, minutes: rs.reduce((a, r) => a + r.minutes_saved, 0) };
    })
    .filter((p) => p.first)
    .sort((a, b) => a.first!.localeCompare(b.first!));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{data.tenant.sector}</p>
          <h1 className="mt-1 text-3xl font-bold">{data.tenant.name}</h1>
        </div>
        <ProofBadge kind="live" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Minutes returned" description="Measured across all recorded tenant flow runs." detail={`${data.runs.length} runs returned ${minutes.toLocaleString()} minutes.`}><Stat icon={Clock} label="Minutes returned" value={minutes.toLocaleString()} /></Metric>
        <Metric title="Value of logged runs" description="Calculated from each department's loaded hourly rate." detail={`${minutes.toLocaleString()} minutes equate to ${fmtMoney(weeklyValue)} in logged value.`}><Stat icon={DollarSign} label="Value of logged runs" value={fmtMoney(weeklyValue)} /></Metric>
        <Metric title="Flow outcomes" description="Every run is schema-validated before execution or review." detail={`${executed} executed · ${review} in review · ${data.runs.length - executed - review} rejected.`}><Stat icon={Workflow} label="Flows executed / in review" value={`${executed} / ${review}`} /></Metric>
        <Metric title="Audit ledger" description="Append-only SHA-512 chain for this tenant." detail={`${data.ledger[0]?.seq ?? 0} blocks are present. Open CISO Console for full verification.`}><Stat icon={ShieldCheck} label="Ledger blocks" value={String(data.ledger[0]?.seq ?? 0)} /></Metric>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="panel p-6">
          <h2 className="text-lg font-semibold">Minutes returned by department</h2>
          <div className="mt-5 space-y-4">
            {byDept.map((d) => (
              <DrillDown key={d.name} title={d.name} description="Department flow adoption and measured time returned." trigger={<button className={`block w-full rounded-lg p-2 ${drillableClass}`}>
                <div className="flex justify-between text-sm">
                  <span>{d.name}</span>
                  <span className="font-mono text-muted-foreground">{d.minutes} min · {d.runs} runs</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(d.minutes / maxM) * 100}%` }} />
                </div>
              </button>}><p className="text-sm">{d.runs} recorded runs returned <strong>{d.minutes} minutes</strong>.</p></DrillDown>
            ))}
          </div>
          <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
            <p className="eyebrow">Annualised projection</p>
            <p className="mt-1 font-display text-3xl font-bold text-heart-gradient">{fmtMoney(annual)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Assumes each executed flow recurs weekly for 48 weeks, adopted by 10% of its department at the loaded hourly rate. Projection, not measured.
            </p>
          </div>
        </section>

        <section className="panel p-6">
          <h2 className="text-lg font-semibold">Adoption trail</h2>
          <p className="text-sm text-muted-foreground">Built from real run records, ordered by first use.</p>
          <ol className="relative mt-5 space-y-5 border-l border-border pl-6">
            {trail.map((p) => (
              <li key={p.name} className="rounded-lg p-2 transition hover:bg-accent/60" title={`Open ${p.name}'s adoption detail`}>
                <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-heart-gradient" />
                <p className="eyebrow">{PERSONAS[p.name]!.beat} · {new Date(p.first!).toLocaleDateString()}</p>
                <p className="font-medium">{p.name} <span className="text-muted-foreground">— {PERSONAS[p.name]!.role}</span></p>
                <p className="text-sm text-muted-foreground">{p.runs} runs · {p.minutes} minutes returned</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="panel p-6">
        <h2 className="text-lg font-semibold">Recent runs</h2>
        <div className="mt-4 divide-y divide-border">
          {data.runs.slice(0, 8).map((r) => (
            <DrillDown key={r.id} title="Flow run detail" description={`${r.operator_label} · ${new Date(r.created_at).toLocaleString()}`} trigger={<button className={`flex w-full flex-wrap items-center justify-between gap-2 py-3 text-left text-sm ${drillableClass}`}>
              <div className="min-w-0 flex-1">
                <p className="truncate">{r.task}</p>
                <p className="text-xs text-muted-foreground">{r.operator_label} · {new Date(r.created_at).toLocaleString()}</p>
              </div>
              <StatusPill status={r.status} />
              <span className="w-20 text-right font-mono text-muted-foreground">+{r.minutes_saved}m</span>
            </button>}><pre className="max-h-96 overflow-auto rounded bg-muted/50 p-3 text-xs">{JSON.stringify(r, null, 2)}</pre></DrillDown>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ title, description, detail, children }: { title: string; description: string; detail: string; children: React.ReactNode }) {
  return <DrillDown title={title} description={description} trigger={<button className={`w-full rounded-xl ${drillableClass}`}>{children}</button>}><p className="text-sm text-muted-foreground">{detail}</p></DrillDown>;
}

function Stat({ icon: I, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="panel p-5">
      <I className="h-4 w-4 text-primary" />
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
