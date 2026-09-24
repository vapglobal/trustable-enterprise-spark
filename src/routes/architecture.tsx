import { createFileRoute, Link } from "@tanstack/react-router";
import { ConfidentialFooter, ProofBadge, Wordmark } from "@/components/trustable/Chrome";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "Architecture — Trustable" },
      { name: "description", content: "Trustable reference architecture: Lovable as the generative heart, Trustable as the trust layer." },
      { property: "og:title", content: "Architecture — Trustable" },
      { property: "og:description", content: "What runs today, and the enterprise reference architecture it grows into." },
    ],
  }),
  component: Architecture,
});

const FLOW = [
  ["Operator", "Describes a task in plain language", "live"],
  ["Trustable cockpit", "Built with Lovable · role re-checked server-side", "live"],
  ["Bounded decision gate", "Typed tool output · schema validation · 0.70 threshold", "live"],
  ["Tenant data plane", "Row-level isolation · separate roles table", "live"],
  ["Hash-chained ledger", "Append-only · SHA-512 · verifiable", "live"],
  ["VAULTABLE enclave", "Private VPC / on-prem GPU · zero outbound egress", "reference"],
  ["Enterprise systems", "SAP · Salesforce · Snowflake via mTLS", "reference"],
] as const;

const CONTRACT = `export interface TrustableDataProvider {
  getWorkflow(id: string): Promise<TrustableWorkflow>;
  executeWorkflowStep(stepId: string, payload: Record<string, unknown>): Promise<StepResult>;
  evaluateTypedDecision<T>(prompt: string, schema: BoundedSchema<T>): Promise<TypedDecision<T>>;
  appendLedger(event: string, payload: Json): Promise<LedgerBlock>;
  verifyLedger(): Promise<ChainVerification>;
  getEnclaveStatus(): Promise<EnclaveStatus>;          // reference
  updateModelRoutingPolicy(p: RoutingPolicy): Promise<void>; // reference
}`;

const ROADMAP = [
  ["Days 1–30", "Foundation", "Harden the live controls into a reusable Trustable starter kit. SSO/SAML, SCIM provisioning, customer-managed keys design."],
  ["Days 31–60", "Design partners", "Deploy to design-partner accounts in finance, health, manufacturing, SaaS. One 30-minute Day-1 win per department."],
  ["Days 61–90", "Commercial scale", "Convert partners to contracts, publish the CISO surface report as a standard procurement artifact, enable the SA team."],
];

function Architecture() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Wordmark />
        <Button asChild size="sm" variant="outline"><Link to="/auth">Reviewer sign in</Link></Button>
      </header>
      <main className="mx-auto max-w-6xl space-y-10 px-6 pb-20">
        <div>
          <p className="eyebrow">Heart + trust layer</p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            <span className="text-heart-gradient">Lovable</span> creates. <span className="text-primary">Trustable</span> guarantees.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Every layer is labelled honestly. <strong className="text-foreground">Live</strong> means it's running in this prototype and you can test it. <strong className="text-foreground">Reference architecture</strong> means it's the enterprise deployment design.
          </p>
        </div>

        <section className="panel p-6">
          <h2 className="text-lg font-semibold">End-to-end request path</h2>
          <ol className="mt-5 space-y-3">
            {FLOW.map(([t, d, k], i) => (
              <li key={t} className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1">
                  <p className="font-medium">{t}</p>
                  <p className="text-sm text-muted-foreground">{d}</p>
                </div>
                <ProofBadge kind={k} />
              </li>
            ))}
          </ol>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="panel p-6">
            <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">DataProvider contract</h2></div>
            <p className="mt-1 text-sm text-muted-foreground">UI reads and writes only through this interface — Lovable iterates on the front end while the enterprise back end stays isolated.</p>
            <pre className="mt-4 overflow-auto rounded-md bg-muted/50 p-4 font-mono text-[11px] leading-relaxed">{CONTRACT}</pre>
          </section>
          <section className="panel p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">VAULTABLE zero-egress enclave</h2>
              <ProofBadge kind="reference" />
            </div>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>— Deployed in the customer's private VPC or on-prem; default-deny outbound network policy.</li>
              <li>— Confidential-computing hosts (e.g. AMD SEV-SNP) for memory encryption in use.</li>
              <li>— Customer-owned model keys and routing: bring your own OpenAI / Anthropic / Azure SLA, or local models.</li>
              <li>— Zero data retention enforced at the gateway; the ledger stays inside the boundary.</li>
            </ul>
          </section>
        </div>

        <section className="panel p-6">
          <h2 className="text-lg font-semibold">90-day Solutions Architecture plan</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {ROADMAP.map(([when, t, d]) => (
              <div key={when} className="rounded-lg border border-border p-4">
                <p className="eyebrow">{when}</p>
                <p className="mt-1 font-semibold">{t}</p>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <ConfidentialFooter />
    </div>
  );
}
