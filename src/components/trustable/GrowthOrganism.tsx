import { useMemo, useState } from "react";
import {
  Activity,
  Award,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Coins,
  Cpu,
  Filter,
  Gauge,
  GitBranch,
  GraduationCap,
  Network,
  Orbit,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { ProofBadge } from "@/components/trustable/Chrome";
import { ReportActions } from "@/components/trustable/ReportActions";
import { Tip } from "@/components/trustable/Tip";
import { cn } from "@/lib/utils";

type BuilderLevel = 1 | 5 | 10;
type GrowthOrganismProps = { liveMinutes: number; liveRuns: number; livePeople: number; liveValue: number };

const LEVELS: Record<BuilderLevel, {
  name: string;
  promise: string;
  description: string;
  next: string;
  advocates: number;
  networkPriority: string;
  tools: Array<{ icon: typeof Sparkles; label: string; detail: string }>;
}> = {
  1: {
    name: "Certified Builder",
    promise: "Create one useful Trustable",
    description: "A guided surface that helps a new builder describe work, prove minutes returned, and share a governed success.",
    next: "Return 600 verified minutes and help two teammates",
    advocates: 1,
    networkPriority: "Standard",
    tools: [
      { icon: Sparkles, label: "Guided creator", detail: "Plain-language prompts and recommended choices" },
      { icon: ShieldCheck, label: "Safety coach", detail: "Built-in permissions and review gates" },
      { icon: Clock3, label: "Value proof", detail: "Measured minutes returned" },
      { icon: Workflow, label: "Starter Trustables", detail: "Approved templates for common work" },
    ],
  },
  5: {
    name: "Trustable Engineer",
    promise: "Connect a team graphlet",
    description: "A team-scale surface for reusable Trustables, parallel work, calibrated handoffs, and management-ready impact reporting.",
    next: "Return 3,000 verified minutes and pass the architecture benchmark",
    advocates: 4,
    networkPriority: "Elevated",
    tools: [
      { icon: GitBranch, label: "Team graphlets", detail: "Reusable people, service, and solution nodes" },
      { icon: SlidersHorizontal, label: "Calibrators", detail: "Adjust routing, confidence, and review thresholds" },
      { icon: Bot, label: "Advocate team", detail: "Four role-bound assistants proposed per builder" },
      { icon: Activity, label: "Manager telemetry", detail: "Adoption, value, and evidence reporting" },
      { icon: Network, label: "Parallel work", detail: "Coordinate multiple governed branches" },
      { icon: Award, label: "Portable proof", detail: "Certification evidence for career progression" },
    ],
  },
  10: {
    name: "Trustable Architect",
    promise: "Shape the enterprise organism",
    description: "An expert surface for organization topology, multi-harness systems, parallel loop sets, policy inspection, and delegated orchestration.",
    next: "Continue coaching the network and proving enterprise value",
    advocates: 10,
    networkPriority: "Dedicated · proposed",
    tools: [
      { icon: BrainCircuit, label: "System One models", detail: "Inspect proposed fast-path decision systems" },
      { icon: Orbit, label: "Multi-harness studio", detail: "Compose governed loops and fallbacks" },
      { icon: Cpu, label: "Topology control", detail: "Map services, gates, bottlenecks, and capacity" },
      { icon: Gauge, label: "Resource governor", detail: "Calibrate bandwidth and network priority" },
      { icon: Users, label: "Delegated command", detail: "Coach builders without bypassing authority" },
      { icon: ShieldCheck, label: "CISO inspection", detail: "Review evidence and policy paths" },
      { icon: Filter, label: "Deep facets", detail: "Filter every visible system dimension" },
      { icon: Network, label: "Lower-level access", detail: "Inspect Level 1 and Level 5 Trustables" },
    ],
  },
};

const PEOPLE = [
  { name: "Bob", callsign: "Blue Actual", role: "Sales operations", level: 1, minutes: 680, x: 10, y: 48 },
  { name: "Diane", callsign: "Major Merge", role: "Global operations", level: 5, minutes: 3420, x: 34, y: 18 },
  { name: "Hubert", callsign: "Captain Callback", role: "Platform engineering", level: 5, minutes: 3980, x: 35, y: 73 },
  { name: "Puter", callsign: "Deep Socket", role: "Enterprise architecture", level: 10, minutes: 8120, x: 67, y: 18 },
  { name: "Sally", callsign: "Sunny Sidecar", role: "Executive operations", level: 1, minutes: 540, x: 67, y: 73 },
  { name: "Katherine", callsign: "Gatekeeper Zero", role: "Security", level: 10, minutes: 9340, x: 87, y: 48 },
] as const;

const EDGES = [
  ["Bob", "Diane", 45], ["Bob", "Hubert", 30], ["Diane", "Puter", 72], ["Hubert", "Sally", 64],
  ["Puter", "Katherine", 91], ["Sally", "Katherine", 52], ["Diane", "Hubert", 58],
] as const;

const CHART = [
  { stage: "Seed", builders: 1, minutes: 30, links: 1, advocates: 1 },
  { stage: "Pilot", builders: 6, minutes: 420, links: 8, advocates: 6 },
  { stage: "Team", builders: 25, minutes: 2100, links: 52, advocates: 46 },
  { stage: "Division", builders: 70, minutes: 7800, links: 184, advocates: 170 },
  { stage: "Enterprise", builders: 160, minutes: 22400, links: 490, advocates: 420 },
];

const ASSUMPTIONS = { discountPerCohort: 2, maximumDiscount: 10, weeksPerYear: 48 } as const;

export function GrowthOrganism({ liveMinutes, liveRuns, livePeople, liveValue }: GrowthOrganismProps) {
  const [level, setLevel] = useState<BuilderLevel>(1);
  const [builders, setBuilders] = useState(52);
  const [levelFive, setLevelFive] = useState(25);
  const [minutesPerBuilder, setMinutesPerBuilder] = useState(45);
  const [reuse, setReuse] = useState(3);
  const [hourlyRate, setHourlyRate] = useState(110);
  const config = LEVELS[level];
  const visiblePeople = PEOPLE.filter((person) => person.level >= level);
  const visibleNames = new Set(visiblePeople.map((person) => person.name));
  const visibleEdges = EDGES.filter(([from, to]) => visibleNames.has(from) && visibleNames.has(to));
  const economics = useMemo(() => {
    const weeklyMinutes = builders * minutesPerBuilder * reuse;
    const annualMinutes = weeklyMinutes * ASSUMPTIONS.weeksPerYear;
    const annualValue = (annualMinutes / 60) * hourlyRate;
    const cohorts = Math.floor(levelFive / 25);
    const discount = Math.min(ASSUMPTIONS.maximumDiscount, cohorts * ASSUMPTIONS.discountPerCohort);
    const links = Math.round(builders * Math.max(1, reuse - 0.4));
    return { weeklyMinutes, annualMinutes, annualValue, discount, links };
  }, [builders, hourlyRate, levelFive, minutesPerBuilder, reuse]);

  const report = { selectedLevel: level, levelName: config.name, liveTenantEvidence: { liveMinutes, liveRuns, livePeople, liveValue }, illustrativeModel: { builders, levelFive, minutesPerBuilder, reuse, hourlyRate, ...economics, assumptions: ASSUMPTIONS } };

  return <div className="space-y-6">
    <section className="overflow-hidden border border-border bg-card shadow-[0_30px_90px_-42px_var(--primary)]">
      <div className="grid gap-5 border-b border-border p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div><div className="flex flex-wrap items-center gap-2"><ProofBadge kind="reference" /><span className="font-mono text-[10px] uppercase text-muted-foreground">Illustrative certification model</span></div><h2 className="mt-3 text-2xl font-bold">One organism. Three radically different surfaces.</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">Change the level once. The entitled people, workspace density, advocates, topology, reporting, and commercial model transform together—without bypassing customer authority.</p></div>
        <div className="flex items-center gap-2"><ReportActions title="Trustable Builder Growth Model" data={report} /></div>
      </div>
      <div className="grid grid-cols-3 border-b border-border" role="group" aria-label="Select Trustable builder level">
        {([1, 5, 10] as const).map((item) => <Button key={item} variant="ghost" onClick={() => setLevel(item)} aria-pressed={level === item} className={cn("h-auto min-w-0 rounded-none border-r border-border px-2 py-4 last:border-r-0 sm:px-5", level === item && "bg-primary/12 text-primary shadow-[inset_0_-3px_0_var(--primary)]")}><span className="text-center"><span className="block font-display text-2xl font-bold">L{item}</span><span className="mt-1 block truncate text-[10px] sm:text-xs">{LEVELS[item].name}</span></span></Button>)}
      </div>
      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div><p className="eyebrow">Level {level} mission</p><h3 className="mt-2 text-3xl font-bold text-vault-gradient">{config.promise}</h3><p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">{config.description}</p><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{config.tools.map(({ icon: Icon, label, detail }) => <Tip key={label} text={detail}><div className="min-h-28 border border-border bg-background/55 p-4 shadow-[0_18px_45px_-26px_oklch(0_0_0/98%)]"><Icon className="h-6 w-6 text-primary"/><p className="mt-3 text-sm font-semibold">{label}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p></div></Tip>)}</div></div>
        <aside className="border border-primary/25 bg-primary/5 p-4 shadow-xl"><div className="flex items-center justify-between"><p className="eyebrow">Next affirmation</p><Award className="h-5 w-5 text-primary"/></div><p className="mt-3 text-sm font-semibold">{config.next}</p><Progress value={level === 1 ? 68 : level === 5 ? 74 : 92} className="mt-4"/><dl className="mt-5 space-y-3 text-xs"><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Advocates</dt><dd className="font-mono">{config.advocates}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Network priority</dt><dd className="font-mono text-right">{config.networkPriority}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Authority</dt><dd className="font-mono text-right">Customer-governed</dd></div></dl></aside>
      </div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Metric icon={Clock3} label="Recorded minutes returned" value={liveMinutes.toLocaleString()} note={`${liveRuns} live tenant runs`} live />
      <Metric icon={Coins} label="Recorded value" value={fmtCurrency(liveValue)} note="Based on department rates" live />
      <Metric icon={Users} label={`Eligible at Level ${level}`} value={String(visiblePeople.length)} note={`${livePeople} people in live tenant records`} />
      <Metric icon={Network} label="Proposed synaptic links" value={String(economics.links)} note="Illustrative network projection" />
    </section>

    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,.65fr)]">
      <div className="border border-border bg-card shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4"><div><p className="eyebrow">OASA organization surface</p><h2 className="mt-1 text-xl font-semibold">People become nodes. Proven value becomes bridges.</h2></div><ProofBadge kind="reference" /></div>
        <div className="relative h-[460px] overflow-hidden bg-background/70 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px]">
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 460" preserveAspectRatio="none" aria-hidden="true">{visibleEdges.map(([from, to, weight]) => { const a=PEOPLE.find((person)=>person.name===from); const b=PEOPLE.find((person)=>person.name===to); if(!a||!b)return null; return <g key={`${from}-${to}`}><path d={`M${a.x*10+55} ${a.y*4.6+28} C${(a.x+b.x)*5+55} ${a.y*4.6+28}, ${(a.x+b.x)*5+55} ${b.y*4.6+28}, ${b.x*10+55} ${b.y*4.6+28}`} fill="none" stroke="var(--primary)" strokeOpacity=".6" strokeWidth={Math.max(2,weight/18)} strokeDasharray="9 7" className="animate-pulse motion-reduce:animate-none"/><text x={(a.x+b.x)*5+55} y={(a.y+b.y)*2.3+14} textAnchor="middle" fill="var(--muted-foreground)" fontSize="11">{weight}%</text></g>; })}</svg>
          {visiblePeople.map((person) => <Tip key={person.name} text={`${person.role} · ${person.minutes.toLocaleString()} illustrative verified minutes`}><div className={cn("absolute z-10 w-36 border bg-card/95 p-3 shadow-[0_20px_50px_-22px_oklch(0_0_0/98%)]",person.level===10?"border-warning/50":person.level===5?"border-primary/55":"border-border")} style={{left:`min(${person.x}%, calc(100% - 9rem))`,top:`min(${person.y}%, calc(100% - 7rem))`}}><span className="flex items-center justify-between"><span className="grid h-8 w-8 place-items-center rounded-full bg-primary/12"><Users className="h-4 w-4 text-primary"/></span><span className="font-mono text-[10px] text-primary">L{person.level}</span></span><p className="mt-2 text-sm font-semibold">{person.name}</p><p className="truncate font-mono text-[9px] text-warning">{person.callsign}</p><p className="mt-1 truncate text-[10px] text-muted-foreground">{person.role}</p></div></Tip>)}
          {!visiblePeople.length && <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">No sample users meet this level.</div>}
        </div>
      </div>
      <div className="border border-border bg-card p-5 shadow-xl"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow">Progression model</p><h2 className="mt-1 text-xl font-semibold">Learning compounds into reach</h2></div><ProofBadge kind="reference" /></div><div className="mt-5 h-[285px]" aria-label="Illustrative growth chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={CHART} margin={{left:-20,right:8,top:8,bottom:8}}><CartesianGrid stroke="var(--border)" strokeDasharray="4 4"/><XAxis dataKey="stage" tick={{fill:"var(--muted-foreground)",fontSize:10}}/><YAxis tick={{fill:"var(--muted-foreground)",fontSize:10}}/><ChartTooltip contentStyle={{background:"var(--popover)",border:"1px solid var(--border)",fontSize:12}}/><Line type="monotone" dataKey="builders" stroke="var(--primary)" strokeWidth={3}/><Line type="monotone" dataKey="links" stroke="var(--heart)" strokeWidth={2}/><Line type="monotone" dataKey="advocates" stroke="var(--success)" strokeWidth={2}/></LineChart></ResponsiveContainer></div><div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px]"><Legend color="bg-primary" label="Builders"/><Legend color="bg-heart" label="Links"/><Legend color="bg-success" label="Advocates"/></div><p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">Each bridge represents one person or solution returning measurable value to another. OASA negotiation and advocate expansion remain Reference architecture.</p></div>
    </section>

    <section className="border border-border bg-card shadow-[0_28px_80px_-38px_var(--primary)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5"><div><p className="eyebrow">Sales and efficiency bridge</p><h2 className="mt-1 text-xl font-semibold">Calibrate the mutually beneficial growth model</h2></div><span className="border border-warning/35 bg-warning/10 px-2 py-1 font-mono text-[10px] uppercase text-warning">Illustrative commercial model</span></div>
      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.8fr)]">
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <Calibrator label="Active builders" value={builders} min={1} max={250} step={1} setValue={setBuilders} help="People actively creating or reusing governed Trustables."/>
          <Calibrator label="Level 5 graduates" value={levelFive} min={0} max={Math.max(25,builders)} step={1} setValue={setLevelFive} help="Illustrative certified builders; each group of 25 triggers an example discount tier."/>
          <Calibrator label="Minutes saved per builder/week" value={minutesPerBuilder} min={5} max={240} step={5} setValue={setMinutesPerBuilder} help="Average measurable time returned by each active builder every week."/>
          <Calibrator label="Solution reuse multiplier" value={reuse} min={1} max={10} step={1} setValue={setReuse} help="Average number of people or teams benefiting from each solution."/>
          <Calibrator label="Loaded hourly value" value={hourlyRate} prefix="$" min={40} max={300} step={5} setValue={setHourlyRate} help="Blended labor value used for the projection."/>
        </div>
        <div className="grid grid-cols-2 gap-3"><Projection label="Weekly minutes" value={economics.weeklyMinutes.toLocaleString()} icon={Clock3}/><Projection label="Annual value" value={fmtCurrency(economics.annualValue)} icon={Coins}/><Projection label="Network links" value={economics.links.toLocaleString()} icon={Network}/><Projection label="Example discount" value={`${economics.discount}%`} icon={Target}/><div className="col-span-2 border border-primary/30 bg-primary/8 p-4"><p className="text-xs font-semibold">Mutual efficiency rule</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Every 25 proposed Level 5 graduates adds a 2% example contract discount, capped at 10%. This is not a customer offer or live billing rule.</p></div></div>
      </div>
    </section>

    <section className="grid gap-4 md:grid-cols-3"><Outcome icon={GraduationCap} title="The builder wins" text="Portable proof, visible growth, new capabilities, and a guided path from first value to architecture leadership."/><Outcome icon={Users} title="The enterprise wins" text="Auditable time returned, governed reuse, stronger internal capability, and management-ready evidence."/><Outcome icon={Zap} title="The platform wins" text="Efficient throughput, reusable patterns, stronger adoption, and a clearer expansion path for sales teams."/></section>
  </div>;
}

function Metric({ icon: Icon, label, value, note, live = false }: { icon: typeof Clock3; label: string; value: string; note: string; live?: boolean }) { return <div className="border border-border bg-card p-5 shadow-lg"><div className="flex items-center justify-between"><Icon className="h-5 w-5 text-primary"/>{live ? <ProofBadge kind="live"/> : <span className="font-mono text-[9px] uppercase text-warning">Illustrative</span>}</div><p className="mt-4 font-display text-3xl font-bold">{value}</p><p className="mt-1 text-sm font-semibold">{label}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div>; }
function Calibrator({ label, value, prefix="", min, max, step, setValue, help }: { label:string; value:number; prefix?:string; min:number; max:number; step:number; setValue:(value:number)=>void; help:string }) { return <Tip text={help}><label className="enterprise-field block"><span className="flex items-center justify-between gap-3 text-xs font-semibold"><span>{label}</span><span className="font-mono text-primary">{prefix}{value.toLocaleString()}</span></span><Slider className="mt-4" value={[value]} min={min} max={max} step={step} onValueChange={(next)=>{const first=next[0]; if(typeof first==="number")setValue(first);}} aria-label={label}/><span className="mt-2 flex justify-between font-mono text-[9px] text-muted-foreground"><span>{prefix}{min}</span><span>{prefix}{max}</span></span></label></Tip>; }
function Projection({label,value,icon:Icon}:{label:string;value:string;icon:typeof Clock3}) { return <div className="border border-border bg-background/55 p-4 shadow-md"><Icon className="h-4 w-4 text-primary"/><p className="mt-3 font-display text-xl font-bold">{value}</p><p className="text-[10px] text-muted-foreground">{label}</p></div>; }
function Outcome({icon:Icon,title,text}:{icon:typeof GraduationCap;title:string;text:string}) { return <div className="border border-border bg-card p-5 shadow-lg"><Icon className="h-6 w-6 text-primary"/><h3 className="mt-4 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p></div>; }
function Legend({color,label}:{color:string;label:string}) { return <span className="flex items-center justify-center gap-1.5"><span className={cn("h-2 w-2 rounded-full",color)}/>{label}</span>; }
function fmtCurrency(value:number) { return value.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}); }