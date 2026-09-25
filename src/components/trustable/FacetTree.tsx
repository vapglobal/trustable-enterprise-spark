import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronRight, MoreHorizontal, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tip } from "./Tip";
import { cn } from "@/lib/utils";

export type FacetTreeOption = { value: string; label: string; count?: number; hint?: string };
export type FacetTreeGroup = { id: string; label: string; options: FacetTreeOption[] };

export function FacetTree({ groups, selected, onChange, label = "Filter and search", className }: {
  groups: FacetTreeGroup[];
  selected: Record<string, string[]>;
  onChange: (next: Record<string, string[]>) => void;
  label?: string;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(() => new Set(groups.map((group) => group.id)));
  const [open, setOpen] = useState(false);
  const activeCount = Object.values(selected).reduce((sum, values) => sum + values.length, 0);
  const visibleGroups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return groups;
    return groups.map((group) => ({
      ...group,
      options: group.options.filter((option) => `${group.label} ${option.label} ${option.hint ?? ""}`.toLowerCase().includes(needle)),
    })).filter((group) => group.options.length > 0);
  }, [groups, query]);
  const toggle = (groupId: string, value: string) => {
    const current = selected[groupId] ?? [];
    onChange({ ...selected, [groupId]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value] });
  };
  const clear = () => onChange(Object.fromEntries(groups.map((group) => [group.id, []])));
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tip text={`${label}. Search every facet, expand branches, and select multiple values.`}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className={cn("relative h-9 w-9 shadow-lg", className)} aria-label={label} aria-haspopup="tree">
            <MoreHorizontal className="h-4 w-4" />
            {activeCount > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">{activeCount}</span>}
          </Button>
        </PopoverTrigger>
      </Tip>
      <PopoverContent align="start" className="w-[min(92vw,340px)] overflow-hidden p-0 shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search every facet…" aria-label="Search every facet" className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" />
          {query && <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setQuery("")} aria-label="Clear facet search"><X className="h-3.5 w-3.5" /></Button>}
        </div>
        <div className="flex items-center justify-between border-b border-border px-3 py-2 text-xs">
          <span className="text-muted-foreground">{activeCount ? `${activeCount} selected` : "All results (recommended)"}</span>
          <Button size="sm" variant="ghost" className="h-7" onClick={clear} disabled={!activeCount}>Clear</Button>
        </div>
        <div role="tree" aria-label={label} className="max-h-[min(60vh,430px)] overflow-y-auto p-2">
          {visibleGroups.map((group) => {
            const isExpanded = expanded.has(group.id) || Boolean(query);
            const groupSelected = selected[group.id] ?? [];
            return <div key={group.id} role="group" aria-label={group.label} className="mb-1 last:mb-0">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`${isExpanded ? "Collapse" : "Expand"} ${group.label}`} onClick={() => setExpanded((current) => { const next = new Set(current); if (next.has(group.id)) next.delete(group.id); else next.add(group.id); return next; })}>
                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </Button>
                <button type="button" className="flex min-h-8 min-w-0 flex-1 items-center gap-2 rounded px-1 text-left text-xs font-semibold hover:bg-accent" onClick={() => setExpanded((current) => new Set(current).add(group.id))}>
                  <span className="truncate">{group.label}</span>
                  <span className="ml-auto font-mono text-[9px] text-muted-foreground">{groupSelected.length || group.options.length}</span>
                </button>
              </div>
              {isExpanded && <div className="ml-4 border-l border-border pl-2">
                {group.options.map((option) => {
                  const checked = groupSelected.includes(option.value);
                  return <label key={option.value} role="treeitem" aria-selected={checked} className={cn("flex min-h-10 cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs", checked ? "bg-primary/10 text-foreground" : "hover:bg-accent")}>
                    <Checkbox checked={checked} onCheckedChange={() => toggle(group.id, option.value)} aria-label={`${checked ? "Remove" : "Add"} ${option.label}`} />
                    <span className="min-w-0 flex-1"><span className="block truncate">{option.label}</span>{option.hint && <span className="block truncate text-[10px] text-muted-foreground">{option.hint}</span>}</span>
                    {typeof option.count === "number" && <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">{option.count}</span>}
                    {checked && <Check className="h-3.5 w-3.5 text-primary" />}
                  </label>;
                })}
              </div>}
            </div>;
          })}
          {!visibleGroups.length && <p className="px-3 py-8 text-center text-xs text-muted-foreground">No facet or value matches “{query}”.</p>}
        </div>
        <div className="border-t border-border px-3 py-2 text-[10px] text-muted-foreground">Search filters both branches and values. Selections combine across the tree.</div>
      </PopoverContent>
    </Popover>
  );
}