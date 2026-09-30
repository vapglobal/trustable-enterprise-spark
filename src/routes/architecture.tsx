import { createFileRoute, Link } from "@tanstack/react-router";
import { pageMeta } from "@/lib/site";
import { ConfidentialFooter, ProofBadge, Wordmark } from "@/components/trustable/Chrome";
import { Button } from "@/components/ui/button";
import { GraphWorkbench } from "@/components/trustable/GraphWorkbench";
import { Download, FileText, Shield, Cpu, Sparkles } from "lucide-react";

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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                The EngineWare Autonomous Organic Advocate System (AOAS)
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Decentralized Sub-Commander Control Nodes negotiating on behalf of corporate advocates using TypeSafe Jev System One.
              </p>
            </div>
            <ProofBadge kind="live" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2 font-medium text-destructive">
                <Shield className="h-4 w-4" /> CISO Sub-Commander
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Traps OWASP LLM Top 10 probes in &lt;42ms, enforces kernel-level 0.0.0.0/0 netfilter lockdown, and verifies SHA-512 ledger blocks.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2 font-medium text-primary">
                <Sparkles className="h-4 w-4" /> Operator Sub-Commander
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Represents Bob & Sally, prioritizing interactive UI requests with zero artificial latency (&lt;200ms TTFT target).
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2 font-medium text-amber-500">
                <Cpu className="h-4 w-4" /> Resource Sub-Commander
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Monitors database pool health, dynamically applying jittered backpressure to background batch agents when load &gt;= 30%.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2 font-medium text-emerald-500">
                <FileText className="h-4 w-4" /> Veracity Sub-Commander
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Enforces the universal DataProvider contract over mTLS, requiring authentic ATS/ERP cryptographic receipts.
              </p>
            </div>
          </div>
        </section>

        <section className="panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Executive Interview Decks & Architecture Downloads
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Confidential materials prepared for Lovable Executive Leadership (Matthew Norton, Jessica, Katie, Kevin, Luke).
              </p>
            </div>
            <ProofBadge kind="live" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <a
              href="/downloads/ENGINEWARE_ORGANIC_API_SURFACE_PRESENTATION.pdf"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col justify-between rounded-lg border border-border bg-muted/30 p-4 hover:border-primary/50 transition-colors"
            >
              <div>
                <span className="font-mono text-[10px] text-primary uppercase font-bold">12-Slide Executive PDF</span>
                <p className="mt-1 font-semibold text-sm">AOAS & Organic API Surface</p>
                <p className="mt-1 text-xs text-muted-foreground">Landscape card deck covering multi-agent dialectic, TypeSafe economics, and viral PLG.</p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs text-primary font-medium">
                <Download className="h-3 w-3" /> Download PDF (29 KB)
              </span>
            </a>

            <a
              href="/downloads/TRUSTABLE_TECHNICAL_PRESENTATION.pdf"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col justify-between rounded-lg border border-border bg-muted/30 p-4 hover:border-primary/50 transition-colors"
            >
              <div>
                <span className="font-mono text-[10px] text-primary uppercase font-bold">16-Slide Architecture Master</span>
                <p className="mt-1 font-semibold text-sm">Trustable Technical Presentation</p>
                <p className="mt-1 text-xs text-muted-foreground">Deep hardware enclave specs, AMD SEV-SNP isolation, and $4.2M ARR payback model.</p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs text-primary font-medium">
                <Download className="h-3 w-3" /> Download PDF (38 KB)
              </span>
            </a>

            <a
              href="/downloads/ENGINEWARE_ORGANIC_API_SURFACE_PRESENTATION.pptx"
              download
              className="flex flex-col justify-between rounded-lg border border-border bg-muted/30 p-4 hover:border-primary/50 transition-colors"
            >
              <div>
                <span className="font-mono text-[10px] text-primary uppercase font-bold">Widescreen PPTX Deck</span>
                <p className="mt-1 font-semibold text-sm">PowerPoint Presentation</p>
                <p className="mt-1 text-xs text-muted-foreground">16:9 widescreen presentation deck with embedded speaker notes and card layouts.</p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs text-primary font-medium">
                <Download className="h-3 w-3" /> Download PPTX (53 KB)
              </span>
            </a>

            <a
              href="/downloads/MATT_NORTON_AOAS_EXECUTIVE_EMAIL.html"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col justify-between rounded-lg border border-border bg-muted/30 p-4 hover:border-primary/50 transition-colors"
            >
              <div>
                <span className="font-mono text-[10px] text-primary uppercase font-bold">Executive Email Preview</span>
                <p className="mt-1 font-semibold text-sm">Forwardable Leadership Briefing</p>
                <p className="mt-1 text-xs text-muted-foreground">Rendered HTML email briefing explaining AOAS Sub-Commander nodes and Lovable duality.</p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs text-primary font-medium">
                <FileText className="h-3 w-3" /> View HTML Briefing
              </span>
            </a>
          </div>
        </section>

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
