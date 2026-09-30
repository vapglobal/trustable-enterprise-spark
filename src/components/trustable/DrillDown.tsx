import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function DrillDown({ title, description, trigger, children, className }: { title: string; description?: string; trigger: ReactNode; children: ReactNode; className?: string }) {
  return <Dialog><DialogTrigger asChild>{trigger}</DialogTrigger><DialogContent className={cn("max-h-[85vh] max-w-2xl overflow-y-auto", className)}><DialogHeader><DialogTitle>{title}</DialogTitle>{description && <DialogDescription>{description}</DialogDescription>}</DialogHeader>{children}</DialogContent></Dialog>;
}

export const drillableClass = "cursor-pointer text-left transition duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-[0_18px_45px_-22px_oklch(0_0_0/95%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
