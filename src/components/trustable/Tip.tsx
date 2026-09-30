import type { ReactNode } from "react";

export function Tip({ text, children }: { text: string; children: ReactNode }) {
  return <span className="group/tip relative inline-flex min-w-0" title={text}>
    {children}
    <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-max max-w-64 -translate-x-1/2 rounded-md bg-primary px-3 py-1.5 text-center text-xs text-primary-foreground shadow-xl group-hover/tip:block group-focus-within/tip:block">
      {text}
    </span>
  </span>;
}
