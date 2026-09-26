import type { Perm } from "./controls";

/** Single source of truth: which permission each workspace requires. */
export const WORKSPACES: { to: string; label: string; perm: Perm; exact?: boolean }[] = [
  { to: "/app", label: "Overview", perm: "overview.view", exact: true },
  { to: "/app/posture", label: "Posture", perm: "posture.view" },
  { to: "/app/evidence", label: "Evidence", perm: "evidence.view" },
  { to: "/app/flow", label: "Trustable Flow", perm: "flow.view" },
  { to: "/app/growth", label: "Builder Growth", perm: "overview.view" },
  { to: "/app/api-console", label: "API Console", perm: "ciso.view" },
  { to: "/app/library", label: "Library", perm: "overview.view" },
  { to: "/app/ciso", label: "CISO Console", perm: "ciso.view" },
  { to: "/app/redteam", label: "Red Team", perm: "redteam.run" },
  { to: "/app/audit", label: "Audit Log", perm: "audit.view" },
  { to: "/app/completion-ledger", label: "Completion Ledger", perm: "audit.view" },
  { to: "/app/access", label: "Access", perm: "access.view" },
  { to: "/app/settings", label: "Settings", perm: "overview.view" },
];

export function permForPath(path: string): Perm | null {
  const p = path.replace(/\/$/, "") || "/app";
  const match = WORKSPACES.filter((n) => (n.exact ? p === n.to : p === n.to || p.startsWith(n.to + "/")));
  return match.sort((a, b) => b.to.length - a.to.length)[0]?.perm ?? null;
}

/** Deny-by-default decision used by both the UI gate and the simulator. */
export function canOpen(path: string, perms: Iterable<string>): boolean {
  const required = permForPath(path);
  if (!required) return false;
  return new Set(perms).has(required);
}
