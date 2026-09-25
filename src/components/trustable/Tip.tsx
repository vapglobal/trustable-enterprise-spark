import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
export function Tip({ text, children }: { text: string; children: ReactNode }) { return <TooltipProvider delayDuration={250}><Tooltip><TooltipTrigger asChild>{children}</TooltipTrigger><TooltipContent sideOffset={7} className="max-w-xs">{text}</TooltipContent></Tooltip></TooltipProvider>; }
