import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfidentialFooter, Wordmark } from "@/components/trustable/Chrome";
import { HeartVault } from "@/components/trustable/HeartVault";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Trustable" },
      { name: "description", content: "Invite-only reviewer access to the Trustable enclave." },
      { property: "og:title", content: "Sign in — Trustable" },
      { property: "og:description", content: "Invite-only reviewer access." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/app", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/app", replace: true });
        else toast.success("Check your inbox to confirm your email, then sign in.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/app", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto w-full max-w-6xl px-6 py-6">
        <Wordmark />
      </header>
      <main className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 px-6 md:grid-cols-2">
        <div className="hidden justify-center md:flex">
          <HeartVault size={340} />
        </div>
        <div className="panel p-8">
          <p className="eyebrow">Invite-only access</p>
          <h1 className="mt-3 text-3xl font-bold">{mode === "in" ? "Enter the enclave" : "Accept your invite"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use the email address your invite was sent to. Every sign-in is written to the audit ledger.
          </p>
          <Button type="button" variant="outline" className="mt-6 w-full" onClick={google}>
            Continue with Google
          </Button>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Verifying…" : mode === "in" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <button type="button" className="mt-4 text-sm text-primary hover:underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
            {mode === "in" ? "Have an invite but no account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </main>
      <ConfidentialFooter />
    </div>
  );
}
