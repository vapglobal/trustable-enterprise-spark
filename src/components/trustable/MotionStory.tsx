import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bot,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Copy,
  ExternalLink,
  FileCheck2,
  GitBranch,
  Info,
  LockKeyhole,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProofBadge } from "@/components/trustable/Chrome";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SceneId = "receipt" | "denied" | "growth";

type StoryNode = {
  id: string;
  label: string;
  stageName: string;
  detail: string;
  x: number;
  y: number;
  icon: typeof Bot;
  tone: "primary" | "success" | "danger" | "heart";
  proof: "live" | "reference";
  policyRule: string;
  receiptHash: string;
  runtimePayload: Record<string, unknown>;
  logEvent: string;
};

type StoryEdge = {
  from: string;
  to: string;
  delay: number;
  blocked?: boolean;
};

type Scene = {
  id: SceneId;
  title: string;
  kicker: string;
  summary: string;
  nodes: StoryNode[];
  edges: StoryEdge[];
};

const SCENES: readonly Scene[] = [
  {
    id: "receipt",
    kicker: "Live · Governed Execution",
    title: "Intent to immutable receipt",
    summary:
      "A plain-language request crosses a typed permission gate, executes inside its tenant, and leaves an immutable SHA-512 receipt in the completion ledger.",
    nodes: [
      {
        id: "intent",
        label: "Bob’s intent",
        stageName: "Natural Language Prompt",
        detail: "Save 30 mins: Summarize Q3 churn",
        x: 6,
        y: 45,
        icon: Bot,
        tone: "heart",
        proof: "live",
        policyRule: "INGEST_VALIDATED: Plain text sanitization passed. Zero injection detected.",
        receiptHash: "0x8f2a...e4b1",
        runtimePayload: {
          user: "bob.martinez@enterprise.internal",
          role: "Revenue Analyst",
          prompt: "Draft customer churn summary for APAC Q3 into spreadsheet format",
          sanitized: true,
          tenant_id: "tenant-corp-prod-01",
        },
        logEvent: "[09:20:01.102] Intent ingested from client session. Extracted intent vector: ANALYTICS_EXPORT.",
      },
      {
        id: "map",
        label: "Trustable maps",
        stageName: "OASA Schema Binding",
        detail: "Typed request to Postgres query",
        x: 28,
        y: 18,
        icon: GitBranch,
        tone: "primary",
        proof: "live",
        policyRule: "SCHEMA_VALIDATED: Parameterized query bounded to approved data-catalog views.",
        receiptHash: "0x33c7...90af",
        runtimePayload: {
          target_operation: "SELECT_METRICS",
          catalog_entity: "v_customer_churn_q3",
          bound_parameters: { region: "APAC", quarter: 3 },
          execution_plan: "INDEX_SCAN_PROTECTED",
        },
        logEvent: "[09:20:01.218] Intent mapped to typed SchemaContract<AnalyticsRequest>. Zero raw SQL string interpolation.",
      },
      {
        id: "gate",
        label: "Permission gate",
        stageName: "Least-Privilege Gatekeeper",
        detail: "Role checked & authenticated",
        x: 50,
        y: 45,
        icon: ShieldCheck,
        tone: "success",
        proof: "live",
        policyRule: "AUTHZ_PASSED: Subject holds role 'Revenue Analyst' with read privilege on 'v_customer_churn_q3'.",
        receiptHash: "0x91d4...bb72",
        runtimePayload: {
          authorization_tier: "TIER_2_READ_RESTRICTED",
          tenant_isolation: "ENFORCED",
          pii_scrubbed: true,
          eval_verdict: "ALLOW",
        },
        logEvent: "[09:20:01.350] Permission check evaluated in 1.4ms. Access granted. Identity verified via SAML SSO token.",
      },
      {
        id: "run",
        label: "Flow executes",
        stageName: "Isolated Sandboxed Run",
        detail: "Tenant-isolated compute worker",
        x: 72,
        y: 18,
        icon: Activity,
        tone: "primary",
        proof: "live",
        policyRule: "SANDBOX_SECURE: Runtime network ingress blocked. Egress locked strictly to tenant DB pool.",
        receiptHash: "0x550a...7c19",
        runtimePayload: {
          worker_id: "worker-node-apac-48",
          rows_processed: 482,
          execution_wall_time_ms: 182,
          memory_peak_mb: 28.4,
          data_boundary: "TENANT_AIRGAP",
        },
        logEvent: "[09:20:01.532] Isolated worker executed 482 rows. Output transformed into governed CSV artifact.",
      },
      {
        id: "receipt",
        label: "Ledger receipt",
        stageName: "Cryptographic Ledger",
        detail: "SHA-512 chain committed",
        x: 72,
        y: 68,
        icon: FileCheck2,
        tone: "success",
        proof: "live",
        policyRule: "CHAIN_RECORDED: Proof committed to Postgres append-only completion ledger.",
        receiptHash: "0x6f991cba41e2478b27464d...sha512",
        runtimePayload: {
          event_type: "COMPLETION_RECEIPT",
          sequence_number: 148920,
          previous_block_hash: "0x892a0129bc...e412",
          merkle_root: "0x9b3a...7710",
          immutable: true,
        },
        logEvent: "[09:20:01.590] Completion receipt committed with SHA-512 fingerprint. User notified. Zero data leaked.",
      },
    ],
    edges: [
      { from: "intent", to: "map", delay: 0 },
      { from: "map", to: "gate", delay: 1 },
      { from: "gate", to: "run", delay: 2 },
      { from: "run", to: "receipt", delay: 3 },
    ],
  },
  {
    id: "denied",
    kicker: "Live · Least Privilege",
    title: "Denied at the gate",
    summary:
      "A request without the required tenant permission stops safely before protected data and records a structured denial event for compliance review.",
    nodes: [
      {
        id: "request",
        label: "Request",
        stageName: "Untrusted Request",
        detail: "Restricted payroll export",
        x: 6,
        y: 45,
        icon: Bot,
        tone: "heart",
        proof: "live",
        policyRule: "SENSITIVE_TARGET: Action touches /tenant/hr/payroll_salaries. Requires Tier 4 clearance.",
        receiptHash: "0x11ab...6032",
        runtimePayload: {
          user: "guest.analyst@partner.org",
          action: "EXPORT_COMPENSATION_TABLE",
          scope: "GLOBAL_PAYROLL",
        },
        logEvent: "[10:14:22.010] User initiated query touching sensitive HR compensation data store.",
      },
      {
        id: "identity",
        label: "Identity",
        stageName: "Tenant & Role Verification",
        detail: "User + Tenant context lookup",
        x: 28,
        y: 18,
        icon: LockKeyhole,
        tone: "primary",
        proof: "live",
        policyRule: "TENANT_BOUND: Subject validated as external contractor. Cleared strictly for marketing catalog.",
        receiptHash: "0x54ec...7701",
        runtimePayload: {
          tenant_id: "tenant-corp-prod-01",
          subject_role: "External_Contractor",
          mfa_active: true,
          clearance_level: "TIER_1",
        },
        logEvent: "[10:14:22.085] Policy matrix verified subject clearance (TIER_1) vs resource requirement (TIER_4).",
      },
      {
        id: "deny",
        label: "Access denied",
        stageName: "Defensive Interlock",
        detail: "Deny takes precedence instantly",
        x: 50,
        y: 45,
        icon: ShieldAlert,
        tone: "danger",
        proof: "live",
        policyRule: "DENY_OVERRIDE: Hard boundary block. Request execution halted immediately before SQL engine.",
        receiptHash: "0xee44...8820",
        runtimePayload: {
          verdict: "HARD_DENY",
          violation_code: "INSUFFICIENT_CLEARANCE_TIER_4",
          data_exposed_bytes: 0,
          containment: "100%",
        },
        logEvent: "[10:14:22.112] HARD DENIAL TRIGGERED. Interlock prevented database connection pool acquisition.",
      },
      {
        id: "data",
        label: "Tenant data",
        stageName: "Protected Vault",
        detail: "Never touched or queried",
        x: 72,
        y: 18,
        icon: LockKeyhole,
        tone: "primary",
        proof: "live",
        policyRule: "ZERO_CONTACT: Vault stayed dormant. No socket or IPC connection opened.",
        receiptHash: "0x0000...UNTOUCHED",
        runtimePayload: {
          status: "DORMANT_SECURE",
          queries_received: 0,
          packets_transmitted: 0,
        },
        logEvent: "[10:14:22.115] Target database confirms zero incoming requests. Vault uncompromised.",
      },
      {
        id: "audit",
        label: "Denial logged",
        stageName: "Compliance Incident Ledger",
        detail: "Admin evidence & SOC2 audit",
        x: 72,
        y: 68,
        icon: FileCheck2,
        tone: "success",
        proof: "live",
        policyRule: "SECURITY_EVENT_CAPTURED: Logged to append-only CISO compliance ledger with tamper-proof seal.",
        receiptHash: "0xdead...beef90",
        runtimePayload: {
          incident_id: "INC-2026-0929-881",
          severity: "MEDIUM",
          notified: ["ciso-alerts@enterprise.internal"],
          remediation: "AUTOMATIC_LOCKOUT_AFTER_3_FAILURES",
        },
        logEvent: "[10:14:22.140] Denial recorded in immutable security log. CISO audit feed dispatched.",
      },
    ],
    edges: [
      { from: "request", to: "identity", delay: 0 },
      { from: "identity", to: "deny", delay: 1 },
      { from: "deny", to: "data", delay: 2, blocked: true },
      { from: "deny", to: "audit", delay: 2 },
    ],
  },
  {
    id: "growth",
    kicker: "Illustrative · Program Model",
    title: "One Trustable becomes a network",
    summary:
      "Measured time returned creates reusable bridges, stronger enterprise builders, and a compounding organization graph across departments.",
    nodes: [
      {
        id: "bob",
        label: "Bob · L1",
        stageName: "First Builder Adoption",
        detail: "First automated workflow",
        x: 6,
        y: 45,
        icon: Users,
        tone: "heart",
        proof: "reference",
        policyRule: "SEED_INITIATIVE: Employee self-service workflow under bounded sandbox supervision.",
        receiptHash: "0x12c4...aa33",
        runtimePayload: {
          user: "bob@lovable.dev",
          experience_level: "Level 1 Builder",
          templates_used: 1,
          safety_guardrails: "ACTIVE",
        },
        logEvent: "[Growth Stage 1] Bob crafts his first automated pipeline using governed natural language templates.",
      },
      {
        id: "win",
        label: "30 min returned",
        stageName: "Auditable KPI Win",
        detail: "Daily time returned measured",
        x: 28,
        y: 18,
        icon: Check,
        tone: "success",
        proof: "reference",
        policyRule: "ROI_VERIFIED: Realized savings tracked against benchmark time log.",
        receiptHash: "0x44d1...ff89",
        runtimePayload: {
          daily_savings_mins: 32,
          annualized_hours: 128,
          builder_confidence: "98%",
        },
        logEvent: "[Growth Stage 2] Verification proves 32 minutes returned daily. Productivity threshold met.",
      },
      {
        id: "bridge",
        label: "Shared graphlet",
        stageName: "Reusable Organization Bridge",
        detail: "Shared workflow template",
        x: 50,
        y: 45,
        icon: GitBranch,
        tone: "primary",
        proof: "reference",
        policyRule: "LIBRARY_PUBLISH: Workflow reviewed by team lead and published to internal catalog.",
        receiptHash: "0x77ee...12bb",
        runtimePayload: {
          catalog_id: "wf-sales-apac-summary",
          fork_count: 8,
          peer_rating: 4.9,
        },
        logEvent: "[Growth Stage 3] Pattern promoted to team catalog. 8 peers fork the workflow for their desks.",
      },
      {
        id: "team",
        label: "Team · L5",
        stageName: "Department Velocity",
        detail: "Squad of 12 active advocates",
        x: 72,
        y: 18,
        icon: Users,
        tone: "heart",
        proof: "reference",
        policyRule: "TEAM_SCALE: Departmental velocity doubles while maintaining zero compliance violations.",
        receiptHash: "0x9922...44dd",
        runtimePayload: {
          active_builders: 12,
          department: "Customer Operations",
          governance_incidents: 0,
        },
        logEvent: "[Growth Stage 4] 12 teammates become active builders. Departmental output increases 42%.",
      },
      {
        id: "org",
        label: "Architect · L10",
        stageName: "Connected Enterprise Mesh",
        detail: "Governed company-wide fabric",
        x: 72,
        y: 68,
        icon: Activity,
        tone: "primary",
        proof: "reference",
        policyRule: "ENTERPRISE_MESH: Full cross-tenant orchestration under unified CISO ledger & OASA protocols.",
        receiptHash: "0xbeef...88aa",
        runtimePayload: {
          total_trustables_running: 1420,
          governed_api_calls_daily: "1.2M",
          cost_per_automation: "$0.003",
        },
        logEvent: "[Growth Stage 5] Solutions Architecture connects disparate enterprise silos into an organic self-healing system.",
      },
    ],
    edges: [
      { from: "bob", to: "win", delay: 0 },
      { from: "win", to: "bridge", delay: 1 },
      { from: "bridge", to: "team", delay: 2 },
      { from: "bridge", to: "org", delay: 3 },
    ],
  },
];

const toneStyles = {
  primary: {
    border: "border-primary/70",
    text: "text-primary",
    badge: "bg-primary/10 text-primary border-primary/30",
    glow: "ring-2 ring-primary/40 shadow-[0_0_24px_rgba(56,189,248,0.25)]",
    pulse: "bg-primary",
  },
  success: {
    border: "border-emerald-500/70",
    text: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    glow: "ring-2 ring-emerald-500/40 shadow-[0_0_24px_rgba(52,211,153,0.25)]",
    pulse: "bg-emerald-400",
  },
  danger: {
    border: "border-rose-500/70",
    text: "text-rose-400",
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    glow: "ring-2 ring-rose-500/40 shadow-[0_0_24px_rgba(244,63,94,0.25)]",
    pulse: "bg-rose-400",
  },
  heart: {
    border: "border-pink-500/70",
    text: "text-pink-400",
    badge: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    glow: "ring-2 ring-pink-500/40 shadow-[0_0_24px_rgba(236,72,153,0.25)]",
    pulse: "bg-pink-400",
  },
};

export function MotionStory({ compact = false }: { compact?: boolean }) {
  const [sceneId, setSceneId] = useState<SceneId>("receipt");
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("intent");

  const scene = useMemo(
    () => SCENES.find((item) => item.id === sceneId) ?? SCENES[0],
    [sceneId]
  );

  const nodeMap = useMemo(
    () => new Map(scene.nodes.map((node) => [node.id, node])),
    [scene.nodes]
  );

  // Reset active step and selection whenever scene switches
  useEffect(() => {
    setActiveStepIndex(0);
    setSelectedNodeId(scene.nodes[0]?.id ?? "");
    setIsPlaying(true);
  }, [sceneId, scene.nodes]);

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = Math.max(1200, Math.round(2800 / playbackSpeed));
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        const nextIndex = (prev + 1) % scene.nodes.length;
        setSelectedNodeId(scene.nodes[nextIndex].id);
        return nextIndex;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, scene.nodes]);

  const activeNode = useMemo(
    () => nodeMap.get(selectedNodeId) ?? scene.nodes[activeStepIndex] ?? scene.nodes[0],
    [nodeMap, selectedNodeId, scene.nodes, activeStepIndex]
  );

  const handleNodeClick = (node: StoryNode, index: number) => {
    setSelectedNodeId(node.id);
    setActiveStepIndex(index);
    setIsPlaying(false);
    toast.info(`Selected Stage ${index + 1}: ${node.label}`);
  };

  const handleStepPrev = () => {
    const prev = (activeStepIndex - 1 + scene.nodes.length) % scene.nodes.length;
    setActiveStepIndex(prev);
    setSelectedNodeId(scene.nodes[prev].id);
  };

  const handleStepNext = () => {
    const next = (activeStepIndex + 1) % scene.nodes.length;
    setActiveStepIndex(next);
    setSelectedNodeId(scene.nodes[next].id);
  };

  const handleReset = () => {
    setActiveStepIndex(0);
    setSelectedNodeId(scene.nodes[0].id);
    setIsPlaying(true);
    toast.success("Animation sequence restarted from Stage 1.");
  };

  const copyPayload = () => {
    if (!activeNode) return;
    navigator.clipboard.writeText(JSON.stringify(activeNode.runtimePayload, null, 2));
    toast.success("Runtime JSON payload copied to clipboard.");
  };

  return (
    <section
      className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
      aria-labelledby="motion-story-title"
    >
      {/* Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/20 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", isPlaying ? "bg-emerald-400" : "bg-amber-400")} />
              <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", isPlaying ? "bg-emerald-500" : "bg-amber-500")} />
            </span>
            <p className="eyebrow text-xs tracking-wider">
              {isPlaying ? "Live Execution Narrative · Playing" : "Playback Paused · Manual Inspection"}
            </p>
          </div>
          <h2 id="motion-story-title" className="mt-1 text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Watch trust move through the system
          </h2>
        </div>

        {/* Primary Scrub & Playback Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleStepPrev}
            title="Step Back"
            className="h-8 gap-1 px-2.5 text-xs font-medium"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </Button>

          <Button
            size="sm"
            variant={isPlaying ? "secondary" : "default"}
            onClick={() => setIsPlaying((p) => !p)}
            className="h-8 gap-1.5 px-3 text-xs font-semibold"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Play</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleStepNext}
            title="Step Forward"
            className="h-8 gap-1 px-2.5 text-xs font-medium"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            title="Restart Animation"
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
          </Button>

          <div className="ml-2 hidden items-center gap-1 rounded-md border border-border/80 bg-background/80 p-0.5 md:flex">
            <button
              onClick={() => setPlaybackSpeed(1)}
              className={cn(
                "rounded px-2 py-0.5 text-[11px] font-mono transition-colors",
                playbackSpeed === 1 ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              1x
            </button>
            <button
              onClick={() => setPlaybackSpeed(2)}
              className={cn(
                "rounded px-2 py-0.5 text-[11px] font-mono transition-colors",
                playbackSpeed === 2 ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              2x
            </button>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Left Sidebar: Scene Switcher & Steps */}
        <div className="border-b border-border bg-card/60 p-4 lg:border-b-0 lg:border-r">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Select Narrative</p>
          <div className="mt-2.5 space-y-1.5">
            {SCENES.map((item, index) => {
              const active = sceneId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSceneId(item.id)}
                  className={cn(
                    "group flex w-full flex-col items-start rounded-lg border px-3 py-2.5 text-left transition-all",
                    active
                      ? "border-primary bg-primary/10 text-foreground shadow-sm"
                      : "border-border/60 bg-card hover:border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex w-full items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className={cn("font-mono text-[10px]", active ? "text-primary font-bold" : "text-muted-foreground")}>
                        0{index + 1}
                      </span>
                      <span className="truncate">{item.title}</span>
                    </span>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground group-hover:text-muted-foreground/90">
                    {item.summary}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Stepper Timeline */}
          <div className="mt-6 border-t border-border/80 pt-4">
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Sequence Stages ({activeStepIndex + 1}/{scene.nodes.length})
            </p>
            <div className="mt-3 space-y-1">
              {scene.nodes.map((node, idx) => {
                const isCurrent = idx === activeStepIndex;
                const isSelected = node.id === activeNode.id;
                const Icon = node.icon;
                return (
                  <button
                    key={node.id}
                    onClick={() => handleNodeClick(node, idx)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors",
                      isSelected
                        ? "bg-secondary text-foreground font-semibold border border-primary/40 shadow-xs"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-5 w-5 place-items-center rounded-full text-[10px] font-mono",
                        isCurrent
                          ? "bg-primary text-primary-foreground font-bold"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {idx + 1}
                    </span>
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{node.label}</span>
                    {isCurrent && (
                      <span className="ml-auto text-[9px] font-mono uppercase text-primary">Active</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Area: Interactive Canvas + Live Node Inspector */}
        <div className="flex flex-col min-w-0">
          {/* Active Scene Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/10 px-5 py-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">
                {scene.kicker}
              </p>
              <h3 className="text-base font-semibold text-foreground">{scene.title}</h3>
            </div>
            <ProofBadge kind={scene.id === "growth" ? "reference" : "live"} />
          </div>

          {/* SVG Canvas & Node Nodes */}
          <div className="relative h-[340px] md:h-[380px] w-full overflow-hidden bg-background/90 p-4">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:28px_28px]" />

            {/* SVG Connecting Paths */}
            <svg
              className="absolute inset-0 h-full w-full pointer-events-none"
              viewBox="0 0 1000 500"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="edgeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {scene.edges.map((edge) => {
                const a = nodeMap.get(edge.from);
                const b = nodeMap.get(edge.to);
                if (!a || !b) return null;

                const x1 = (a.x + 8) * 10;
                const y1 = (a.y + 8) * 5;
                const x2 = (b.x + 8) * 10;
                const y2 = (b.y + 8) * 5;
                const d = `M${x1} ${y1} C${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`;

                const edgeIndex = scene.edges.indexOf(edge);
                const isEdgeActive = activeStepIndex === edgeIndex || activeStepIndex === edgeIndex + 1;

                return (
                  <g key={`${scene.id}-${edge.from}-${edge.to}`}>
                    {/* Background faint path */}
                    <path
                      d={d}
                      fill="none"
                      stroke={edge.blocked ? "var(--destructive)" : "var(--border)"}
                      strokeOpacity="0.35"
                      strokeWidth="2.5"
                    />

                    {/* Active highlighted animated stroke */}
                    <path
                      d={d}
                      fill="none"
                      stroke={
                        edge.blocked
                          ? "var(--destructive)"
                          : isEdgeActive
                          ? "var(--primary)"
                          : "var(--border)"
                      }
                      strokeWidth={edge.blocked ? "4" : isEdgeActive ? "3.5" : "2"}
                      strokeDasharray={edge.blocked ? "6 6" : isEdgeActive ? "8 6" : "none"}
                      strokeOpacity={isEdgeActive ? 0.95 : 0.3}
                      className={isEdgeActive && !edge.blocked ? "motion-story-active-path" : ""}
                    />

                    {/* Particle dot */}
                    {isEdgeActive && !edge.blocked && (
                      <circle
                        cx={(x1 + x2) / 2}
                        cy={(y1 + y2) / 2}
                        r="5"
                        fill="var(--primary)"
                        className="animate-pulse shadow-lg"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Clickable Interactive Nodes */}
            {scene.nodes.map((node, index) => {
              const Icon = node.icon;
              const isCurrent = index === activeStepIndex;
              const isSelected = node.id === activeNode.id;
              const tone = toneStyles[node.tone] || toneStyles.primary;

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => handleNodeClick(node, index)}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  className={cn(
                    "group absolute z-20 w-[150px] md:w-[175px] rounded-lg border bg-card/95 p-3 text-left transition-all duration-200 hover:scale-105 focus:outline-hidden",
                    tone.border,
                    isSelected ? tone.glow : "shadow-md hover:shadow-lg",
                    isSelected && "border-2 bg-card"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-7 w-7 place-items-center rounded-full border border-border bg-background shadow-xs">
                      <Icon className={cn("h-3.5 w-3.5", tone.text)} />
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          isCurrent ? tone.pulse + " animate-ping" : "bg-muted-foreground/40"
                        )}
                      />
                      <span className="font-mono text-[9px] text-muted-foreground">
                        0{index + 1}
                      </span>
                    </span>
                  </div>

                  <p className="mt-2 text-xs font-bold text-foreground truncate">{node.label}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">{node.detail}</p>

                  <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-1.5 text-[9px] font-mono">
                    <span className={cn("font-medium", tone.text)}>
                      {isSelected ? "● Inspected" : "Click to view"}
                    </span>
                    <span className="text-muted-foreground">{node.receiptHash.slice(0, 8)}</span>
                  </div>
                </button>
              );
            })}

            {/* Interactive hint footer */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between rounded-md border border-border/80 bg-background/85 px-3 py-1.5 text-[10px] text-muted-foreground shadow-xs">
              <span className="flex items-center gap-1.5">
                <Info className="h-3 w-3 text-primary" />
                <span>Click any stage node to inspect live policy evaluation, tenant airgap & SHA-512 ledger proof.</span>
              </span>
              <span className="hidden sm:inline font-mono text-[9px] text-primary">
                Stage {activeStepIndex + 1} of {scene.nodes.length} Active
              </span>
            </div>
          </div>

          {/* Interactive Drilldown Inspector for Selected Node */}
          {activeNode && (
            <div className="border-t border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-lg border",
                      toneStyles[activeNode.tone].badge
                    )}
                  >
                    {(() => {
                      const Icon = activeNode.icon;
                      return <Icon className="h-4 w-4" />;
                    })()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">{activeNode.label}</h4>
                      <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {activeNode.stageName}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{activeNode.detail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyPayload}
                    className="h-7 gap-1 px-2.5 text-[11px]"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy JSON</span>
                  </Button>
                </div>
              </div>

              {/* Policy Rule & Audit Hash Bar */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3 text-primary" />
                    Runtime Governance Policy
                  </p>
                  <p className="mt-1.5 font-mono text-xs font-medium text-foreground">
                    {activeNode.policyRule}
                  </p>
                </div>

                <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileCheck2 className="h-3 w-3 text-emerald-400" />
                    Cryptographic Completion Hash
                  </p>
                  <p className="mt-1.5 font-mono text-xs font-semibold text-emerald-400 truncate">
                    {activeNode.receiptHash}
                  </p>
                </div>
              </div>

              {/* Live Payload & Terminal Event Stream */}
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* JSON Payload Inspector */}
                <div className="rounded-lg border border-border/80 bg-background p-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border/50 text-[10px] font-mono text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Code2 className="h-3 w-3 text-primary" />
                      Runtime State Payload
                    </span>
                    <span>JSON Schema Validated</span>
                  </div>
                  <pre className="mt-2 h-28 overflow-auto font-mono text-[11px] text-muted-foreground leading-relaxed">
                    {JSON.stringify(activeNode.runtimePayload, null, 2)}
                  </pre>
                </div>

                {/* Real-time Ledger / Security Event Terminal */}
                <div className="rounded-lg border border-border/80 bg-background p-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border/50 text-[10px] font-mono text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Terminal className="h-3 w-3 text-emerald-400" />
                      Live Enclave Ledger Event
                    </span>
                    <span className="text-emerald-400 font-bold">100% Contained</span>
                  </div>
                  <div className="mt-2 h-28 overflow-auto font-mono text-[11px] text-emerald-400/90 leading-relaxed bg-black/40 p-2 rounded">
                    <p className="text-muted-foreground font-mono text-[10px]"># Kernel audit stream:</p>
                    <p className="mt-1">{activeNode.logEvent}</p>
                    <p className="mt-1.5 text-xs text-foreground/80">
                      &gt; Verification: Tenant boundary integrity verified. Zero unauthorized IPC channel observed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}