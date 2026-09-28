import { createFileRoute, Link } from "@tanstack/react-router";
import { pageMeta } from "@/lib/site";
import { ConfidentialFooter, ProofBadge, Wordmark } from "@/components/trustable/Chrome";
import { Button } from "@/components/ui/button";
import { GraphWorkbench } from "@/components/trustable/GraphWorkbench";

export const Route = createFileRoute("/architecture")({
  head: () =>
    pageMeta({
      title: "Architecture — Trustable Enterprise Trust Layer",
      description: "How Trustable adds tenant isolation, role-based access, tamper-evident audit and governed AI on top of Lovable — what runs today and where it goes next.",
      path: "/architecture",
    }),
  component: Architecture,
});

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

        <GraphWorkbench />

        <section className="panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">OASA · EngineWare.ai proprietary architecture</p>
              <h2 className="mt-1 text-2xl font-bold">Organic API Advocate System Architecture</h2>
            </div>
            <ProofBadge kind="reference" />
          </div>
          <p className="mt-4 max-w-3xl text-sm text-muted-foreground">
            A revolutionary, cutting-edge agentic evolution of the OAS specification: individual advocates negotiate typed endpoint subsets, parameters, permissions, and resources through governed organization graphlets.
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase text-primary">Created and powered by EngineWare.ai · Owned by Christopher Ware · Confidential · Not for redistribution</p>
        </section>

        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
          <section className="panel min-w-0 overflow-hidden p-6">
            <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">DataProvider contract</h2></div>
            <p className="mt-1 text-sm text-muted-foreground">UI reads and writes only through this interface — Lovable iterates on the front end while the enterprise back end stays isolated.</p>
            <pre className="mt-4 max-w-full overflow-auto rounded-md bg-muted/50 p-4 font-mono text-[11px] leading-relaxed">{CONTRACT}</pre>
          </section>
          <section className="panel min-w-0 overflow-hidden p-6">
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
