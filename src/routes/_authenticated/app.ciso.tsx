import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Download, ShieldCheck } from "lucide-react";
import { verifyLedger, exportSurfaceReport } from "@/lib/trustable.functions";
import { useWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { ProofBadge } from "@/components/trustable/Chrome";

export const Route = createFileRoute("/_authenticated/app/ciso")({
  component: CisoPage,
});

type V = Awaited<ReturnType<typeof verifyLedger>>;

function CisoPage() {
  const { data } = useWorkspace();
  const verify = useServerFn(verifyLedger);
  const exportFn = useServerFn(exportSurfaceReport);
  const qc = useQueryClient();
  const [v, setV] = useState<V | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function doVerify(tamperSeq?: number) {
    setBusy(tamperSeq ? `t${tamperSeq}` : "v");
    try {
      const r = await verify({ data: { tamperSeq } });
      setV(r);
      if (!tamperSeq) qc.invalidateQueries({ queryKey: ["workspace"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setBusy(null);
    }
  }

  async function doExport() {
    setBusy("x");
    try {
      const r = await exportFn();
      const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `TRUSTABLE_SURFACE_REPORT_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Report exported and recorded in the ledger.");
      qc.invalidateQueries({ queryKey: ["workspace"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Only owners, admins and auditors can export");
    } finally {
      setBusy(null);
    }
  }

  const piiRuns = data?.runs.filter((r) => (r.decision as unknown as { pii_detected?: boolean } | null)?.pii_detected).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">CISO Console</h1>
          <p className="text-sm text-muted-foreground">Security posture of this tenant, straight from the database.</p>
        </div>
        <Button onClick={doExport} disabled={busy === "x"} variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export surface report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Posture title="Tenant isolation" detail="Row-level security on all 6 tables" kind="live" />
        <Posture title="Role model" detail="Separate roles table · server-checked" kind="live" />
        <Posture title="AI gate" detail={`Schema-bound · ${piiRuns} PII holds`} kind="live" />
        <Posture title="Zero-egress enclave" detail="On-prem / private VPC deployment" kind="reference" />
      </div>

      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Audit ledger</h2>
            <p className="text-sm text-muted-foreground">Append-only. Each block's hash covers the previous block, so changing any record breaks every block after it.</p>
          </div>
          <Button onClick={() => doVerify()} disabled={!!busy}>
            <ShieldCheck className="mr-2 h-4 w-4" /> {busy === "v" ? "Walking chain…" : "Verify chain"}
          </Button>
        </div>

        {v && (
          <div className={`mt-5 rounded-lg border p-4 ${v.intact ? "border-success/40 bg-success/10" : "border-destructive/40 bg-destructive/10"}`}>
            <p className={`flex items-center gap-2 font-semibold ${v.intact ? "text-success" : "text-destructive"}`}>
              {v.intact ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              {v.intact ? `Chain intact — ${v.blocks} blocks verified` : `Tampering detected at block ${v.broken.join(", ")}`}
            </p>
            {v.tampered && (
              <p className="mt-1 text-sm text-muted-foreground">
                Simulation: block {v.tampered}'s payload was altered in memory only (minutesSaved → 9999). The stored ledger is unchanged — it can't be edited.
              </p>
            )}
          </div>
        )}

        <div className="mt-5 divide-y divide-border">
          {data?.ledger.map((b) => {
            const bad = v?.broken.includes(b.seq);
            return (
              <div key={b.seq} className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 py-3">
                <span className={`font-mono text-sm ${bad ? "text-destructive" : "text-muted-foreground"}`}>#{b.seq}</span>
                <div className="min-w-0">
                  <p className="text-sm">
                    <span className="font-mono text-primary">{b.event}</span> <span className="text-muted-foreground">· {b.actor} · {new Date(b.created_at).toLocaleString()}</span>
                  </p>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">{b.block_hash}</p>
                </div>
                <Button size="sm" variant="ghost" className="text-xs" disabled={!!busy} onClick={() => doVerify(b.seq)}>
                  {busy === `t${b.seq}` ? "…" : "Simulate tamper"}
                </Button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Posture({ title, detail, kind }: { title: string; detail: string; kind: "live" | "reference" }) {
  return (
    <div className="panel p-5">
      <ProofBadge kind={kind} />
      <p className="mt-3 font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}
