import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { bootstrapAccess } from "@/lib/trustable.functions";
import type { Perm } from "@/lib/controls";

export function useAccess() {
  const boot = useServerFn(bootstrapAccess);
  const q = useQuery({ queryKey: ["access"], queryFn: () => boot(), staleTime: 60_000 });
  const perms = new Set<string>(q.data?.perms ?? []);
  return { ...q, can: (p: Perm) => perms.has(p) };
}
