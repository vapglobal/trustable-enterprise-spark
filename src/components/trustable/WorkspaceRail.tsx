import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  BookOpen,
  Braces,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  ClipboardCheck,
  Gauge,
  KeyRound,
  Library,
  Menu,
  Network,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Users,
  Workflow,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tip } from "@/components/trustable/Tip";
import { cn } from "@/lib/utils";
import type { Perm } from "@/lib/controls";

type RailItem = { to: string; label: string; icon: typeof Gauge; perm: Perm; exact?: boolean };
type RailGroup = { label: string; items: RailItem[] };

const GROUPS: RailGroup[] = [
  { label: "Operate", items: [
    { to: "/app", label: "Overview", icon: Gauge, perm: "overview.view", exact: true },
    { to: "/app/flow", label: "Trustable Flow", icon: Workflow, perm: "flow.view" },
    { to: "/app/library", label: "Library", icon: Library, perm: "overview.view" },
  ] },
  { label: "Assure", items: [
    { to: "/app/posture", label: "Posture", icon: ShieldCheck, perm: "posture.view" },
    { to: "/app/evidence", label: "Evidence", icon: FileCheck2, perm: "evidence.view" },
    { to: "/app/redteam", label: "Red Team", icon: ShieldAlert, perm: "redteam.run" },
    { to: "/app/audit", label: "Audit Log", icon: Activity, perm: "audit.view" },
    { to: "/app/completion-ledger", label: "Completion Ledger", icon: ClipboardCheck, perm: "audit.view" },
  ] },
  { label: "Develop", items: [
    { to: "/app/api-console", label: "OASA Console", icon: Braces, perm: "ciso.view" },
    { to: "/app/ciso", label: "CISO Console", icon: Network, perm: "ciso.view" },
  ] },
  { label: "Administer", items: [
    { to: "/app/access", label: "Access", icon: Users, perm: "access.view" },
    { to: "/app/settings", label: "Settings", icon: Settings, perm: "overview.view" },
  ] },
];

export function WorkspaceRail({ can }: { can: (perm: Perm) => boolean }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  return (
    <>
      <div className="fixed bottom-4 left-4 z-30 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild><Button size="icon" aria-label="Open workspace menu"><Menu className="h-4 w-4" /></Button></SheetTrigger>
          <SheetContent side="left" className="w-[290px] p-0">
            <SheetHeader className="border-b border-border p-4 text-left"><SheetTitle>Trustable workspace</SheetTitle><SheetDescription>Secure tools and consoles</SheetDescription></SheetHeader>
            <RailContent pathname={pathname} can={can} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
      <aside className={cn("sticky top-[104px] hidden h-[calc(100vh-104px)] shrink-0 border-r border-border bg-card/45 transition-[width] duration-200 lg:block", collapsed ? "w-14" : "w-56")}>
        <div className="flex h-11 items-center justify-between border-b border-border px-2">
          {!collapsed && <p className="min-w-0 truncate px-2 font-mono text-[10px] font-semibold uppercase text-muted-foreground">Trustable modules</p>}
          <Tip text={collapsed ? "Expand workspace menu" : "Collapse workspace menu"}>
            <Button size="icon" variant="ghost" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand workspace menu" : "Collapse workspace menu"}>
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </Tip>
        </div>
        <RailContent pathname={pathname} can={can} collapsed={collapsed} />
      </aside>
    </>
  );
}

function RailContent({ pathname, can, collapsed = false, onNavigate }: { pathname: string; can: (perm: Perm) => boolean; collapsed?: boolean; onNavigate?: () => void }) {
  return <nav className="h-[calc(100%-2.75rem)] overflow-y-auto p-2">{GROUPS.map((group) => {
    const items = group.items.filter((item) => can(item.perm));
    if (!items.length) return null;
    const active = items.some((item) => item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/"));
    return <Collapsible key={group.label} defaultOpen={active || group.label === "Operate"}>
      {!collapsed && <CollapsibleTrigger asChild><Button variant="ghost" className="mb-1 h-8 w-full justify-between px-2 text-[10px] font-semibold uppercase text-muted-foreground">{group.label}<ChevronDown className="h-3.5 w-3.5" /></Button></CollapsibleTrigger>}
      <CollapsibleContent className="space-y-1">{items.map((item) => {
        const current = item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/");
        const link = <Link to={item.to} activeOptions={{ exact: !!item.exact }} onClick={onNavigate} className={cn("flex h-9 items-center gap-2 rounded px-2 text-xs transition-colors", current ? "bg-primary/12 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground", collapsed && "justify-center")}><item.icon className="h-4 w-4 shrink-0" />{!collapsed && <span className="truncate">{item.label}</span>}</Link>;
        return collapsed ? <Tip key={item.to} text={item.label}>{link}</Tip> : <div key={item.to}>{link}</div>;
      })}</CollapsibleContent>
    </Collapsible>;
  })}<div className={cn("mt-3 border-t border-border pt-3", collapsed && "flex justify-center")}><Tip text="Access is role-based and checked again before protected actions"><div className="flex items-center gap-2 px-2 text-[10px] text-muted-foreground"><KeyRound className="h-3.5 w-3.5 shrink-0" />{!collapsed && <span>Least-privilege access</span>}</div></Tip></div></nav>;
}