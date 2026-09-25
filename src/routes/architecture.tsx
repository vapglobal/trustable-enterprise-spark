import { createFileRoute, Link } from "@tanstack/react-router";
import { pageMeta } from "@/lib/site";
import { ConfidentialFooter, ProofBadge, Wordmark } from "@/components/trustable/Chrome";
import { Button } from "@/components/ui/button";
import { DrillDown } from "@/components/trustable/DrillDown";
import { Activity, Bot, Building2, Database, FileCheck2, LockKeyhole, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/architecture")({
  head: () =>
    pageMeta({
      title: "Architecture — Trustable Enterprise Trust Layer",
      description: "How Trustable adds tenant isolation, role-based access, tamper-evident audit and governed AI on top of Lovable — what runs today and where it goes next.",
      path: "/architecture",
    }),
  component: Architecture,
});

const FLOW = [
  ["Operator", "Describes a task in plain language", "live", Bot, "left-[4%] top-[42%]"],
  ["Trustable cockpit", "Built with Lovable · role re-checked server-side", "live", Activity, "left-[20%] top-[12%]"],
  ["Decision gate", "Typed output · schema validation · confidence threshold", "live", ShieldCheck, "left-[40%] top-[12%]"],
  ["Tenant data", "Row-level isolation · separate roles table", "live", Database, "left-[40%] bottom-[12%]"],
  ["Audit ledger", "Append-only · SHA-512 · verifiable", "live", FileCheck2, "left-[61%] top-[42%]"],
  ["VAULTABLE", "Private VPC / on-prem GPU · zero outbound egress", "reference", LockKeyhole, "right-[4%] top-[12%]"],
  ["Enterprise systems", "SAP · Salesforce · Snowflake via mTLS", "reference", Building2, "right-[4%] bottom-[12%]"],
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

        <section className="panel overflow-hidden p-0 shadow-[0_35px_95px_-38px_oklch(0_0_0/98%)]">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border px-6 py-5"><div><p className="eyebrow">Interactive trust graph</p><h2 className="mt-1 text-2xl font-semibold">End-to-end request path</h2><p className="mt-1 text-sm text-muted-foreground">Select a node to inspect its responsibility, proof status, and connection.</p></div><div className="flex gap-2"><ProofBadge kind="live" /><ProofBadge kind="reference" /></div></div>
          <div className="relative hidden h-[430px] overflow-hidden bg-background/50 md:block">
            <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:28px_28px]" />
            <svg viewBox="0 0 1000 430" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true"><defs><filter id="edge-glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path d="M110 215 C165 215 170 100 230 100 L395 100 M500 100 C565 100 555 215 635 215 M500 330 C565 330 555 215 635 215 M700 215 C765 215 760 100 835 100 M700 215 C765 215 760 330 835 330 M330 120 C360 160 365 270 425 305" fill="none" stroke="var(--primary)" strokeOpacity=".55" strokeWidth="2.5" strokeDasharray="8 7" filter="url(#edge-glow)" /></svg>
            {FLOW.map(([t, d, k, Icon, position], i) => <DrillDown key={t} title={t} description={d} trigger={<Button variant="outline" className={`absolute z-10 h-auto w-40 flex-col items-start gap-2 whitespace-normal border-primary/30 bg-card/95 p-4 text-left shadow-[0_22px_50px_-20px_oklch(0_0_0/98%)] ${position}`}><span className="flex w-full items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-full border border-primary/35 bg-background shadow-lg"><Icon className="h-4 w-4 text-primary" /></span><span className="font-mono text-[9px] text-muted-foreground">0{i + 1}</span></span><span className="font-semibold">{t}</span><ProofBadge kind={k} /></Button>}><div className="space-y-4"><p className="text-sm leading-relaxed text-muted-foreground">{d}</p><div className="border border-border bg-muted/40 p-3 text-sm"><strong>Connection:</strong> This node receives a typed input, applies its bounded responsibility, and passes a traceable result to the next authorized node.</div><ProofBadge kind={k} /></div></DrillDown>)}
          </div>
          <ol className="space-y-2 p-4 md:hidden" aria-label="Architecture graph as a list">{FLOW.map(([t, d, k, Icon], i) => <li key={t}><DrillDown title={t} description={d} trigger={<Button variant="outline" className="h-auto w-full justify-start gap-3 whitespace-normal p-3 text-left shadow-lg"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/30 bg-background"><Icon className="h-4 w-4 text-primary" /></span><span className="min-w-0 flex-1"><span className="block font-semibold">{String(i + 1).padStart(2, "0")} · {t}</span><span className="block text-xs text-muted-foreground">{d}</span></span><ProofBadge kind={k} /></Button>}><p className="text-sm text-muted-foreground">{d}</p></DrillDown></li>)}</ol>
        </section>

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
