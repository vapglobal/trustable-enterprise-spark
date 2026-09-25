import { useMemo, useRef, useState } from "react";
import { Activity, Bot, Building2, ChevronLeft, ChevronRight, Database, FileCheck2, GitBranch, Layers3, List, LockKeyhole, Move, Plus, Redo2, RotateCcw, Save, Search, ShieldCheck, Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProofBadge } from "@/components/trustable/Chrome";
import { Tip } from "@/components/trustable/Tip";
import { cn } from "@/lib/utils";

type NodeKind = "operator" | "service" | "gate" | "data" | "ledger" | "reference";
type GraphNode = { id: string; label: string; detail: string; kind: NodeKind; x: number; y: number; weight: number; live: boolean };
type GraphEdge = { id: string; from: string; to: string; weight: number; gate?: boolean };

const ICONS = { operator: Bot, service: Activity, gate: ShieldCheck, data: Database, ledger: FileCheck2, reference: Building2 } satisfies Record<NodeKind, typeof Bot>;
const INITIAL_NODES: GraphNode[] = [
  { id: "operator", label: "Operator", detail: "Plain-language intent", kind: "operator", x: 5, y: 41, weight: 100, live: true },
  { id: "cockpit", label: "Trustable cockpit", detail: "Role re-check", kind: "service", x: 23, y: 13, weight: 92, live: true },
  { id: "gate", label: "Decision gate", detail: "Typed policy boundary", kind: "gate", x: 43, y: 13, weight: 88, live: true },
  { id: "data", label: "Tenant data", detail: "Row-level isolation", kind: "data", x: 43, y: 67, weight: 76, live: true },
  { id: "ledger", label: "Audit ledger", detail: "Hash-chained receipt", kind: "ledger", x: 63, y: 41, weight: 95, live: true },
  { id: "vault", label: "VAULTABLE", detail: "Zero-egress enclave", kind: "reference", x: 82, y: 13, weight: 60, live: false },
  { id: "systems", label: "Enterprise systems", detail: "Governed connectors", kind: "reference", x: 82, y: 67, weight: 55, live: false },
];
const INITIAL_EDGES: GraphEdge[] = [
  { id: "e1", from: "operator", to: "cockpit", weight: 100 }, { id: "e2", from: "cockpit", to: "gate", weight: 92, gate: true },
  { id: "e3", from: "cockpit", to: "data", weight: 76 }, { id: "e4", from: "gate", to: "ledger", weight: 88, gate: true },
  { id: "e5", from: "data", to: "ledger", weight: 76 }, { id: "e6", from: "ledger", to: "vault", weight: 60 }, { id: "e7", from: "ledger", to: "systems", weight: 55 },
];
const PALETTE: Array<{ label: string; kind: NodeKind; detail: string }> = [
  { label: "Service", kind: "service", detail: "Governed execution node" }, { label: "Security gate", kind: "gate", detail: "Policy and approval boundary" },
  { label: "Data store", kind: "data", detail: "Tenant-scoped information" }, { label: "Audit point", kind: "ledger", detail: "Evidence and receipt node" },
  { label: "External system", kind: "reference", detail: "Connector contract required" },
];

export function GraphWorkbench() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [history, setHistory] = useState<GraphNode[][]>([]);
  const [future, setFuture] = useState<GraphNode[][]>([]);
  const [selectedId, setSelectedId] = useState("gate");
  const [view, setView] = useState<"graph" | "list">("graph");
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [overlays, setOverlays] = useState({ gates: true, weights: true, boundaries: true });
  const canvasRef = useRef<HTMLDivElement>(null);
  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[0];
  const visiblePalette = PALETTE.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query.toLowerCase()));
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  function commit(next: GraphNode[]) { setHistory((items) => [...items.slice(-49), nodes]); setFuture([]); setNodes(next); }
  function undo() { const prior = history.at(-1); if (!prior) return; setFuture((items) => [nodes, ...items]); setNodes(prior); setHistory((items) => items.slice(0, -1)); }
  function redo() { const next = future[0]; if (!next) return; setHistory((items) => [...items, nodes]); setNodes(next); setFuture((items) => items.slice(1)); }
  function addNode(kind: NodeKind, label: string, detail: string) { const id = `${kind}-${Date.now()}`; commit([...nodes, { id, label, detail, kind, x: 47, y: 42, weight: 50, live: kind !== "reference" }]); setSelectedId(id); }
  function removeSelected() { if (!selected) return; commit(nodes.filter((node) => node.id !== selected.id)); setSelectedId("operator"); }
  function updateSelected(patch: Partial<GraphNode>) { if (!selected) return; commit(nodes.map((node) => node.id === selected.id ? { ...node, ...patch } : node)); }
  function startDrag(event: React.PointerEvent, node: GraphNode) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const before = nodes;
    const move = (moveEvent: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(84, ((moveEvent.clientX - rect.left) / rect.width) * 100 - 8));
      const y = Math.max(0, Math.min(79, ((moveEvent.clientY - rect.top) / rect.height) * 100 - 8));
      setNodes((items) => items.map((item) => item.id === node.id ? { ...item, x, y } : item));
    };
    const up = () => { setHistory((items) => [...items.slice(-49), before]); setFuture([]); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  }
  function nudge(node: GraphNode, dx: number, dy: number) { commit(nodes.map((item) => item.id === node.id ? { ...item, x: Math.max(0, Math.min(84, item.x + dx)), y: Math.max(0, Math.min(79, item.y + dy)) } : item)); }
  function saveSession() { window.sessionStorage.setItem("trustable-architecture-graph", JSON.stringify({ nodes, overlays })); }

  return <section className="overflow-hidden border border-border bg-card shadow-[0_35px_95px_-38px_oklch(0_0_0/98%)]">
    <div className="flex min-w-0 flex-wrap items-center gap-2 border-b border-border px-3 py-2">
      <div className="mr-auto min-w-0"><p className="eyebrow">Interactive trust graph</p><h2 className="truncate text-xl font-semibold">Enterprise request canvas</h2></div>
      <div className="flex items-center gap-1 rounded border border-border bg-background p-1">
        <Button size="sm" variant={view === "graph" ? "secondary" : "ghost"} onClick={() => setView("graph")}><GitBranch className="mr-1 h-4 w-4" />Graph</Button>
        <Button size="sm" variant={view === "list" ? "secondary" : "ghost"} onClick={() => setView("list")}><List className="mr-1 h-4 w-4" />Accessible list</Button>
      </div>
      <Tip text="Undo last canvas change"><Button size="icon" variant="outline" onClick={undo} disabled={!history.length} aria-label="Undo"><Undo2 className="h-4 w-4" /></Button></Tip>
      <Tip text="Redo canvas change"><Button size="icon" variant="outline" onClick={redo} disabled={!future.length} aria-label="Redo"><Redo2 className="h-4 w-4" /></Button></Tip>
      <Tip text="Save this visual draft for the current browser session"><Button size="icon" variant="outline" onClick={saveSession} aria-label="Save session draft"><Save className="h-4 w-4" /></Button></Tip>
    </div>
    <div className="grid min-h-[560px] min-w-0 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
      <aside className={cn("border-r border-border bg-background/55 transition-[width]", leftOpen ? "w-56" : "w-11")}>
        <div className="flex h-11 items-center justify-between border-b border-border px-1"><Button size="icon" variant="ghost" onClick={() => setLeftOpen((value) => !value)} aria-label={leftOpen ? "Collapse node palette" : "Open node palette"}>{leftOpen ? <ChevronLeft className="h-4 w-4" /> : <Layers3 className="h-4 w-4" />}</Button>{leftOpen && <span className="mr-2 text-xs font-semibold">Node palette</span>}</div>
        {leftOpen && <div className="space-y-3 p-3"><div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search components…" className="pl-8" aria-label="Search graph components" /></div><div className="space-y-2">{visiblePalette.map((item) => { const Icon = ICONS[item.kind]; return <Button key={item.label} variant="outline" className="h-auto w-full justify-start gap-2 p-2 text-left shadow-md" onClick={() => addNode(item.kind, item.label, item.detail)}><Icon className="h-4 w-4 shrink-0 text-primary"/><span className="min-w-0"><span className="block text-xs font-semibold">{item.label}</span><span className="block truncate text-[10px] text-muted-foreground">{item.detail}</span></span><Plus className="ml-auto h-3.5 w-3.5"/></Button>; })}</div><p className="text-[10px] leading-relaxed text-muted-foreground">Select to add. Canvas edits are a session-only visual draft until a protected save contract is connected.</p></div>}
      </aside>
      <div className="min-w-0 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2"><span className="text-[10px] font-semibold uppercase text-muted-foreground">Overlays</span>{(["gates", "weights", "boundaries"] as const).map((key) => <Button key={key} size="sm" variant={overlays[key] ? "secondary" : "ghost"} onClick={() => setOverlays((current) => ({ ...current, [key]: !current[key] }))} className="h-7 capitalize">{key}</Button>)}<span className="ml-auto"><ProofBadge kind="live" /></span></div>
        {view === "graph" ? <div ref={canvasRef} className="relative h-[500px] touch-none overflow-hidden bg-background/65 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px]" aria-label="Draggable enterprise trust graph">
          {overlays.boundaries && <div className="pointer-events-none absolute inset-y-[7%] left-[38%] w-[39%] border border-dashed border-warning/45 bg-warning/5"><span className="absolute left-2 top-2 font-mono text-[9px] uppercase text-warning">Trust boundary</span></div>}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">{INITIAL_EDGES.map((edge) => { const a = nodeMap.get(edge.from); const b = nodeMap.get(edge.to); if (!a || !b) return null; const x1 = (a.x + 8) * 10, y1 = (a.y + 8) * 5, x2 = (b.x + 8) * 10, y2 = (b.y + 8) * 5; return <g key={edge.id}><path d={`M${x1} ${y1} C${(x1+x2)/2} ${y1}, ${(x1+x2)/2} ${y2}, ${x2} ${y2}`} fill="none" stroke="var(--primary)" strokeOpacity={edge.gate && overlays.gates ? ".9" : ".48"} strokeWidth={edge.gate && overlays.gates ? "4" : "2.5"} strokeDasharray="8 7" className="animate-pulse motion-reduce:animate-none"/>{overlays.weights && <text x={(x1+x2)/2} y={(y1+y2)/2-7} textAnchor="middle" fill="var(--foreground)" fontSize="12">{edge.weight}%</text>}</g>; })}</svg>
          {nodes.map((node) => { const Icon = ICONS[node.kind]; const active = node.id === selectedId; return <button key={node.id} type="button" onPointerDown={(event) => startDrag(event, node)} onClick={() => setSelectedId(node.id)} onKeyDown={(event) => { if (event.key === "ArrowLeft") nudge(node,-2,0); if (event.key === "ArrowRight") nudge(node,2,0); if (event.key === "ArrowUp") nudge(node,0,-2); if (event.key === "ArrowDown") nudge(node,0,2); }} className={cn("absolute z-10 w-40 cursor-move border bg-card/95 p-3 text-left shadow-[0_20px_45px_-20px_oklch(0_0_0/98%)] transition-shadow focus:outline-none focus:ring-2 focus:ring-ring", active ? "border-primary shadow-[0_22px_55px_-18px_var(--primary)]" : "border-border hover:border-primary/55")} style={{ left: `${node.x}%`, top: `${node.y}%` }} aria-label={`${node.label}, ${node.live ? "Live" : "Reference architecture"}, weight ${node.weight} percent. Use arrow keys to move.`}><span className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full border border-primary/30 bg-background"><Icon className="h-4 w-4 text-primary"/></span><Move className="ml-auto h-3.5 w-3.5 text-muted-foreground"/></span><span className="mt-2 block text-xs font-semibold">{node.label}</span><span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{node.detail}</span><span className="mt-2 block"><ProofBadge kind={node.live ? "live" : "reference"}/></span></button>; })}
        </div> : <div className="overflow-auto p-4"><table className="w-full min-w-[680px] border-collapse text-left text-xs"><thead><tr className="border-b border-border text-muted-foreground"><th className="p-3">On</th><th className="p-3">Node</th><th className="p-3">Kind</th><th className="p-3">Responsibility</th><th className="p-3">Weight</th><th className="p-3">Proof</th></tr></thead><tbody>{nodes.map((node) => <tr key={node.id} className="border-b border-border hover:bg-accent" onClick={() => setSelectedId(node.id)}><td className="p-3">Yes</td><td className="p-3 font-semibold">{node.label}</td><td className="p-3 capitalize">{node.kind}</td><td className="p-3 text-muted-foreground">{node.detail}</td><td className="p-3 font-mono">{node.weight}%</td><td className="p-3"><ProofBadge kind={node.live ? "live" : "reference"}/></td></tr>)}</tbody></table></div>}
      </div>
      <aside className={cn("border-l border-border bg-background/55 transition-[width]", rightOpen ? "w-64" : "w-11")}>
        <div className="flex h-11 items-center border-b border-border px-1"><Button size="icon" variant="ghost" onClick={() => setRightOpen((value) => !value)} aria-label={rightOpen ? "Collapse inspector" : "Open inspector"}>{rightOpen ? <ChevronRight className="h-4 w-4" /> : <Activity className="h-4 w-4" />}</Button>{rightOpen && <span className="ml-2 text-xs font-semibold">Inspector</span>}</div>
        {rightOpen && selected && <div className="space-y-4 p-4"><div><p className="eyebrow">Selected node</p><h3 className="mt-1 font-semibold">{selected.label}</h3><p className="mt-1 text-xs text-muted-foreground">{selected.detail}</p></div><ProofBadge kind={selected.live ? "live" : "reference"}/><label className="block text-xs font-semibold">Node label<Input value={selected.label} onChange={(event) => setNodes((items) => items.map((node) => node.id === selected.id ? { ...node, label: event.target.value } : node))} onBlur={() => setHistory((items) => [...items.slice(-49), nodes])} className="mt-1"/></label><label className="block text-xs font-semibold">Weight<Input type="number" min={0} max={100} value={selected.weight} onChange={(event) => updateSelected({ weight: Math.max(0, Math.min(100, Number(event.target.value))) })} className="mt-1"/></label><div className="border border-border bg-muted/35 p-3 text-xs"><p className="font-semibold">Execution boundary</p><p className="mt-1 text-muted-foreground">{selected.live ? "Connected to a verified Trustable capability." : "Reference only. No executable EngineWare contract is connected."}</p></div><Button variant="destructive" size="sm" onClick={removeSelected}><X className="mr-1 h-4 w-4"/>Remove node</Button><Button variant="outline" size="sm" onClick={() => { setNodes(INITIAL_NODES); setHistory([]); setFuture([]); }}><RotateCcw className="mr-1 h-4 w-4"/>Reset canvas</Button></div>}
      </aside>
    </div>
  </section>;
}