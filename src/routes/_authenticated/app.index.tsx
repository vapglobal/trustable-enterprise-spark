import { createFileRoute } from "@tanstack/react-router";
import { Clock, DollarSign, Workflow, ShieldCheck } from "lucide-react";
import { useWorkspace, fmtMoney } from "@/hooks/use-workspace";
import { ProofBadge } from "@/components/trustable/Chrome";

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
        <Stat icon={Clock} label="Minutes returned" value={minutes.toLocaleString()} />
        <Stat icon={DollarSign} label="Value of logged runs" value={fmtMoney(weeklyValue)} />
        <Stat icon={Workflow} label="Flows executed / in review" value={`${executed} / ${review}`} />
        <Stat icon={ShieldCheck} label="Ledger blocks" value={String(data.ledger[0]?.seq ?? 0)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="panel p-6">
          <h2 className="text-lg font-semibold">Minutes returned by department</h2>
          <div className="mt-5 space-y-4">
            {byDept.map((d) => (
              <div key={d.name}>
                <div className="flex justify-between text-sm">
                  <span>{d.name}</span>
                  <span className="font-mono text-muted-foreground">{d.minutes} min · {d.runs} runs</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(d.minutes / maxM) * 100}%` }} />
                </div>
              </div>
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
              <li key={p.name}>
                <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-heart-gradient" />
                <p className="eyebrow">{PERSONAS[p.name].beat} · {new Date(p.first!).toLocaleDateString()}</p>
                <p className="font-medium">{p.name} <span className="text-muted-foreground">— {PERSONAS[p.name].role}</span></p>
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
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate">{r.task}</p>
                <p className="text-xs text-muted-foreground">{r.operator_label} · {new Date(r.created_at).toLocaleString()}</p>
              </div>
              <StatusPill status={r.status} />
              <span className="w-20 text-right font-mono text-muted-foreground">+{r.minutes_saved}m</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const cls =
    status === "executed"
      ? "border-success/40 bg-success/10 text-success"
      : status === "review"
        ? "border-warning/40 bg-warning/10 text-warning"
        : "border-destructive/40 bg-destructive/10 text-destructive";
  return <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${cls}`}>{status}</span>;
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
