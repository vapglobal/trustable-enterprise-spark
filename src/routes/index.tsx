import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Zap, Users, ShieldCheck, Link2, FileCheck2, ArrowRight } from "lucide-react";
import { HeartVault } from "@/components/trustable/HeartVault";
import { ConfidentialFooter, ProofBadge, Wordmark } from "@/components/trustable/Chrome";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trustable — Heart-to-Vault enterprise trust layer for Lovable" },
      { name: "description", content: "Lovable's creative velocity with an enterprise trust layer: tenant isolation, roles, tamper-evident audit, bounded AI decisions." },
      { property: "og:title", content: "Trustable — Enterprise trust layer for Lovable" },
      { property: "og:description", content: "Creativity meets confidence. A confidential working prototype." },
    ],
  }),
  component: Landing,
});

const LIVE = [
  { icon: ShieldCheck, t: "Tenant isolation", d: "Every row scoped to its enterprise in the database, not the UI." },
  { icon: Users, t: "Separate role model", d: "Owner, admin, operator, auditor. Checked server-side on every call." },
  { icon: FileCheck2, t: "Tamper-evident ledger", d: "Append-only SHA-512 hash chain. Verify it live, watch tampering fail." },
  { icon: Zap, t: "Bounded AI decisions", d: "Schema-validated typed output, confidence threshold, human review fallback." },
  { icon: Lock, t: "Red-team workbench", d: "Run real attacks against this app. See each one blocked, with evidence." },
  { icon: Link2, t: "Invite-only access", d: "Named reviewers, revocable, every sign-in written to the ledger." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Wordmark />
        <div className="flex items-center gap-2">
          <span className="hidden eyebrow md:inline">Creativity meets confidence</span>
          <Button asChild variant="outline" size="sm" className="ml-4">
            <Link to="/auth">Reviewer sign in</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-6 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="eyebrow">Confidential · Round 2 working prototype</p>
          <h1 className="mt-5 text-5xl font-bold leading-[1.02] md:text-6xl">
            Heart-to-Vault
            <br />
            <span className="text-vault-gradient">Transformation Engine</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Lovable's creative energy, now with an enterprise trust layer. From idea to impact — secure, compliant, and ready for the real world.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth">
                Enter the enclave <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/architecture">View architecture</Link>
            </Button>
          </div>
          <div className="mt-10 grid max-w-md gap-4">
            {[
              [Zap, "Creative velocity", "Keep what makes Lovable special"],
              [Lock, "Enterprise trust", "Security, privacy, and compliance"],
              [Users, "Real-world impact", "From prototype to production"],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof Zap;
              return (
                <div key={t as string} className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card">
                    <I className="h-4 w-4 text-steel" />
                  </span>
                  <div>
                    <p className="eyebrow text-foreground">{t as string}</p>
                    <p className="text-sm text-muted-foreground">{d as string}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <HeartVault size={440} />
          <div className="mt-2 text-center">
            <p className="font-display text-5xl font-bold tracking-tight">
              TRUST<span className="text-primary">ABLE</span>
            </p>
            <p className="mt-1 text-muted-foreground">Enterprise trust layer for Lovable</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">What actually runs in this prototype</h2>
          <ProofBadge kind="live" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {LIVE.map(({ icon: I, t, d }) => (
            <div key={t} className="panel p-5">
              <I className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Hardware enclaves, on-prem GPU routing, and kernel-level egress controls are shown on the{" "}
          <Link to="/architecture" className="text-primary underline-offset-4 hover:underline">architecture page</Link> and clearly labelled as reference architecture.
        </p>
      </section>
      <ConfidentialFooter />
    </div>
  );
}
