import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Boxes,
  Braces,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  Database,
  FileSpreadsheet,
  GitBranch,
  Mail,
  Play,
  Save,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
  Smartphone,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfidentialFooter, ProofBadge, StatusPill, Wordmark } from "@/components/trustable/Chrome";
import { EmphasizedControl, EmphasizedField } from "@/components/trustable/EmphasizedField";
import { DrillDown } from "@/components/trustable/DrillDown";
import { ReportActions } from "@/components/trustable/ReportActions";
import { FacetTree, type FacetTreeGroup } from "@/components/trustable/FacetTree";
import { pageMeta } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/flow")({
  head: () =>
    pageMeta({
      title: "Mobile App Creator & Enterprise Flow Builder — Trustable",
      description: "Build, simulate, and measure governed mobile enterprise workflows in plain language.",
      path: "/flow",
      index: false,
    }),
  component: PublicFlowPage,
});

type Template = {
  id: string;
  title: string;
  task: string;
  role: string;
  department: string;
  category: string;
  risk: "Low" | "Review" | "Elevated";
  apps: string[];
  minutes: number;
  created: string;
  used: string;
};

const SEEDS = [
  ["Quarterly contractor access review", "Each quarter, I review which contractors still have access to our 14 SaaS tools, including their home addresses, then email an Excel file to Security.", "IT Admin", "IT", "Access", "Elevated", ["Entra ID", "Excel", "Outlook"], 180],
  ["Pipeline hygiene", "Every Monday I reconcile pipeline owners, correct account stages, and email a summary to the revenue leadership team.", "Sales Ops", "Revenue", "Reporting", "Low", ["Salesforce", "Excel", "Outlook"], 75],
  ["Leadership action register", "After each leadership meeting, turn notes into action items with owners and deadlines and publish them to the delivery board.", "Chief of Staff", "Executive", "Coordination", "Low", ["Teams", "Jira"], 45],
  ["Vendor risk intake", "Collect security questionnaires and policies from new vendors, identify unanswered controls, and route material gaps to Security.", "Risk Analyst", "Security", "Risk", "Review", ["SharePoint", "Jira", "Outlook"], 120],
  ["Joiner access package", "When a new employee starts, create the approved account package for their department and notify their manager.", "HR Partner", "People", "Onboarding", "Review", ["Workday", "Entra ID", "Teams"], 60],
  ["Invoice exception review", "Find invoices above policy thresholds, attach supporting records, and send exceptions to the finance approver.", "Controller", "Finance", "Approval", "Review", ["SQL Server", "Excel", "Outlook"], 90],
] as const;

const TEMPLATES: Template[] = Array.from({ length: 24 }, (_, i) => {
  const s = SEEDS[i % SEEDS.length]!;
  return {
    id: `TF-${String(i + 1).padStart(3, "0")}`,
    title: i < SEEDS.length ? s[0] : `${s[0]} · ${Math.floor(i / SEEDS.length) + 1}`,
    task: s[1],
    role: s[2],
    department: s[3],
    category: s[4],
    risk: s[5],
    apps: [...s[6]],
    minutes: s[7] + (i % 4) * 10,
    created: `${3 + i} days ago`,
    used: i % 5 === 0 ? "Never" : `${(i % 8) + 1}h ago`,
  };
});

function PublicFlowPage() {
  const [selected, setSelected] = useState(TEMPLATES[0]!);
  const [task, setTask] = useState(selected.task);
  const [dept, setDept] = useState("Revenue Operations");
  const [operator, setOperator] = useState("Bob Henderson");
  const [query, setQuery] = useState("");
  const [facets, setFacets] = useState<Record<string, string[]>>({ role: [], category: [], department: [], risk: [], app: [] });
  const [expert, setExpert] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const visible = useMemo(
    () =>
      TEMPLATES.filter(
        (t) =>
          `${t.title} ${t.task} ${t.role} ${t.department} ${t.category} ${t.apps.join(" ")}`.toLowerCase().includes(query.toLowerCase()) &&
          (!facets["role"]?.length || facets["role"].includes(t.role)) &&
          (!facets["category"]?.length || facets["category"].includes(t.category)) &&
          (!facets["department"]?.length || facets["department"].includes(t.department)) &&
          (!facets["risk"]?.length || facets["risk"].includes(t.risk)) &&
          (!facets["app"]?.length || t.apps.some((item) => facets["app"]?.includes(item)))
      ),
    [query, facets]
  );

  const filterCount = Object.values(facets).reduce((sum, values) => sum + values.length, 0);

  const facetGroups = useMemo<FacetTreeGroup[]>(() => {
    const options = (values: string[], key: keyof Template) =>
      [...new Set(values)].map((value) => ({
        value,
        label: value,
        count: TEMPLATES.filter((template) => (key === "apps" ? template.apps.includes(value) : template[key] === value)).length,
      }));
    return [
      { id: "role", label: "People and roles", options: options(TEMPLATES.map((t) => t.role), "role") },
      { id: "department", label: "Organization and teams", options: options(TEMPLATES.map((t) => t.department), "department") },
      { id: "category", label: "Work and flow types", options: options(TEMPLATES.map((t) => t.category), "category") },
      { id: "risk", label: "Risk and review", options: options(TEMPLATES.map((t) => t.risk), "risk") },
      { id: "app", label: "Systems and services", options: options(TEMPLATES.flatMap((t) => t.apps), "apps") },
    ];
  }, []);

  const choose = (t: Template) => {
    setSelected(t);
    setTask(t.task);
    setResult(null);
  };

  async function go() {
    setBusy(true);
    setResult(null);
    await new Promise((resolve) => setTimeout(resolve, 340));
    const isRisky = task.toLowerCase().includes("address") || task.toLowerCase().includes("ssn") || task.toLowerCase().includes("export");
    const simulatedResult = {
      ok: true,
      status: isRisky ? "review" : "executed",
      minutes: selected.minutes,
      latencyMs: 24,
      reason: isRisky ? "Requires approval: Contains sensitive fields." : undefined,
    };
    setResult(simulatedResult);
    if (isRisky) {
      toast.warning("Trustable held this flow for human review gate (PII/sensitive address path detected).");
    } else {
      toast.success(`Flow compiled & verified. +${selected.minutes} minutes returned to ${dept}.`);
    }
    setBusy(false);
  }

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 border-b border-border">
        <div className="flex items-center gap-4">
          <Wordmark />
          <span className="hidden sm:inline-block border-l border-border pl-4 font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Mobile App Creator Surface
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="outline">
            <Link to="/">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Home
            </Link>
          </Button>
          <Button asChild size="sm" variant="default">
            <Link to="/architecture">Architecture</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <p className="eyebrow font-mono text-xs uppercase text-primary">Mobile-First Builder Interface</p>
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">Mobile App &amp; Flow Creator</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Describe business requirements in natural language. Trustable maps the enterprise services, checks the governance boundary, and compiles a hardened, auditable workflow.
            </p>
          </div>
          <div className="flex gap-2">
            <ProofBadge kind="live" />
            <Button variant={expert ? "default" : "outline"} onClick={() => setExpert((v) => !v)}>
              <Braces className="mr-2 h-4 w-4" />
              {expert ? "Simple view" : "Show wiring"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(380px,490px)_1fr]">
          {/* Column 1: Flow Catalog */}
          <aside className="panel max-h-[820px] overflow-hidden p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow font-mono text-[10px] uppercase text-muted-foreground">Flow Catalog</p>
                <h2 className="font-semibold text-sm">{visible.length} available templates</h2>
              </div>
              <Boxes className="h-5 w-5 text-primary" />
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 text-xs"
                    placeholder="Search flows, apps, roles…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <FacetTree groups={facetGroups} selected={facets} onChange={setFacets} label="Filter flow catalog" />
              </div>

              <div className="flex min-h-6 flex-wrap items-center gap-1">
                {filterCount === 0 ? (
                  <Tag>All 24 starter flows</Tag>
                ) : (
                  Object.entries(facets).flatMap(([group, values]) =>
                    values.map((value) => (
                      <button
                        key={`${group}-${value}`}
                        type="button"
                        onClick={() =>
                          setFacets((current) => ({
                            ...current,
                            [group]: current[group]?.filter((item) => item !== value) ?? [],
                          }))
                        }
                        className="inline-flex items-center gap-1 rounded border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[9px] text-foreground"
                      >
                        {value}
                        <X className="h-2.5 w-2.5" />
                      </button>
                    ))
                  )
                )}
              </div>
            </div>

            <div className="mt-3 max-h-[660px] space-y-2 overflow-y-auto pr-1">
              {visible.map((t) => (
                <Button
                  key={t.id}
                  variant="ghost"
                  onClick={() => choose(t)}
                  className={`h-auto w-full justify-start whitespace-normal border p-3 text-left transition-all ${
                    selected.id === t.id ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card/40 hover:bg-card/80"
                  }`}
                >
                  <div className="w-full">
                    <div className="flex items-start gap-2">
                      <FlowIcon category={t.category} />
                      <span className="flex-1 font-medium leading-tight text-xs">{t.title}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Tag>{t.role}</Tag>
                      <Tag>{t.department}</Tag>
                      <Risk value={t.risk} />
                    </div>
                    <p className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                      <span>Created {t.created}</span>
                      <span className="font-mono text-primary">+{t.minutes}m</span>
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </aside>

          {/* Column 2: The Mobile Smartphone Frame */}
          <section className="mx-auto w-full max-w-[460px] rounded-[36px] border-[7px] border-slate-700/50 bg-card p-2.5 shadow-[0_35px_90px_-35px_oklch(0_0_0/95%)]">
            <div className="rounded-[28px] border border-border bg-background p-5 relative overflow-hidden">
              {/* Phone Speaker Notch */}
              <div className="mx-auto mb-4 h-1.5 w-24 rounded-full bg-muted/80" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow font-mono text-[10px] text-primary">Mobile Creator</p>
                  <h2 className="text-xl font-bold tracking-tight">What should we improve?</h2>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 border border-primary/30">
                  <UserRound className="h-5 w-5 text-primary" />
                </div>
              </div>

              <div className="mt-4 space-y-3.5">
                <EmphasizedField
                  label="Describe the work"
                  hint="Use plain language. Mapped services update in real-time."
                  value={task}
                  onChange={(v) => setTask(v.slice(0, 1000))}
                  library
                >
                  <Textarea
                    rows={6}
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    maxLength={1000}
                    className="text-xs leading-relaxed"
                  />
                </EmphasizedField>

                <div className="rounded-lg border border-primary/25 bg-primary/5 p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Trustable Recognized Systems
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selected.apps.map((app) => (
                      <Tag key={app}>{app}</Tag>
                    ))}
                    <Tag>Quarterly trigger</Tag>
                    {task.toLowerCase().includes("address") && <Risk value="Elevated" />}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <EmphasizedField label="Owner" hint="Named owner responsible for this flow." value={operator} onChange={setOperator}>
                    <Input value={operator} onChange={(e) => setOperator(e.target.value)} placeholder="e.g. Bob Henderson" className="text-xs" />
                  </EmphasizedField>

                  <EmphasizedControl label="Team" hint="Authorized team partition.">
                    <Select value={dept} onValueChange={setDept}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Choose team…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Revenue Operations">Revenue Operations</SelectItem>
                        <SelectItem value="Security & Compliance">Security & Compliance</SelectItem>
                        <SelectItem value="Platform Architecture">Platform Architecture</SelectItem>
                        <SelectItem value="Executive Operations">Executive Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </EmphasizedControl>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <Mini label="Weekly value" value={`${selected.minutes}m`} />
                  <Mini label="Services" value={String(selected.apps.length)} />
                  <Mini label="Checks" value="5/5" />
                </div>

                <Button onClick={go} disabled={busy || task.trim().length < 8} className="w-full font-semibold" size="lg">
                  <Play className="mr-2 h-4 w-4" />
                  {busy ? "Compiling & Verifying…" : "Check and build my flow"}
                </Button>

                <div className="grid grid-cols-4 gap-1 pt-1">
                  <Button size="sm" variant="ghost" title="Save draft" onClick={() => toast.success("Mobile flow configuration saved.")}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" title="Copy flow prompt" onClick={() => { navigator.clipboard.writeText(task); toast.success("Prompt copied to clipboard"); }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" title="Share flow" onClick={() => toast.success("Share link generated.")}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <ReportActions title={selected.title} data={{ ...selected, task }} className="px-2" />
                </div>
              </div>
            </div>
          </section>

          {/* Column 3: Live Flow Whiteboard */}
          <aside className="panel min-h-[660px] overflow-hidden p-0">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <p className="eyebrow font-mono text-[10px] uppercase text-primary">Live Flow Whiteboard</p>
                <h2 className="truncate font-semibold text-base">Your flow is taking shape</h2>
              </div>
              <GitBranch className="h-5 w-5 shrink-0 text-primary" />
            </div>

            <Tabs defaultValue="map" className="min-w-0">
              <TabsList className="h-10 w-full justify-start overflow-x-auto rounded-none border-b border-border bg-card/50 px-3">
                <TabsTrigger value="map" className="text-xs">Topology Map</TabsTrigger>
                <TabsTrigger value="checks" className="text-xs">Safety Checks</TabsTrigger>
                <TabsTrigger value="wiring" className="text-xs">Wiring &amp; Schema</TabsTrigger>
                <TabsTrigger value="outcome" className="text-xs">Measured Outcome</TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="m-0 p-5">
                <FlowMap apps={selected.apps} risky={task.toLowerCase().includes("address") || task.toLowerCase().includes("ssn")} />
              </TabsContent>

              <TabsContent value="checks" className="m-0 space-y-3 p-5">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <CheckRow text="Identity &amp; Tenant Partition Confirmed" />
                  <CheckRow text="Services &amp; APIs Verified" />
                  <CheckRow text="Sensitive Data Classified" warn={task.toLowerCase().includes("address")} />
                  <CheckRow text="Audit Receipt Cryptographically Sealed" />
                </div>

                {task.toLowerCase().includes("address") ? (
                  <div className="rounded-lg border border-warning/40 bg-warning/10 p-3.5 mt-4">
                    <p className="flex gap-2 text-sm font-semibold text-warning">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      Sensitive-Data Path Detected
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Home addresses require a human approval gate before export outside the tenant perimeter.
                    </p>
                  </div>
                ) : (
                  <div className="border border-success/30 bg-success/10 p-3.5 rounded-lg text-xs text-success mt-4">
                    All currently mapped paths pass the visible enterprise security constraints.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="wiring" className="m-0 p-5">
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs text-primary font-semibold">runFlow · Authenticated Contract</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase text-muted-foreground">OASA REST Mapping · Enterprise Isolation</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(JSON.stringify({ operator, department: dept, task, controls: ["rbac", "pii", "confidence", "ledger"] }, null, 2)); toast.success("JSON copied"); }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="mt-3 max-h-64 overflow-auto border border-border bg-background/80 p-3 text-[11px] font-mono text-muted-foreground rounded-lg">
                    {JSON.stringify({ operator, department: dept, task, controls: ["rbac", "pii", "confidence", "ledger"] }, null, 2)}
                  </pre>
                  <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                    <Link to="/architecture">View Full Architecture Contracts <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="outcome" className="m-0 p-5">
                {result?.ok ? (
                  <div className="rounded-lg border border-success/35 bg-success/10 p-5">
                    <p className="flex items-center gap-2 font-semibold text-success text-base">
                      <Check className="h-5 w-5" />
                      Governed Flow Verified &amp; Compiled
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <StatusPill status={result.status} />
                      <span className="font-mono text-xs">{result.latencyMs}ms · +{result.minutes}m saved/week</span>
                    </div>
                    <p className="mt-2 text-sm text-foreground/90 leading-relaxed">
                      This is auditable work returning measurable value to your team graphlet, sealed with an immutable SHA-512 receipt.
                    </p>
                  </div>
                ) : (
                  <div className="flex min-h-64 flex-col items-center justify-center border border-dashed border-border p-6 text-center rounded-xl">
                    <BarChart3 className="h-8 w-8 text-muted-foreground opacity-60" />
                    <h3 className="mt-3 font-semibold text-sm">Your measured outcome appears here</h3>
                    <p className="mt-2 max-w-sm text-xs text-muted-foreground">
                      Click "Check and build my flow" inside the mobile creator to execute the governance gate and measure time returned.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </aside>
        </div>
      </main>

      <ConfidentialFooter />
    </div>
  );
}

function FlowMap({ apps, risky }: { apps: string[]; risky: boolean }) {
  const nodes = [
    { icon: Clock3, label: "Quarterly", kind: "Trigger", position: "left-3 top-1/2 -translate-y-1/2" },
    ...apps.slice(0, 3).map((label, i) => ({
      icon: i === 0 ? Database : i === 1 ? FileSpreadsheet : Mail,
      label,
      kind: "Mapped service",
      position: i === 0 ? "left-[28%] top-6" : i === 1 ? "left-[28%] bottom-6" : "left-[52%] top-1/2 -translate-y-1/2",
    })),
    {
      icon: ShieldCheck,
      label: risky ? "Approval Gate" : "Trustable Gate",
      kind: risky ? "Required" : "Verified",
      position: "right-[20%] top-1/2 -translate-y-1/2",
    },
    { icon: BarChart3, label: "Impact Receipt", kind: "Measured", position: "right-3 top-1/2 -translate-y-1/2" },
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <p>Interactive topology of mapped enterprise services.</p>
        <span className="flex items-center gap-1 font-mono text-[10px] text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          Active Graph
        </span>
      </div>

      <div className="relative h-[410px] overflow-hidden border border-border bg-background/55 rounded-xl shadow-inner">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:24px_24px]" />
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          <path
            d="M 70 205 C 135 205, 130 90, 190 90 M 70 205 C 135 205, 130 320, 190 320 M 250 90 C 300 90, 295 205, 340 205 M 250 320 C 300 320, 295 205, 340 205 M 405 205 L 465 205 M 530 205 L 595 205"
            fill="none"
            stroke="var(--primary)"
            strokeOpacity="0.45"
            strokeWidth="2"
            strokeDasharray="7 6"
          />
        </svg>

        {nodes.map(({ icon: I, label, kind, position }, i) => (
          <DrillDown
            key={`${label}-${i}`}
            title={label}
            description={`${kind} node in the current flow graph.`}
            trigger={
              <Button
                variant="outline"
                className={cn(
                  "absolute z-10 h-auto w-24 flex-col gap-1 border-primary/30 bg-card/95 px-2 py-3 text-center shadow-xl sm:w-28",
                  position,
                  kind === "Required" && "border-warning/60 bg-warning/10"
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-background">
                  <I className="h-4 w-4 text-primary" />
                </span>
                <span className="max-w-full truncate text-[10px] font-semibold">{label}</span>
                <span className="font-mono text-[8px] uppercase text-muted-foreground">{kind} · {18 + i * 11}ms</span>
              </Button>
            }
          >
            <p className="text-sm">Node telemetry, sanitized parameters, active gates, latency, and downstream edges are verified here.</p>
          </DrillDown>
        ))}
      </div>

      <div className="mt-3.5 flex flex-wrap gap-1.5">
        <Tag>6 Nodes</Tag>
        <Tag>{apps.length + 2} Edges</Tag>
        <Tag>{risky ? "1 Approval Gate" : "All Gates Cleared"}</Tag>
        <Tag>Audit Receipt Enabled</Tag>
      </div>
    </div>
  );
}

function FlowIcon({ category }: { category: string }) {
  const I = category === "Reporting" ? BarChart3 : category === "Access" ? ShieldCheck : category === "Approval" ? Check : GitBranch;
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary/10">
      <I className="h-3.5 w-3.5 text-primary" />
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[9px] uppercase text-muted-foreground font-mono">{children}</span>;
}

function Risk({ value }: { value: Template["risk"] }) {
  return (
    <span
      className={`rounded border px-1.5 py-0.5 text-[9px] uppercase font-mono ${
        value === "Elevated" ? "border-destructive/40 text-destructive bg-destructive/10" : value === "Review" ? "border-warning/40 text-warning bg-warning/10" : "border-success/40 text-success bg-success/10"
      }`}
    >
      {value}
    </span>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-2">
      <p className="font-display text-lg font-bold">{value}</p>
      <p className="text-[9px] uppercase text-muted-foreground font-mono">{label}</p>
    </div>
  );
}

function CheckRow({ text, warn }: { text: string; warn?: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded border border-border bg-card p-2.5 text-xs">
      {warn ? <AlertTriangle className="h-4 w-4 text-warning shrink-0" /> : <Check className="h-4 w-4 text-success shrink-0" />}
      <span>{text}</span>
    </div>
  );
}
