import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, X } from "lucide-react";
import { simulateAccess } from "@/lib/permission-sim.functions";
import { Button } from "@/components/ui/button";

export function PermissionSimulator() {
  const fn = useServerFn(simulateAccess);
  const m = useMutation({ mutationFn: () => fn() });
  return (
    <section className="panel space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Live · evaluated by the database on every run</p>
          <h2 className="text-xl font-bold">Permission simulator</h2>
          <p className="text-sm text-muted-foreground">Checks every member against every workspace, including groups, custom roles and deny overrides.</p>
        </div>
        <Button onClick={() => m.mutate()} disabled={m.isPending}>{m.isPending ? "Evaluating…" : "Run simulation"}</Button>
      </div>
      {m.error && <p className="text-sm text-destructive">{(m.error as Error).message}</p>}
      {m.data && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-muted-foreground">
              <tr><th className="py-2 pr-3">Member</th>{m.data.workspaces.map((w) => <th key={w.to} className="px-1 py-2 font-medium" title={w.perm}>{w.label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {m.data.rows.map((r) => (
                <tr key={r.userId}>
                  <td className="py-2 pr-3"><div className="font-medium">{r.email}</div><div className="font-mono text-[10px] uppercase text-muted-foreground">{r.role}</div></td>
                  {m.data.workspaces.map((w) => (
                    <td key={w.to} className="px-1 py-2 text-center" aria-label={`${w.label}: ${r.granted[w.perm] ? "allowed" : "denied"}`}>
                      {r.granted[w.perm] ? <Check className="mx-auto h-4 w-4 text-primary" /> : <X className="mx-auto h-4 w-4 text-muted-foreground/60" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
