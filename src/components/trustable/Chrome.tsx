import { Link } from "@tanstack/react-router";
import { HeartMark } from "./HeartVault";
import { CONFIDENTIAL_NOTICE } from "@/lib/tenant";

export function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <HeartMark className="h-6 w-6" />
      <span className="font-display text-lg font-bold tracking-tight">
        TRUST<span className="text-primary">ABLE</span>
      </span>
      <span className="hidden border-l border-border pl-3 eyebrow sm:inline">Powered by Lovable</span>
    </Link>
  );
}

export function ConfidentialFooter() {
  return (
    <footer className="border-t border-border px-6 py-5">
      <p className="mx-auto max-w-6xl text-center font-mono text-[10px] leading-relaxed tracking-wide text-muted-foreground">
        {CONFIDENTIAL_NOTICE}
      </p>
    </footer>
  );
}

export function ProofBadge({ kind }: { kind: "live" | "reference" }) {
  return kind === "live" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-success">
      <span className="h-1.5 w-1.5 rounded-full bg-success" /> Live
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-warning">
      <span className="h-1.5 w-1.5 rounded-full bg-warning" /> Reference architecture
    </span>
  );
}
