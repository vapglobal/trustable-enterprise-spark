import { createFileRoute } from "@tanstack/react-router";
import { GrowthOrganism } from "@/components/trustable/GrowthOrganism";
import { ProofBadge } from "@/components/trustable/Chrome";
import { useWorkspace } from "@/hooks/use-workspace";
import { pageMeta } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/app/growth")({
  head: () => pageMeta({ title: "Builder Growth — Trustable", description: "Explore Trustable builder levels, measurable value, organization growth, and the illustrative enterprise incentive model.", path: "/app/growth", index: false }),
  component: GrowthPage,
});

function GrowthPage() {
  const workspace = useWorkspace();
  if (workspace.isLoading) return <p className="text-muted-foreground">Loading growth evidence…</p>;
  if (workspace.error || !workspace.data) return <p className="text-destructive">Could not load growth evidence.</p>;
  const data = workspace.data;
  const departments = new Map(data.departments.map((department) => [department.id, department]));
  const liveMinutes = data.runs.reduce((sum, run) => sum + run.minutes_saved, 0);
  const liveValue = data.runs.reduce((sum, run) => {
    const department = run.department_id ? departments.get(run.department_id) : undefined;
    return sum + (run.minutes_saved / 60) * (department?.loaded_hourly_rate ?? 100);
  }, 0);
  const livePeople = new Set(data.runs.map((run) => run.operator_label)).size;
  return <div className="space-y-6"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Enterprise adoption organism</p><h1 className="mt-1 text-3xl font-bold">Trustable builder growth</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">Start with one useful solution. Prove the minutes. Grow the people, bridges, capability, and enterprise value—under customer governance at every level.</p></div><ProofBadge kind="live"/></header><GrowthOrganism liveMinutes={liveMinutes} liveRuns={data.runs.length} livePeople={livePeople} liveValue={liveValue}/></div>;
}