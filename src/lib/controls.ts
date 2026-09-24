export const CONTROLS = [
  { id: "IAM-01", name: "Identity & SSO enforcement", frameworks: "SOC 2 CC6.1 · ISO A.5.16" },
  { id: "IAM-02", name: "Least-privilege access & reviews", frameworks: "SOC 2 CC6.3 · ISO A.5.18" },
  { id: "IAM-03", name: "MFA for privileged access", frameworks: "SOC 2 CC6.1 · NIST IA-2" },
  { id: "DAT-01", name: "Data classification & tenant isolation", frameworks: "SOC 2 C1.1 · ISO A.5.12" },
  { id: "DAT-02", name: "Encryption at rest & in transit", frameworks: "SOC 2 CC6.7 · ISO A.8.24" },
  { id: "DAT-03", name: "Key management & custody", frameworks: "ISO A.8.24 · NIST SC-12" },
  { id: "NET-01", name: "Network segmentation & egress control", frameworks: "SOC 2 CC6.6 · ISO A.8.22" },
  { id: "LOG-01", name: "Tamper-evident audit logging", frameworks: "SOC 2 CC7.2 · ISO A.8.15" },
  { id: "LOG-02", name: "Monitoring, alerting & detection", frameworks: "SOC 2 CC7.3 · NIST SI-4" },
  { id: "VUL-01", name: "Vulnerability & patch management", frameworks: "SOC 2 CC7.1 · ISO A.8.8" },
  { id: "SDL-01", name: "Secure SDLC & change management", frameworks: "SOC 2 CC8.1 · ISO A.8.25" },
  { id: "IR-01", name: "Incident response & breach notice", frameworks: "SOC 2 CC7.4 · ISO A.5.24" },
  { id: "BCP-01", name: "Backup, recovery & continuity", frameworks: "SOC 2 A1.2 · ISO A.8.13" },
  { id: "VEN-01", name: "Vendor & AI model risk", frameworks: "SOC 2 CC9.2 · ISO 42001" },
] as const;

export type ControlId = (typeof CONTROLS)[number]["id"];
export const CONTROL_IDS = CONTROLS.map((c) => c.id) as [ControlId, ...ControlId[]];

export const PERMISSION_AREAS = ["Overview", "Posture", "Flow", "CISO", "Red Team", "Evidence", "Audit", "Access"] as const;

export type Perm =
  | "overview.view" | "posture.view" | "flow.view" | "flow.run" | "ciso.view" | "ledger.verify"
  | "report.export" | "redteam.run" | "evidence.view" | "evidence.upload" | "evidence.analyze"
  | "findings.manage" | "audit.view" | "audit.export" | "access.view" | "access.invite" | "access.manage";

export const AUDIT_CATEGORIES = [
  { key: "access", label: "Authentication" },
  { key: "authz", label: "Authorization" },
  { key: "admin", label: "Administrative" },
  { key: "evidence", label: "Evidence access" },
  { key: "findings", label: "Findings" },
  { key: "flow", label: "Workspace: Flow" },
  { key: "ledger", label: "Ledger" },
  { key: "report", label: "Reports" },
  { key: "audit", label: "Audit" },
  { key: "redteam", label: "Red team" },
] as const;
