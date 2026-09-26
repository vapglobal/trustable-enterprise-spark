import { describe, expect, it } from "vitest";
import { WORKSPACES, canOpen, permForPath } from "./workspaces";

const ROLE_PERMS = {
  none: [],
  auditor: ["overview.view", "posture.view", "audit.view", "evidence.view"],
  operator: ["overview.view", "flow.view", "flow.run"],
} as const;

describe("workspace authorization", () => {
  it("every workspace declares a required permission", () => {
    for (const w of WORKSPACES) expect(permForPath(w.to)).toBe(w.perm);
  });
  it("denies every workspace with no permissions", () => {
    for (const w of WORKSPACES) expect(canOpen(w.to, ROLE_PERMS.none)).toBe(false);
  });
  it("denies unknown paths by default", () => {
    expect(canOpen("/app/secret-admin", ["access.manage"])).toBe(false);
  });
  it("sub-paths inherit the parent requirement", () => {
    expect(permForPath("/app/access/roles")).toBe("access.view");
  });
  it("auditor cannot reach access, red team, or flow", () => {
    for (const p of ["/app/access", "/app/redteam", "/app/flow", "/app/ciso"]) expect(canOpen(p, ROLE_PERMS.auditor)).toBe(false);
    expect(canOpen("/app/audit", ROLE_PERMS.auditor)).toBe(true);
  });
  it("operator is limited to overview-level and flow workspaces", () => {
    const allowed = WORKSPACES.filter((w) => canOpen(w.to, ROLE_PERMS.operator)).map((w) => w.perm);
    expect(new Set(allowed)).toEqual(new Set(["overview.view", "flow.view"]));
  });
});
