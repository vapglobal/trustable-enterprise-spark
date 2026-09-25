import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { runFlow } from "@/lib/trustable.functions";
import { useWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProofBadge, StatusPill } from "@/components/trustable/Chrome";
import { EmphasizedControl, EmphasizedField } from "@/components/trustable/EmphasizedField";
import { DrillDown, drillableClass } from "@/components/trustable/DrillDown";

export const Route = createFileRoute("/_authenticated/app/flow")({
  component: FlowPage,
});

const EXAMPLES = [
  "Every Monday I pull the weekly pipeline export, fix the rep names in about 400 rows, save it to Dropbox, and email a summary to my VP.",
  "After each leadership sync I turn the meeting notes into action items with owners and deadlines and paste them into Jira.",
  "Each quarter I review which contractors still have access to our 14 SaaS tools, including their home addresses and SSNs on file.",
];

type Result = Awaited<ReturnType<typeof runFlow>>;

function FlowPage() {
  const { data } = useWorkspace();
  const run = useServerFn(runFlow);
  const qc = useQueryClient();
  const [task, setTask] = useState<string>(EXAMPLES[0]!);
  const [dept, setDept] = useState<string>("");
  const [operator, setOperator] = useState("Bob Henderson");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const canRun = data && data.role !== "auditor";
  const deptId = dept || data?.departments[0]?.id || "";

  async function go() {
    setBusy(true);
    setResult(null);
    try {
      const r = await run({ data: { task, departmentId: deptId, operatorLabel: operator } });
      setResult(r);
      if (!r.ok) toast.error(r.reason);
      else if (r.status === "executed") toast.success(`Trustable Flow executed. ${r.minutes} minutes returned this week.`);
      else if (r.status === "review") toast.message("Routed to human review — the gate wasn't confident enough to act alone.");
      else toast.message("Request rejected by the decision gate.");
      qc.invalidateQueries({ queryKey: ["workspace"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Run failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <section className="panel p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Trustable Flow</h1>
          <ProofBadge kind="live" />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Describe one repetitive task that costs you 15–30 minutes every week.</p>
        {!canRun && <p className="mt-4 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning">Auditors have read-only access. Runs are disabled for your role.</p>}
        <div className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <EmphasizedField label="Operator" value={operator} onChange={setOperator}>
              <Input value={operator} onChange={(e) => setOperator(e.target.value)} maxLength={80} />
            </EmphasizedField>
            <EmphasizedControl label="Department">
              <Select value={deptId} onValueChange={setDept}>
                <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>
                  {data?.departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </EmphasizedControl>
          </div>
          <EmphasizedField label="Task" hint="Describe one repeatable workflow; use your Library to inject trusted context." value={task} onChange={(v) => setTask(v.slice(0, 1000))} library>
            <Textarea rows={5} value={task} onChange={(e) => setTask(e.target.value)} maxLength={1000} />
          </EmphasizedField>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((e, i) => (
              <button key={i} type="button" onClick={() => setTask(e)} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground">
                Example {i + 1}{i === 2 ? " (contains PII)" : ""}
              </button>
            ))}
          </div>
          <Button onClick={go} disabled={!canRun || busy || task.trim().length < 8} className="w-full" size="lg">
            <Sparkles className="mr-2 h-4 w-4" /> {busy ? "Running through the decision gate…" : "Run through the gate"}
          </Button>
        </div>
      </section>

      <section className="panel p-6">
        <h2 className="text-lg font-semibold">Bounded decision</h2>
        <p className="text-sm text-muted-foreground">The model can only answer with a fixed schema. Anything outside it is rejected before it touches data.</p>
        <ol className="mt-5 space-y-2 font-mono text-xs text-muted-foreground">
          <li>1 · Role re-checked on the server (operator or above)</li>
          <li>2 · Task sent as untrusted data to the typed decision tool</li>
          <li>3 · Output validated against a strict schema</li>
          <li>4 · Confidence under 0.70 or PII detected → human review</li>
          <li>5 · Run recorded, block appended to the SHA-512 ledger</li>
        </ol>
        {result?.ok && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <StatusPill status={result.status} />
              <span className="font-mono text-xs text-muted-foreground">{result.model} · {result.latencyMs}ms</span>
            </div>
            <DrillDown title="Bounded decision detail" description="The validated model output and execution outcome for this run." trigger={<button className={`grid w-full grid-cols-3 gap-3 text-center ${drillableClass}`}>
              <Mini label="Action" value={result.decision.action} /><Mini label="Confidence" value={result.decision.confidence.toFixed(2)} /><Mini label="Minutes" value={`+${result.minutes}`} />
            </button>}><pre className="max-h-96 overflow-auto rounded-lg bg-muted/50 p-4 font-mono text-xs">{JSON.stringify(result, null, 2)}</pre></DrillDown>
            <div>
              <p className="eyebrow">Steps</p>
              <ul className="mt-2 space-y-1 text-sm">
                {result.decision.steps.map((s, i) => <li key={i}>— {s}</li>)}
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">{result.decision.rationale}</p>
            {result.decision.pii_detected && <p className="text-sm text-warning">Personal data detected — held for human review.</p>}
            <pre className="max-h-56 overflow-auto rounded-md bg-muted/50 p-3 font-mono text-[11px]">{JSON.stringify(result.decision, null, 2)}</pre>
          </div>
        )}
        {result && !result.ok && <p className="mt-6 text-sm text-destructive">Gate refused: {result.reason}. Nothing was executed.</p>}
      </section>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <p className="font-display text-lg font-bold">{value}</p>
      <p className="eyebrow">{label}</p>
    </div>
  );
}
