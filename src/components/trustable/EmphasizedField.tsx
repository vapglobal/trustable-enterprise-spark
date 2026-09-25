import { cloneElement, isValidElement, useState, type ReactElement, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { BookOpen, Copy, MoreHorizontal, Sparkles, WandSparkles } from "lucide-react";
import { assistField } from "@/lib/assistant.server";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LibraryPicker } from "./LibraryPicker";

type Action = "improve" | "shorten" | "expand" | "fix" | "draft";

export function EmphasizedField({ label, value, onChange, children, hint, ai = true, library = false, className }: {
  label: string; value: string; onChange: (value: string) => void; children: ReactElement; hint?: string; ai?: boolean; library?: boolean; className?: string;
}) {
  const run = useServerFn(assistField);
  const [busy, setBusy] = useState(false);
  async function act(instruction: Action) {
    setBusy(true);
    try {
      const r = await run({ data: { label, value, instruction, context: hint } });
      onChange(r.value);
      toast.success(`${label} updated with AI`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "AI assist failed"); } finally { setBusy(false); }
  }
  const control = isValidElement(children) ? cloneElement(children, { className: cn("enterprise-control", (children.props as { className?: string }).className) } as never) : children;
  return (
    <div className={cn("enterprise-field group/field", className)}>
      <div className="mb-2 flex min-h-8 items-center justify-between gap-2">
        <div><Label>{label}</Label>{hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}</div>
        <div className="flex items-center gap-1 opacity-80 transition-opacity group-hover/field:opacity-100 group-focus-within/field:opacity-100">
          {library && <LibraryPicker label="Library" onInsert={(text) => onChange(value ? `${value}\n\n${text}` : text)} />}
          {ai && <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => act(value.trim() ? "improve" : "draft")} title="Improve this field with Trustable AI"><Sparkles className="h-4 w-4" /><span className="sr-only">AI assist</span></Button>}
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button type="button" size="sm" variant="ghost" title={`${label} actions`}><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Field actions</span></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {ai && <><DropdownMenuItem onSelect={() => act("improve")}><WandSparkles />Improve with AI</DropdownMenuItem><DropdownMenuItem onSelect={() => act("fix")}><Sparkles />Fix spelling and grammar</DropdownMenuItem><DropdownMenuItem onSelect={() => act("shorten")}>Shorten</DropdownMenuItem><DropdownMenuItem onSelect={() => act("expand")}>Add useful detail</DropdownMenuItem><DropdownMenuSeparator /></>}
              <DropdownMenuItem onSelect={() => navigator.clipboard.writeText(value).then(() => toast.success("Copied"))}><Copy />Copy field</DropdownMenuItem>
              {library && <DropdownMenuItem onSelect={(e) => e.preventDefault()}><BookOpen />Use Library above</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {control}
    </div>
  );
}

export function EmphasizedControl({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return <div className={cn("enterprise-field", className)}><div className="mb-2"><Label>{label}</Label>{hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}</div>{children}</div>;
}
