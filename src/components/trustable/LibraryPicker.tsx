import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, FileText, Link2, StickyNote } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listLibrary, itemAsText, type LibraryItem } from "@/lib/library";

const ICON = { file: FileText, link: Link2, note: StickyNote } as const;

/** Inserts a library item's content into any form field. */
export function LibraryPicker({ onInsert, label = "Insert from library" }: { onInsert: (text: string, item: LibraryItem) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const { data = [], isLoading } = useQuery({ queryKey: ["library"], queryFn: listLibrary, enabled: open });
  const items = data.filter((i) => (i.title + " " + i.tags.join(" ")).toLowerCase().includes(q.toLowerCase()));
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm"><BookOpen className="mr-1.5 h-4 w-4" />{label}</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="end">
        <Input autoFocus placeholder="Search your library" value={q} onChange={(e) => setQ(e.target.value)} className="mb-2 h-8" />
        <div className="max-h-72 overflow-y-auto">
          {isLoading && <p className="p-3 text-xs text-muted-foreground">Loading…</p>}
          {!isLoading && items.length === 0 && <p className="p-3 text-xs text-muted-foreground">Nothing yet. Add links, files or notes in Library.</p>}
          {items.map((i) => {
            const I = ICON[i.kind];
            return (
              <button key={i.id} type="button" onClick={() => { onInsert(itemAsText(i), i); setOpen(false); }}
                className="flex w-full items-start gap-2 rounded-md p-2 text-left text-sm hover:bg-accent">
                <I className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="min-w-0"><span className="block truncate">{i.title}</span>
                  {i.tags.length > 0 && <span className="block truncate text-[11px] text-muted-foreground">{i.tags.join(" · ")}</span>}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
