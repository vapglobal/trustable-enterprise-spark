import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Braces,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleOff,
  Clipboard,
  Clock3,
  Code2,
  Copy,
  Database,
  Download,
  FileJson,
  Gauge,
  GitBranch,
  KeyRound,
  Network,
  PanelLeft,
  PanelRight,
  Play,
  Plus,
  Radio,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Workflow,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProofBadge } from "@/components/trustable/Chrome";
import { ReportActions } from "@/components/trustable/ReportActions";
import { Tip } from "@/components/trustable/Tip";
import { FacetTree, type FacetTreeGroup } from "@/components/trustable/FacetTree";
import { cn } from "@/lib/utils";
import { pageMeta } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/app/api-console")({
  head: () => pageMeta({ title: "OASA API Console — Trustable", description: "Inspect verified Trustable server actions and the EngineWare OASA reference architecture.", path: "/app/api-console", index: false }),
  component: ApiConsole,
});

type Surface = "Live server action" | "Reference architecture";
type Endpoint = {
  id: string; namespace: string; method: "GET" | "POST"; path: string; title: string; description: string; surface: Surface;
  route?: string; parameters: { name: string; type: string; required: boolean; example: string }[]; response: Record<string, unknown>;
};

const ENDPOINTS: Endpoint[] = [
  { id: "workspace.get", namespace: "workspace", method: "GET", path: "getWorkspace", title: "Workspace snapshot", description: "Returns the signed-in tenant, role, departments, runs, metrics, and recent audit events.", surface: "Live server action", route: "/app", parameters: [], response: { tenant: "Tenant-scoped", role: "Role-checked", departments: "Authorized set", audit: "Recent events" } },
  { id: "flow.run", namespace: "flows", method: "POST", path: "runFlow", title: "Evaluate governed flow", description: "Evaluates a typed flow request, applies policy gates, records the result, and returns its audit receipt.", surface: "Live server action", route: "/app/flow", parameters: [{ name: "task", type: "string", required: true, example: "Review contractor access and route exceptions" }, { name: "departmentId", type: "uuid", required: true, example: "Select an authorized department" }, { name: "operatorLabel", type: "string", required: true, example: "Bob Henderson" }], response: { ok: true, status: "executed | review | denied", receipt: "Audit-linked result" } },
  { id: "posture.get", namespace: "security", method: "GET", path: "getPosture", title: "Security posture", description: "Returns tenant risk, findings, control coverage, evidence freshness, and remediation ownership.", surface: "Live server action", route: "/app/posture", parameters: [], response: { risk: "Calculated", coverage: "Calculated", evidenceFreshness: "Calculated" } },
  { id: "evidence.analyze", namespace: "evidence", method: "POST", path: "analyzeEvidenceFn", title: "Analyze evidence", description: "Analyzes authorized evidence and creates prioritized remediation findings.", surface: "Live server action", route: "/app/evidence", parameters: [{ name: "evidenceId", type: "uuid", required: true, example: "Choose an uploaded evidence item" }], response: { findings: "Prioritized controls", audit: "Analysis event" } },
  { id: "audit.list", namespace: "audit", method: "POST", path: "listAudit", title: "Search audit events", description: "Returns filtered tenant audit events with server-enforced authorization.", surface: "Live server action", route: "/app/audit", parameters: [{ name: "eventType", type: "string", required: false, example: "authz.denied" }, { name: "limit", type: "integer", required: false, example: "100" }], response: { events: "Filtered tenant events", integrity: "Hash-chain fields" } },
  { id: "ledger.verify", namespace: "audit", method: "POST", path: "verifyLedger", title: "Verify audit ledger", description: "Checks the tenant audit chain and reports the first broken link if verification fails.", surface: "Live server action", route: "/app/audit", parameters: [], response: { valid: true, checked: "Tenant chain length" } },
  { id: "assistant.ask", namespace: "assistant", method: "POST", path: "askTrustableAssistant", title: "Ask Trustable", description: "Answers natural-language questions against explicitly selected, authorized workspace context.", surface: "Live server action", parameters: [{ name: "prompt", type: "string", required: true, example: "What should we remediate first?" }, { name: "contextPaths", type: "string[]", required: true, example: "posture, findings" }], response: { answer: "Context-scoped response", history: "Account-synced" } },
  { id: "oasa.negotiate", namespace: "oasa", method: "POST", path: "/v1/organic/negotiate", title: "Negotiate endpoint graphlet", description: "OASA advocate negotiation contract awaiting a callable EngineWare connector.", surface: "Reference architecture", parameters: [{ name: "advocate", type: "string", required: true, example: "bob.sales-ops" }, { name: "intent", type: "string", required: true, example: "Reconcile pipeline owners" }], response: { status: "Reference only", verification: "Direct route check returned 404" } },
  { id: "oasa.graph", namespace: "oasa", method: "GET", path: "/v1/organizations/{id}/graph", title: "Organization graph", description: "OASA organization graph and customized graphlets; no callable contract is present in this repository.", surface: "Reference architecture", parameters: [{ name: "id", type: "uuid", required: true, example: "Organization identifier" }], response: { status: "Reference only", verification: "Direct route check returned 404" } },
  { id: "oasa.escalate", namespace: "oasa", method: "POST", path: "/v1/advocates/escalate", title: "Escalate advocate request", description: "Proposed captain and sub-command resource escalation surface.", surface: "Reference architecture", parameters: [{ name: "graphletId", type: "uuid", required: true, example: "Personal graphlet identifier" }, { name: "request", type: "object", required: true, example: "Requested resources and permissions" }], response: { status: "Reference only", verification: "Direct route check returned 404" } },
];

const NAMESPACES = ["workspace", "flows", "security", "evidence", "audit", "assistant", "oasa"];

function ApiConsole() {
  const [selectedId, setSelectedId] = useState("flow.run");
  const [query, setQuery] = useState("");
  const [facets, setFacets] = useState<Record<string, string[]>>({ surface: [], method: [], namespace: [] });
  const [environment, setEnvironment] = useState("trustable-session");
  const [sample, setSample] = useState("recommended");
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const selected = ENDPOINTS.find((endpoint) => endpoint.id === selectedId) ?? ENDPOINTS[0];
  if (!selected) return null;
  const filtered = useMemo(() => ENDPOINTS.filter((endpoint) => `${endpoint.namespace} ${endpoint.method} ${endpoint.path} ${endpoint.title} ${endpoint.description}`.toLowerCase().includes(query.toLowerCase()) && (!facets.surface?.length || facets.surface.includes(endpoint.surface)) && (!facets.method?.length || facets.method.includes(endpoint.method)) && (!facets.namespace?.length || facets.namespace.includes(endpoint.namespace))), [query, facets]);
  const facetGroups = useMemo<FacetTreeGroup[]>(() => {
    const count = (key: "surface" | "method" | "namespace", value: string) => ENDPOINTS.filter((endpoint) => endpoint[key] === value).length;
    return [
      { id: "surface", label: "Availability", options: ["Live server action", "Reference architecture"].map((value) => ({ value, label: value, count: count("surface", value) })) },
      { id: "method", label: "Request method", options: ["GET", "POST"].map((value) => ({ value, label: value, count: count("method", value) })) },
      { id: "namespace", label: "Namespace", options: NAMESPACES.map((value) => ({ value, label: value, count: count("namespace", value) })) },
    ];
  }, []);
  const payload = Object.fromEntries(selected.parameters.map((parameter) => [parameter.name, parameter.example]));
  const copy = (value: unknown, message = "Copied") => navigator.clipboard.writeText(typeof value === "string" ? value : JSON.stringify(value, null, 2)).then(() => toast.success(message));
  const downloadSpec = () => {
    const spec = { openapi: "3.1.0", info: { title: "Trustable OASA Surface Inventory", version: "0.1-reference" }, "x-trustable-status": "Inventory only — not a callable public REST specification", surfaces: ENDPOINTS };
    const url = URL.createObjectURL(new Blob([JSON.stringify(spec, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "trustable-oasa-surface-inventory.json"; anchor.click(); URL.revokeObjectURL(url);
  };

  return <div className="min-w-0 space-y-3">
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-border pb-3">
      <div className="min-w-0"><div className="flex min-w-0 items-center gap-2"><Braces className="h-5 w-5 shrink-0 text-primary" /><h1 className="truncate text-xl font-bold sm:text-2xl">OASA API Console</h1></div><p className="mt-1 max-w-3xl text-xs text-muted-foreground">Organic API Advocate System Architecture · Created and powered by EngineWare.ai · adapted for Trustable</p></div>
      <div className="flex shrink-0 items-center gap-1"><Tip text="Toggle endpoint explorer"><Button size="icon" variant={leftOpen ? "secondary" : "ghost"} onClick={() => setLeftOpen((value) => !value)}><PanelLeft className="h-4 w-4" /></Button></Tip><Tip text="Toggle request inspector"><Button size="icon" variant={rightOpen ? "secondary" : "ghost"} onClick={() => setRightOpen((value) => !value)}><PanelRight className="h-4 w-4" /></Button></Tip><ReportActions title="Trustable OASA Surface Inventory" data={{ verifiedLiveActions: ENDPOINTS.filter((item) => item.surface === "Live server action"), referenceArchitecture: ENDPOINTS.filter((item) => item.surface === "Reference architecture") }} /></div>
    </header>

    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <button onClick={() => window.dispatchEvent(new CustomEvent("trustable:assistant", { detail: { prompt: "Help me find a Trustable action or understand an OASA interface." } }))} className="flex min-w-0 items-center gap-2 rounded-md border border-primary/25 bg-card/70 px-3 py-2 text-left shadow-lg transition hover:border-primary/60"><Sparkles className="h-4 w-4 shrink-0 text-primary" /><span className="truncate text-xs text-muted-foreground">Magic Bar: ask about actions, schemas, permissions, graphlets, or saved queries…</span><span className="ml-auto hidden shrink-0 font-mono text-[9px] text-muted-foreground sm:inline">ASK TRUSTABLE</span></button>
      <div className="flex items-center gap-2"><ProofBadge kind="live" /><span className="text-[10px] text-muted-foreground">7 verified server actions</span><ProofBadge kind="reference" /></div>
    </div>

    <Tabs defaultValue="console" className="min-w-0">
      <div className="flex items-center justify-between gap-2 overflow-x-auto border border-border bg-card/45 px-2 py-1">
        <TabsList className="h-8 shrink-0 bg-transparent p-0"><TabsTrigger value="console" className="h-7 text-xs"><TerminalSquare className="mr-1 h-3.5 w-3.5" />Console</TabsTrigger><TabsTrigger value="activity" className="h-7 text-xs"><Activity className="mr-1 h-3.5 w-3.5" />Verification</TabsTrigger><TabsTrigger value="spec" className="h-7 text-xs"><ShieldCheck className="mr-1 h-3.5 w-3.5" />Spec & auth</TabsTrigger><TabsTrigger value="docs" className="h-7 text-xs"><BookOpen className="mr-1 h-3.5 w-3.5" />Docs</TabsTrigger><TabsTrigger value="graph" className="h-7 text-xs"><GitBranch className="mr-1 h-3.5 w-3.5" />Graph</TabsTrigger></TabsList>
        <div className="flex shrink-0 items-center gap-1"><Button size="sm" variant="ghost" onClick={downloadSpec}><Download className="mr-1 h-3.5 w-3.5" />Surface JSON</Button><Button size="sm" variant="ghost" onClick={() => copy(selected, "Surface definition copied")}><Copy className="mr-1 h-3.5 w-3.5" />Copy</Button></div>
      </div>

      <TabsContent value="console" className="mt-2">
        <div className={cn("grid h-[calc(100vh-255px)] min-h-[590px] overflow-hidden border border-border bg-card/25", leftOpen && rightOpen ? "xl:grid-cols-[260px_minmax(430px,1fr)_330px]" : leftOpen ? "xl:grid-cols-[260px_minmax(500px,1fr)]" : rightOpen ? "xl:grid-cols-[minmax(500px,1fr)_330px]" : "grid-cols-1")}>
          {leftOpen && <aside className="hidden min-w-0 border-r border-border xl:flex xl:flex-col"><Explorer query={query} setQuery={setQuery} facets={facets} setFacets={setFacets} facetGroups={facetGroups} filtered={filtered} selectedId={selectedId} setSelectedId={setSelectedId} /></aside>}
          <section className="min-w-0 overflow-y-auto">
             <div className="flex items-center justify-between border-b border-border px-4 py-2"><div className="flex min-w-0 items-center gap-2"><MethodBadge method={selected.method} /><span className="truncate font-mono text-xs">{selected.path}</span></div><MobileExplorer query={query} setQuery={setQuery} facets={facets} setFacets={setFacets} facetGroups={facetGroups} filtered={filtered} selectedId={selectedId} setSelectedId={setSelectedId} /></div>
            <div className="space-y-4 p-4">
              <section><div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3"><div className="min-w-0"><h2 className="text-lg font-semibold">{selected.title}</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{selected.description}</p></div><ProofBadge kind={selected.surface === "Live server action" ? "live" : "reference"} /></div></section>
              <section className="grid gap-3 sm:grid-cols-2"><GuidedSelect label="Environment" tip="Trustable server actions use your current named, tenant-scoped session. OASA references cannot be executed until a connector contract exists." value={environment} onValueChange={setEnvironment} options={[{ value: "trustable-session", label: "Trustable session (recommended)" }, { value: "reviewer-session", label: "Reviewer session" }, { value: "other", label: "Other / custom" }]} /><GuidedSelect label="Request preset" tip="Presets prefill safe example values. Review every value before sending a live action from its owning workspace." value={sample} onValueChange={setSample} options={[{ value: "recommended", label: "Recommended safe sample" }, { value: "empty", label: "Empty request" }, { value: "other", label: "Other / custom" }]} /></section>
              <Section title="Parameters" icon={Settings2} action={<Tip text="Parameter values are examples only; live actions run from their owning workspace"><Button size="sm" variant="ghost"><Plus className="mr-1 h-3.5 w-3.5" />Add</Button></Tip>}>
                {selected.parameters.length ? <div className="space-y-2">{selected.parameters.map((parameter) => <div key={parameter.name} className="grid gap-2 border-b border-border pb-2 last:border-0 last:pb-0 sm:grid-cols-[140px_90px_minmax(0,1fr)] sm:items-center"><div><p className="font-mono text-xs text-foreground">{parameter.name}</p><p className="text-[9px] uppercase text-muted-foreground">{parameter.required ? "Required" : "Optional"}</p></div><span className="font-mono text-[10px] text-primary">{parameter.type}</span><Tip text={`Example ${parameter.type} value for ${parameter.name}`}><Input value={sample === "empty" ? "" : parameter.example} readOnly placeholder={`Enter ${parameter.name}…`} className="h-8 font-mono text-xs" /></Tip></div>)}</div> : <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-success" />No input parameters required.</div>}
              </Section>
              <Section title="Authorization boundary" icon={KeyRound}><div className="grid gap-2 sm:grid-cols-3"><Gate label="Authentication" value="Named session" /><Gate label="Tenant scope" value="Server checked" /><Gate label="Role policy" value="Least privilege" /></div></Section>
              <Section title="Request preview" icon={Code2} action={<Button size="sm" variant="ghost" onClick={() => copy(payload)}><Copy className="mr-1 h-3.5 w-3.5" />Copy</Button>}><pre className="max-h-44 overflow-auto bg-background/70 p-3 font-mono text-[10px] leading-relaxed text-muted-foreground">{JSON.stringify(payload, null, 2)}</pre></Section>
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div className={cn("flex items-start gap-2 border px-3 py-2 text-xs", selected.surface === "Live server action" ? "border-success/30 bg-success/10 text-success" : "border-warning/30 bg-warning/10 text-warning")}>
                {selected.surface === "Live server action" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <CircleOff className="mt-0.5 h-4 w-4 shrink-0" />}<span>{selected.surface === "Live server action" ? "Callable through Trustable’s authenticated interface. Open the owning workspace to execute it with its full validation and audit path." : "Not callable here. Direct checks of the displayed REST path returned 404; this remains OASA Reference architecture."}</span>
              </div>{selected.route ? <Button asChild><Link to={selected.route}><Play className="mr-1.5 h-4 w-4" />Open live surface</Link></Button> : <Button disabled><CircleOff className="mr-1.5 h-4 w-4" />Connector required</Button>}</div>
            </div>
          </section>
          {rightOpen && <aside className="hidden min-w-0 border-l border-border xl:flex xl:flex-col"><Inspector selected={selected} payload={payload} copy={copy} /></aside>}
          <MobileInspector selected={selected} payload={payload} copy={copy} />
        </div>
      </TabsContent>

      <TabsContent value="activity"><VerificationPanel /></TabsContent>
      <TabsContent value="spec"><SpecPanel downloadSpec={downloadSpec} /></TabsContent>
      <TabsContent value="docs"><DocsPanel /></TabsContent>
      <TabsContent value="graph"><GraphPanel /></TabsContent>
    </Tabs>
    <div className="border border-warning/30 bg-warning/10 px-3 py-2 text-center font-mono text-[9px] font-semibold uppercase text-warning">Confidential · Proprietary EngineWare.ai IP · Created and owned by Christopher Ware · Not for redistribution</div>
  </div>;
}

function Explorer({ query, setQuery, facets, setFacets, facetGroups, filtered, selectedId, setSelectedId }: { query: string; setQuery: (value: string) => void; facets: Record<string, string[]>; setFacets: (value: Record<string, string[]>) => void; facetGroups: FacetTreeGroup[]; filtered: Endpoint[]; selectedId: string; setSelectedId: (value: string) => void }) {
  return <><div className="space-y-2 border-b border-border p-3"><Label className="text-[10px] uppercase text-muted-foreground">Endpoint explorer</Label><div className="flex items-center gap-2"><div className="relative min-w-0 flex-1"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search every field…" className="h-9 pl-8 text-xs" /></div><FacetTree groups={facetGroups} selected={facets} onChange={setFacets} label="Filter endpoint catalog" /></div><p className="text-[10px] text-muted-foreground">{filtered.length} of {ENDPOINTS.length} surfaces · all facets searchable</p></div><ScrollArea className="min-h-0 flex-1"><div className="space-y-1 p-2">{NAMESPACES.map((namespace) => { const items = filtered.filter((endpoint) => endpoint.namespace === namespace); if (!items.length) return null; return <Collapsible key={namespace} defaultOpen><CollapsibleTrigger asChild><Button variant="ghost" className="h-7 w-full justify-between px-2 text-[10px] font-semibold uppercase text-muted-foreground"><span className="flex items-center gap-2"><Database className="h-3 w-3" />{namespace}</span><ChevronDown className="h-3 w-3" /></Button></CollapsibleTrigger><CollapsibleContent className="space-y-0.5">{items.map((endpoint) => <Button key={endpoint.id} variant="ghost" onClick={() => setSelectedId(endpoint.id)} className={cn("h-auto w-full justify-start gap-2 px-2 py-2 text-left", selectedId === endpoint.id && "bg-primary/10 text-foreground")}><MethodBadge method={endpoint.method} compact /><span className="min-w-0 flex-1"><span className="block truncate font-mono text-[10px]">{endpoint.path}</span><span className="block truncate text-[9px] text-muted-foreground">{endpoint.title}</span></span>{endpoint.surface === "Live server action" ? <Check className="h-3 w-3 shrink-0 text-success" /> : <AlertTriangle className="h-3 w-3 shrink-0 text-warning" />}</Button>)}</CollapsibleContent></Collapsible>; })}{!filtered.length && <p className="p-4 text-center text-xs text-muted-foreground">No matching surfaces. Try a namespace, action, or status.</p>}</div></ScrollArea><div className="border-t border-border p-3"><p className="text-[9px] leading-relaxed text-muted-foreground">Live means a callable Trustable server action exists. Reference means the EngineWare OASA connector contract is not present here.</p></div></>;
}

function MobileExplorer(props: Parameters<typeof Explorer>[0]) { return <Sheet><SheetTrigger asChild><Button size="sm" variant="outline" className="xl:hidden"><PanelLeft className="mr-1 h-3.5 w-3.5" />Actions</Button></SheetTrigger><SheetContent side="left" className="flex w-[330px] flex-col p-0"><SheetHeader className="border-b border-border p-4 text-left"><SheetTitle>Endpoint explorer</SheetTitle><SheetDescription>Live actions and OASA references</SheetDescription></SheetHeader><Explorer {...props} /></SheetContent></Sheet>; }

function Inspector({ selected, payload, copy }: { selected: Endpoint; payload: Record<string, string>; copy: (value: unknown, message?: string) => void }) {
  const sample = selected.surface === "Live server action" ? `// Trustable typed server action\nconst result = await ${selected.path}({\n  data: ${JSON.stringify(payload, null, 2)}\n});` : `# OASA reference surface only\n# Direct route verification: HTTP 404\n${selected.method} ${selected.path}\n# Connector contract required before execution`;
  return <><div className="flex items-center justify-between border-b border-border px-3 py-2"><div><p className="text-xs font-semibold">Request inspector</p><p className="font-mono text-[9px] text-muted-foreground">{selected.id}</p></div><Button size="icon" variant="ghost" onClick={() => copy(sample, "Code sample copied")}><Copy className="h-3.5 w-3.5" /></Button></div><ScrollArea className="min-h-0 flex-1"><div className="space-y-4 p-3"><div className="grid grid-cols-2 gap-2"><InspectorMetric icon={selected.surface === "Live server action" ? Radio : CircleOff} label="Surface" value={selected.surface === "Live server action" ? "Verified" : "Reference"} /><InspectorMetric icon={ShieldCheck} label="Exposure" value="Private" /></div><CodeBlock title="TypeScript" value={sample} /><CodeBlock title="Expected response" value={JSON.stringify(selected.response, null, 2)} /><Section title="Policy checks" icon={ShieldCheck}><div className="space-y-2"><Gate label="Named identity" value="Required" /><Gate label="Tenant membership" value="Required" /><Gate label="Permission" value="Required" /><Gate label="Audit receipt" value={selected.surface === "Live server action" ? "Action-dependent" : "Not connected"} /></div></Section><div className="border border-border bg-muted/30 p-3 text-[10px] leading-relaxed text-muted-foreground">Secrets and bearer credentials are never rendered in this inspector. Parameter examples are sanitized and are not persisted from this console.</div></div></ScrollArea></>;
}

function MobileInspector({ selected, payload, copy }: Parameters<typeof Inspector>[0]) { return <div className="fixed bottom-4 right-4 z-30 xl:hidden"><Sheet><SheetTrigger asChild><Button size="icon" aria-label="Open request inspector"><PanelRight className="h-4 w-4" /></Button></SheetTrigger><SheetContent side="right" className="flex w-[350px] flex-col p-0"><SheetHeader className="sr-only"><SheetTitle>Request inspector</SheetTitle><SheetDescription>Sanitized code and policy checks</SheetDescription></SheetHeader><Inspector selected={selected} payload={payload} copy={copy} /></SheetContent></Sheet></div>; }

function VerificationPanel() { return <div className="grid gap-4 border border-border bg-card/30 p-5 lg:grid-cols-[1fr_320px]"><div><p className="eyebrow">Verified surface inventory</p><h2 className="mt-1 text-xl font-semibold">What actually responds</h2><div className="mt-4 space-y-2">{ENDPOINTS.map((endpoint) => <div key={endpoint.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border border-border bg-background/45 px-3 py-2"><MethodBadge method={endpoint.method} compact /><div className="min-w-0"><p className="truncate font-mono text-xs">{endpoint.path}</p><p className="truncate text-[10px] text-muted-foreground">{endpoint.description}</p></div>{endpoint.surface === "Live server action" ? <span className="flex items-center gap-1 text-[10px] text-success"><CheckCircle2 className="h-3.5 w-3.5" />Server action</span> : <span className="flex items-center gap-1 text-[10px] text-warning"><XCircle className="h-3.5 w-3.5" />REST 404</span>}</div>)}</div></div><aside className="border border-warning/30 bg-warning/10 p-4"><AlertTriangle className="h-5 w-5 text-warning" /><h3 className="mt-3 font-semibold">Verification result</h3><p className="mt-2 text-xs leading-relaxed text-muted-foreground">The previously displayed `/v1/...` paths were checked directly against the running Trustable app and returned HTTP 404. They are now labeled Reference architecture. Live entries in this console are real authenticated Trustable server actions, not public REST endpoints.</p><p className="mt-4 font-mono text-[9px] uppercase text-warning">Checked 25 Sep 2026 · no success simulated</p></aside></div>; }

function SpecPanel({ downloadSpec }: { downloadSpec: () => void }) { return <div className="grid gap-4 border border-border bg-card/30 p-5 lg:grid-cols-2"><Section title="Surface inventory" icon={FileJson}><p className="text-xs leading-relaxed text-muted-foreground">The downloadable JSON describes verified Trustable server actions and OASA references together, but is intentionally not represented as a deployable public OpenAPI contract.</p><Button className="mt-4" variant="outline" onClick={downloadSpec}><Download className="mr-2 h-4 w-4" />Download inventory</Button></Section><Section title="Authentication model" icon={KeyRound}><div className="space-y-2"><Gate label="Identity" value="Named account" /><Gate label="Session" value="Private and revocable" /><Gate label="Authorization" value="Server re-checked" /><Gate label="Secrets" value="Never displayed" /></div></Section></div>; }

function DocsPanel() { return <div className="grid gap-4 border border-border bg-card/30 p-5 md:grid-cols-3"><Doc icon={Workflow} title="Trustable server actions" text="Typed, authenticated application operations. Run them from their owning workspace to preserve validation, permissions, and audit behavior." /><Doc icon={Network} title="OASA references" text="EngineWare.ai’s Organic API Advocate System Architecture. Pre-wired as an interface model until a verified connector contract is available." /><Doc icon={ShieldCheck} title="Truth labels" text="Live identifies a callable implementation in this repository. Reference architecture identifies a specified but unavailable integration." /></div>; }

function GraphPanel() { const nodes = ["Bob advocate", "Sally advocate", "Captain", "Policy router", "Customer gate", "Impact ledger"]; return <div className="border border-border bg-card/30 p-5"><div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3"><div><p className="eyebrow">OASA organization graph</p><h2 className="mt-1 text-xl font-semibold">Advocates negotiate governed resources</h2></div><ProofBadge kind="reference" /></div><div className="mt-8 flex flex-wrap items-center justify-center gap-2">{nodes.map((node, index) => <div key={node} className="flex items-center gap-2"><div className="min-w-32 border border-primary/30 bg-primary/5 p-3 text-center shadow-lg"><Network className="mx-auto h-4 w-4 text-primary" /><p className="mt-2 text-xs font-semibold">{node}</p><p className="mt-1 text-[9px] uppercase text-muted-foreground">{index < 2 ? "Personal graphlet" : index === 2 ? "Sub-command" : "Governed service"}</p></div>{index < nodes.length - 1 && <ChevronRight className="h-4 w-4 text-primary" />}</div>)}</div><p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">Presentation-layer wiring only. Endpoint negotiation, resource escalation, and customer API mutation require the verified EngineWare OASA connector contract.</p></div>; }

function GuidedSelect({ label, tip, value, onValueChange, options }: { label: string; tip: string; value: string; onValueChange: (value: string) => void; options: { value: string; label: string }[] }) { return <div className="enterprise-field"><div className="mb-2 flex items-center justify-between"><Label>{label}</Label><Tip text={tip}><Button size="icon" variant="ghost" className="h-6 w-6" aria-label={`${label} help`}><Gauge className="h-3.5 w-3.5" /></Button></Tip></div><Select value={value} onValueChange={onValueChange}><SelectTrigger><SelectValue placeholder={`Choose ${label.toLowerCase()}…`} /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>; }
function Section({ title, icon: Icon, action, children }: { title: string; icon: typeof Activity; action?: React.ReactNode; children: React.ReactNode }) { return <section className="border border-border bg-card/55 p-3 shadow-lg"><div className="mb-3 flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-xs font-semibold"><Icon className="h-3.5 w-3.5 text-primary" />{title}</h3>{action}</div>{children}</section>; }
function MethodBadge({ method, compact = false }: { method: Endpoint["method"]; compact?: boolean }) { return <span className={cn("shrink-0 border px-1.5 py-0.5 font-mono font-semibold", compact ? "text-[8px]" : "text-[9px]", method === "GET" ? "border-success/30 bg-success/10 text-success" : "border-primary/30 bg-primary/10 text-primary")}>{method}</span>; }
function Gate({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-2 border border-border bg-background/45 px-2.5 py-2 text-[10px]"><span className="text-muted-foreground">{label}</span><span className="flex items-center gap-1 font-medium"><Check className="h-3 w-3 text-success" />{value}</span></div>; }
function InspectorMetric({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) { return <div className="border border-border bg-card p-2"><Icon className="h-3.5 w-3.5 text-primary" /><p className="mt-2 text-xs font-semibold">{value}</p><p className="text-[8px] uppercase text-muted-foreground">{label}</p></div>; }
function CodeBlock({ title, value }: { title: string; value: string }) { return <div><p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase text-muted-foreground"><Code2 className="h-3.5 w-3.5 text-primary" />{title}</p><pre className="max-h-64 overflow-auto border border-border bg-background/65 p-3 font-mono text-[9px] leading-relaxed text-muted-foreground">{value}</pre></div>; }
function Doc({ icon: Icon, title, text }: { icon: typeof Activity; title: string; text: string }) { return <section className="border border-border bg-card/55 p-4 shadow-lg"><Icon className="h-5 w-5 text-primary" /><h2 className="mt-4 font-semibold">{title}</h2><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{text}</p></section>; }