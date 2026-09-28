import { useEffect, useState } from "react";
import { Activity, Bot, Check, FileCheck2, GitBranch, LockKeyhole, Pause, Play, RotateCcw, ShieldAlert, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProofBadge } from "@/components/trustable/Chrome";
import { Tip } from "@/components/trustable/Tip";
import { cn } from "@/lib/utils";

type SceneId = "receipt" | "denied" | "growth";
type StoryNode = { id: string; label: string; detail: string; x: number; y: number; icon: typeof Bot; tone: "primary" | "success" | "danger" | "heart"; proof: "live" | "reference" };
type StoryEdge = { from: string; to: string; delay: number; blocked?: boolean };
type Scene = { id: SceneId; title: string; kicker: string; summary: string; nodes: StoryNode[]; edges: StoryEdge[] };

const SCENES: readonly [Scene, Scene, Scene] = [
  {
    id: "receipt",
    kicker: "Live · governed execution",
    title: "Intent to immutable receipt",
    summary: "A plain-language request crosses a typed permission gate, executes inside its tenant, and leaves a verifiable receipt.",
    nodes: [
      { id: "intent", label: "Bob’s intent", detail: "Save 30 minutes", x: 7, y: 49, icon: Bot, tone: "heart", proof: "live" },
      { id: "map", label: "Trustable maps", detail: "Typed request", x: 29, y: 18, icon: GitBranch, tone: "primary", proof: "live" },
      { id: "gate", label: "Permission gate", detail: "Role checked", x: 51, y: 49, icon: ShieldCheck, tone: "success", proof: "live" },
      { id: "run", label: "Flow executes", detail: "Tenant isolated", x: 73, y: 18, icon: Activity, tone: "primary", proof: "live" },
      { id: "receipt", label: "Ledger receipt", detail: "SHA-512 chain", x: 73, y: 68, icon: FileCheck2, tone: "success", proof: "live" },
    ],
    edges: [{ from: "intent", to: "map", delay: 0 }, { from: "map", to: "gate", delay: 1 }, { from: "gate", to: "run", delay: 2 }, { from: "run", to: "receipt", delay: 3 }],
  },
  {
    id: "denied",
    kicker: "Live · least privilege",
    title: "Denied at the gate",
    summary: "A request without the required permission stops before protected data and records a denial event for review.",
    nodes: [
      { id: "request", label: "Request", detail: "Restricted action", x: 7, y: 49, icon: Bot, tone: "heart", proof: "live" },
      { id: "identity", label: "Identity", detail: "User + tenant", x: 29, y: 18, icon: LockKeyhole, tone: "primary", proof: "live" },
      { id: "deny", label: "Access denied", detail: "Deny takes precedence", x: 51, y: 49, icon: ShieldAlert, tone: "danger", proof: "live" },
      { id: "data", label: "Tenant data", detail: "Never reached", x: 73, y: 18, icon: LockKeyhole, tone: "primary", proof: "live" },
      { id: "audit", label: "Denial logged", detail: "Admin evidence", x: 73, y: 68, icon: FileCheck2, tone: "success", proof: "live" },
    ],
    edges: [{ from: "request", to: "identity", delay: 0 }, { from: "identity", to: "deny", delay: 1 }, { from: "deny", to: "data", delay: 2, blocked: true }, { from: "deny", to: "audit", delay: 2 }],
  },
  {
    id: "growth",
    kicker: "Illustrative · program model",
    title: "One Trustable becomes a network",
    summary: "Measured time returned creates reusable bridges, stronger builders, and a compounding organization graph.",
    nodes: [
      { id: "bob", label: "Bob · L1", detail: "First Trustable", x: 7, y: 49, icon: Users, tone: "heart", proof: "reference" },
      { id: "win", label: "30 min returned", detail: "Auditable KPI", x: 29, y: 18, icon: Check, tone: "success", proof: "reference" },
      { id: "bridge", label: "Shared graphlet", detail: "Reusable pattern", x: 51, y: 49, icon: GitBranch, tone: "primary", proof: "reference" },
      { id: "team", label: "Team · L5", detail: "More advocates", x: 73, y: 18, icon: Users, tone: "heart", proof: "reference" },
      { id: "org", label: "Architect · L10", detail: "Connected system", x: 73, y: 68, icon: Activity, tone: "primary", proof: "reference" },
    ],
    edges: [{ from: "bob", to: "win", delay: 0 }, { from: "win", to: "bridge", delay: 1 }, { from: "bridge", to: "team", delay: 2 }, { from: "bridge", to: "org", delay: 3 }],
  },
];

const toneClass = { primary: "border-primary/65 text-primary", success: "border-success/65 text-success", danger: "border-destructive/70 text-destructive", heart: "border-heart/70 text-heart" };

export function MotionStory({ compact = false }: { compact?: boolean }) {
  const [sceneId, setSceneId] = useState<SceneId>("receipt");
  const [run, setRun] = useState(0);
  const [paused, setPaused] = useState(false);
  const scene = SCENES.find((item) => item.id === sceneId) ?? SCENES[0];
  const nodeMap = new Map(scene.nodes.map((node) => [node.id, node]));

  useEffect(() => { setRun((value) => value + 1); setPaused(false); }, [sceneId]);

  return (
    <section className="overflow-hidden border border-border bg-card shadow-[0_34px_90px_-38px_oklch(0_0_0/98%)]" aria-labelledby="motion-story-title">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <div className="mr-auto min-w-0">
          <p className="eyebrow">Trustable motion stories</p>
          <h2 id="motion-story-title" className="mt-1 text-xl font-semibold md:text-2xl">Watch trust move through the system.</h2>
        </div>
        <Tip text={paused ? "Resume this sequence" : "Pause this sequence"}>
          <Button size="icon" variant="outline" aria-label={paused ? "Play animation" : "Pause animation"} onClick={() => setPaused((value) => !value)}>{paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</Button>
        </Tip>
        <Tip text="Replay this sequence">
          <Button size="icon" variant="outline" aria-label="Replay animation" onClick={() => { setRun((value) => value + 1); setPaused(false); }}><RotateCcw className="h-4 w-4" /></Button>
        </Tip>
      </div>
      <div className="grid min-w-0 lg:grid-cols-[250px_minmax(0,1fr)]">
        <div className="border-b border-border p-3 lg:border-b-0 lg:border-r">
          <div className="grid grid-cols-3 gap-1 lg:grid-cols-1" aria-label="Motion story selection">
            {SCENES.map((item, index) => <Button key={item.id} variant={sceneId === item.id ? "secondary" : "ghost"} className="h-auto min-w-0 justify-start px-3 py-2 text-left" onClick={() => setSceneId(item.id)} aria-pressed={sceneId === item.id}><span className="mr-2 font-mono text-[10px] text-primary">0{index + 1}</span><span className="truncate text-xs">{item.title}</span></Button>)}
          </div>
          {!compact && <div className="mt-4 hidden border border-border bg-muted/30 p-3 text-xs text-muted-foreground lg:block"><p className="font-semibold text-foreground">What this proves</p><p className="mt-1 leading-relaxed">The same visual grammar explains execution, blocked access, and organizational growth without claiming unconnected systems are live.</p></div>}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-2 pt-5">
            <div className="max-w-2xl"><p className="font-mono text-[10px] uppercase tracking-widest text-primary">{scene.kicker}</p><h3 className="mt-1 text-xl font-semibold">{scene.title}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{scene.summary}</p></div>
            <ProofBadge kind={scene.id === "growth" ? "reference" : "live"} />
          </div>
          <div key={`${scene.id}-${run}`} className={cn("motion-story relative mx-3 mb-4 h-[390px] overflow-hidden border border-border bg-background/70 md:h-[430px]", paused && "motion-story-paused")}>
            <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:32px_32px]" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">
              {scene.edges.map((edge) => { const a = nodeMap.get(edge.from); const b = nodeMap.get(edge.to); if (!a || !b) return null; const x1=(a.x+8)*10, y1=(a.y+8)*5, x2=(b.x+8)*10, y2=(b.y+8)*5; const d=`M${x1} ${y1} C${(x1+x2)/2} ${y1}, ${(x1+x2)/2} ${y2}, ${x2} ${y2}`; return <g key={`${scene.id}-${edge.from}-${edge.to}`}><path d={d} fill="none" stroke={edge.blocked ? "var(--destructive)" : "var(--primary)"} strokeOpacity=".2" strokeWidth="3"/><path d={d} pathLength="1" fill="none" stroke={edge.blocked ? "var(--destructive)" : "var(--primary)"} strokeWidth={edge.blocked ? "5" : "4"} strokeLinecap="round" className="motion-story-path" style={{ animationDelay: `${edge.delay * 1.15}s` }}/>{!edge.blocked && <circle r="7" fill="var(--primary)" className="motion-story-packet" style={{ animationDelay: `${edge.delay * 1.15}s` }}><animateMotion dur="1.15s" begin={`${edge.delay * 1.15}s`} fill="freeze" path={d}/></circle>}</g>; })}
            </svg>
            {scene.nodes.map((node, index) => { const Icon=node.icon; return <div key={node.id} className={cn("motion-story-node absolute z-10 w-[146px] border bg-card/95 p-3 shadow-[0_22px_50px_-22px_oklch(0_0_0/98%)] md:w-40", toneClass[node.tone])} style={{ left: `${node.x}%`, top: `${node.y}%`, animationDelay: `${index * 1.05}s` }}><span className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full border border-current/40 bg-background"><Icon className="h-4 w-4" /></span><span className="motion-story-beacon h-2 w-2 rounded-full bg-current" /></span><p className="mt-2 text-xs font-semibold text-foreground">{node.label}</p><p className="mt-0.5 truncate text-[10px] text-muted-foreground">{node.detail}</p></div>; })}
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 border border-border bg-card/90 px-3 py-2 text-[10px] text-muted-foreground shadow-lg"><span className="h-2 w-2 animate-pulse rounded-full bg-primary motion-reduce:animate-none" />Sequence uses verified presentation states; no request is executed by this animation.</div>
          </div>
        </div>
      </div>
    </section>
  );
}