import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LogOut, ShieldAlert } from "lucide-react";
import { bootstrapAccess } from "@/lib/trustable.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ConfidentialFooter, Wordmark } from "@/components/trustable/Chrome";
import { HeartVault } from "@/components/trustable/HeartVault";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({
    meta: [
      { title: "Enclave — Trustable" },
      { name: "description", content: "Trustable tenant console." },
      { property: "og:title", content: "Enclave — Trustable" },
      { property: "og:description", content: "Trustable tenant console." },
    ],
  }),
  component: AppLayout,
});

const NAV = [
  { to: "/app", label: "Overview", exact: true },
  { to: "/app/flow", label: "Trustable Flow" },
  { to: "/app/ciso", label: "CISO Console" },
  { to: "/app/redteam", label: "Red Team" },
  { to: "/app/access", label: "Access" },
] as const;

function AppLayout() {
  const boot = useServerFn(bootstrapAccess);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const access = useQuery({ queryKey: ["access"], queryFn: () => boot(), staleTime: Infinity });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Wordmark />
          <div className="flex items-center gap-3">
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
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: "exact" in n }}
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
              You're signed in, but this email doesn't have an invite yet. Trustable is invite-only — ask the owner to invite this address, then sign in again.
            </p>
          </div>
        )}
        {access.data?.status === "active" && <Outlet />}
      </main>
      <ConfidentialFooter />
    </div>
  );
}
