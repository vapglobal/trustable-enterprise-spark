import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Bot, Check, Clock3, History, Layers3, LoaderCircle, Send, Sparkles, Trash2, X } from "lucide-react";
import { askTrustableAssistant, clearAssistantHistory, getAssistantHistory } from "@/lib/assistant.server";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const CONTEXTS = [
  ["posture", "Security posture"], ["findings", "Open findings"], ["evidence", "Evidence"], ["flows", "Flow runs"], ["audit", "Audit events"], ["library", "My library"],
] as const;
const SUGGESTIONS = ["What should we remediate first?", "Summarize our strongest and weakest controls.", "Which evidence is stale or missing?", "Draft an executive security briefing."];

export function GlobalAssistant({ pathname }: { pathname: string }) {
  const history = useServerFn(getAssistantHistory);
  const ask = useServerFn(askTrustableAssistant);
  const clear = useServerFn(clearAssistantHistory);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["assistant-history"], queryFn: () => history() });
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [contexts, setContexts] = useState<string[]>([pathname.includes("evidence") ? "evidence" : pathname.includes("flow") ? "flows" : pathname.includes("audit") ? "audit" : "posture", "findings"]);
  const bottom = useRef<HTMLDivElement>(null);
  const recent = useMemo(() => (q.data ?? []).filter((m) => m.role === "user").slice(-4).reverse(), [q.data]);
  useEffect(() => { if (open) bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [open, q.data, busy]);
  useEffect(() => {
    const handle = (event: Event) => {
      const detail = (event as CustomEvent<{ prompt?: string }>).detail;
      setOpen(true);
      if (detail?.prompt) setPrompt(detail.prompt);
    };
    window.addEventListener("trustable:assistant", handle);
    return () => window.removeEventListener("trustable:assistant", handle);
  }, []);
  async function send(text = prompt) {
    if (text.trim().length < 2 || busy) return;
    const optimistic = { id: `local-${Date.now()}`, role: "user" as const, content: text.trim(), context_paths: contexts, created_at: new Date().toISOString() };
    qc.setQueryData(["assistant-history"], [...(q.data ?? []), optimistic]); setPrompt(""); setBusy(true);
    try { await ask({ data: { prompt: text.trim(), contextPaths: contexts } }); await q.refetch(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Assistant unavailable"); await q.refetch(); }
    finally { setBusy(false); }
  }
  return (
    <>
      <Button type="button" onClick={() => setOpen((v) => !v)} className="shadow-[0_8px_30px_-10px_var(--primary)]" aria-expanded={open}>
        <Sparkles className="mr-1.5 h-4 w-4" /> Ask Trustable
      </Button>
      {open && <div className="fixed inset-x-0 top-[69px] z-40 border-b border-primary/25 bg-background/96 shadow-[0_30px_80px_-30px_oklch(0_0_0/90%)] backdrop-blur-xl">
        <div className="mx-auto grid max-h-[calc(100vh-90px)] max-w-6xl grid-cols-1 overflow-hidden lg:grid-cols-[240px_1fr]">
          <aside className="hidden border-r border-border p-4 lg:block">
            <p className="eyebrow flex items-center gap-2"><History className="h-3.5 w-3.5" />Recent queries</p>
            <div className="mt-3 space-y-1">{recent.length ? recent.map((m) => <button key={m.id} className="w-full truncate rounded-md px-2 py-2 text-left text-xs text-muted-foreground hover:bg-accent hover:text-foreground" onClick={() => setPrompt(m.content)}>{m.content}</button>) : <p className="text-xs text-muted-foreground">Your account-synced history starts here.</p>}</div>
            <Button className="mt-4 w-full" size="sm" variant="ghost" onClick={() => confirm("Clear your Trustable AI conversation history?") && clear().then(() => q.refetch())}><Trash2 className="mr-1.5 h-3.5 w-3.5" />Clear history</Button>
          </aside>
          <section className="flex min-h-[440px] flex-col">
            <div className="flex items-start justify-between border-b border-border px-5 py-4">
              <div><p className="flex items-center gap-2 font-semibold"><Bot className="h-5 w-5 text-primary" />Trustable AI Assistant <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-success">Live</span></p><p className="text-xs text-muted-foreground">One continuous, tenant-scoped conversation · history synced to your account</p></div>
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="max-h-[46vh] flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {!q.data?.length && <div className="mx-auto max-w-2xl py-6 text-center"><Sparkles className="mx-auto h-8 w-8 text-primary" /><h2 className="mt-3 text-xl font-semibold">Ask across your Trustable workspace</h2><p className="mt-1 text-sm text-muted-foreground">Select authorized context, ask naturally, and continue the same conversation whenever you return.</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} className="rounded-lg border border-border bg-card/70 p-3 text-left text-sm shadow-lg transition hover:-translate-y-0.5 hover:border-primary/50">{s}</button>)}</div></div>}
              {q.data?.map((m) => <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}><div className={cn("max-w-3xl rounded-xl border px-4 py-3 text-sm shadow-lg", m.role === "user" ? "border-primary/30 bg-primary/10" : "border-border bg-card")}><div className="assistant-markdown"><ReactMarkdown>{m.content}</ReactMarkdown></div>{m.context_paths.length > 0 && <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Context: {m.context_paths.join(" · ")}</p>}</div></div>)}
              {busy && <div className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin text-primary" />Trustable is analyzing authorized context…</div>}<div ref={bottom} />
            </div>
            <div className="border-t border-border p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Popover><PopoverTrigger asChild><Button size="sm" variant="outline"><Layers3 className="mr-1.5 h-4 w-4" />Context ({contexts.length})</Button></PopoverTrigger><PopoverContent align="start" className="w-64"><p className="mb-2 text-xs font-medium">Use authorized workspace context</p>{CONTEXTS.map(([id, label]) => <label key={id} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 text-sm hover:bg-accent"><Checkbox checked={contexts.includes(id)} onCheckedChange={(v) => setContexts(v ? [...contexts, id] : contexts.filter((x) => x !== id))} />{label}{contexts.includes(id) && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}</label>)}</PopoverContent></Popover>
                {SUGGESTIONS.slice(0, 2).map((s) => <button key={s} className="hidden rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary hover:text-foreground md:block" onClick={() => setPrompt(s)}>{s}</button>)}
                <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground"><Clock3 className="h-3 w-3" />Current page included by selection</span>
              </div>
              <div className="flex gap-2 rounded-xl border border-primary/20 bg-card p-2 shadow-[0_12px_35px_-18px_oklch(0_0_0/90%)] focus-within:ring-2 focus-within:ring-ring"><Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Ask about risk, controls, findings, evidence, audit events, flows, or your library…" className="min-h-12 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0" rows={2} /><Button onClick={() => send()} disabled={busy || prompt.trim().length < 2} size="icon" className="self-end"><Send className="h-4 w-4" /></Button></div>
            </div>
          </section>
        </div>
      </div>}
    </>
  );
}
