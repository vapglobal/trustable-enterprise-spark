import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
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

export const Route = createFileRoute("/_authenticated/app")({
  head: () => pageMeta({ title: "Workspace — Trustable", description: "Your secure Trustable enterprise workspace.", path: "/app", index: false }),
  component: AppLayout,
});

const NAV: { to: string; label: string; perm: Perm; exact?: boolean }[] = [
  { to: "/app", label: "Overview", perm: "overview.view", exact: true },
  { to: "/app/posture", label: "Posture", perm: "posture.view" },
  { to: "/app/evidence", label: "Evidence", perm: "evidence.view" },
  { to: "/app/flow", label: "Trustable Flow", perm: "flow.view" },
  { to: "/app/library", label: "Library", perm: "overview.view" },
  { to: "/app/ciso", label: "CISO Console", perm: "ciso.view" },
  { to: "/app/redteam", label: "Red Team", perm: "redteam.run" },
  { to: "/app/audit", label: "Audit Log", perm: "audit.view" },
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
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Wordmark />
          <div className="flex items-center gap-3">
            {access.data?.email && <span className="hidden text-xs text-muted-foreground md:inline">{access.data.email}</span>}
            {access.data?.role && (
              <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-primary">
                {access.data.role}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="mr-1 h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
        {access.data?.status === "active" && (
          <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6">
            {NAV.filter((n) => access.can(n.perm)).map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: !!n.exact }}
                className="whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "!border-primary !text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
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
      <ConfidentialFooter />
    </div>
  );
}
