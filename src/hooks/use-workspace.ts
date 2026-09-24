import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getWorkspace } from "@/lib/trustable.functions";

export function useWorkspace() {
  const fn = useServerFn(getWorkspace);
  return useQuery({ queryKey: ["workspace"], queryFn: () => fn() });
}

export type Workspace = Awaited<ReturnType<typeof getWorkspace>>;

export function fmtMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
