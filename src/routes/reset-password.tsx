import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfidentialFooter, Wordmark } from "@/components/trustable/Chrome";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Trustable" },
      { name: "description", content: "Choose a new password for your Trustable account." },
      { property: "og:title", content: "Set a new password — Trustable" },
      { property: "og:description", content: "Choose a new password for your Trustable account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw !== pw2) return toast.error("Passwords do not match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated.");
    navigate({ to: "/app", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto w-full max-w-6xl px-6 py-6"><Wordmark /></header>
      <main className="mx-auto flex w-full max-w-md flex-1 items-center px-6">
        <form onSubmit={submit} className="panel w-full space-y-4 p-8">
          <p className="eyebrow">Account recovery</p>
          <h1 className="text-2xl font-bold">Set a new password</h1>
          <div className="space-y-2"><Label>New password</Label><Input type="password" autoComplete="new-password" required minLength={10} value={pw} onChange={(e) => setPw(e.target.value)} /></div>
          <div className="space-y-2"><Label>Confirm</Label><Input type="password" autoComplete="new-password" required minLength={10} value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "Saving…" : "Save password"}</Button>
        </form>
      </main>
      <ConfidentialFooter />
    </div>
  );
}
