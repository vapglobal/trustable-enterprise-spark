import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Lock, LogOut, ShieldAlert } from "lucide-react";
import { recordSignOut } from "@/lib/trustable.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ConfidentialFooter, Wordmark } from "@/components/trustable/Chrome";
import { HeartVault } from "@/components/trustable/HeartVault";
import { useAccess } from "@/hooks/use-access";
import type { Perm } from "@/lib/controls";
import { pageMeta } from "@/lib/site";
import { GlobalAssistant } from "@/components/trustable/GlobalAssistant";
import { WorkspaceRail } from "@/components/trustable/WorkspaceRail";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => pageMeta({ title: "Workspace — Trustable", description: "Your secure Trustable enterprise workspace.", path: "/app", index: false }),
  component: AppLayout,
});

const NAV: { to: string; label: string; perm: Perm; exact?: boolean }[] = [
  { to: "/app", label: "Overview", perm: "overview.view", exact: true },
  { to: "/app/posture", label: "Posture", perm: "posture.view" },
  { to: "/app/evidence", label: "Evidence", perm: "evidence.view" },
  { to: "/app/flow", label: "Trustable Flow", perm: "flow.view" },
  { to: "/app/api-console", label: "API Console", perm: "ciso.view" },
  { to: "/app/library", label: "Library", perm: "overview.view" },
  { to: "/app/ciso", label: "CISO Console", perm: "ciso.view" },
  { to: "/app/redteam", label: "Red Team", perm: "redteam.run" },
  { to: "/app/audit", label: "Audit Log", perm: "audit.view" },
  { to: "/app/completion-ledger", label: "Completion Ledger", perm: "audit.view" },
  { to: "/app/access", label: "Access", perm: "access.view" },
  { to: "/app/settings", label: "Settings", perm: "overview.view" },
];

function permFor(path: string): Perm | null {
  const p = path.replace(/\/$/, "") || "/app";
  const match = NAV.filter((n) => (n.exact ? p === n.to : p === n.to || p.startsWith(n.to + "/")));
  return match.sort((a, b) => b.to.length - a.to.length)[0]?.perm ?? null;
}

function AppLayout() {
  const signOutFn = useServerFn(recordSignOut);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const access = useAccess();

  async function signOut() {
    await signOutFn().catch(() => undefined);
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const required = permFor(pathname);
  const allowed = !required || access.can(required);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="border-b border-warning/25 bg-warning/10 px-4 py-1 text-center font-mono text-[9px] font-semibold uppercase text-warning">EngineWare.ai proprietary IP · Owned by Christopher Ware · Confidential · Not for redistribution</div>
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4">
          <div className="min-w-0 overflow-hidden"><Wordmark /></div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            {access.data?.status === "active" && <GlobalAssistant pathname={pathname} />}
            {access.data?.email && <span className="hidden text-xs text-muted-foreground md:inline">{access.data.email}</span>}
            {access.data?.role && (
              <span className="hidden rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-primary sm:inline">
                {access.data.role}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={signOut} aria-label="Sign out" className="px-2 sm:px-3">
              <LogOut className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>
      <div className="flex min-w-0 flex-1">
      {access.data?.status === "active" && <WorkspaceRail can={access.can} />}
      <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
        {access.isLoading && (
          <div className="flex flex-col items-center py-20">
            <HeartVault size={220} />
            <p className="mt-4 eyebrow">Verifying identity and tenant membership</p>
          </div>
        )}
        {access.isError && <p className="text-destructive">Could not verify access. Please sign in again.</p>}
        {access.data?.status === "pending" && (
          <div className="panel mx-auto max-w-lg p-8 text-center">
            <ShieldAlert className="mx-auto h-8 w-8 text-warning" />
            <h1 className="mt-4 text-2xl font-bold">Access pending</h1>
            <p className="mt-2 text-muted-foreground">
              {access.data.verified
                ? "You're signed in, but this account has no role in this tenant. Ask the owner to grant access, then sign in again."
                : "Confirm your email address from the link in your inbox, then sign in again."}
            </p>
          </div>
        )}
        {access.data?.status === "active" &&
          (allowed ? (
            <Outlet />
          ) : (
            <div className="panel mx-auto max-w-lg p-8 text-center">
              <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
              <h1 className="mt-4 text-2xl font-bold">Not permitted</h1>
              <p className="mt-2 text-muted-foreground">Your role doesn't include access to this workspace. The attempt is enforced on the server as well.</p>
            </div>
          ))}
      </main>
      </div>
      <ConfidentialFooter />
    </div>
  );
}
