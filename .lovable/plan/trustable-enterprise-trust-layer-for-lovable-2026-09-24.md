# Trustable — Enterprise Trust Layer for Lovable

## What I found in CareerCaptain

Trustable already exists there as strategy and prep material, not as a real product. Confirmed files:

- `docs/research/TRUSTABLE_ENTERPRISE_TECHNICAL_MANUAL.md` — heart/brain architecture, VAULTABLE zero-egress enclave, TypeSafe Jev bounded judgments (32ms), DataProvider contract, 90-day roadmap
- `docs/research/LOVABLE_LEADERSHIP_TEAR_SHEET_TRUSTABLE.md` — brand thesis for Anton Osika, Fabian Hedin, Matt Norton; domain/trademark actions; 10-account S&P 500 pilot
- `docs/research/TRUSTABLE_COMPLETE_MARKETING_COLLATERAL.md`
- `docs/research/JESSICA_POST_CALL_DEBRIEF_2026-09-23.md` and `MATT_NORTON_CROATIA_OFFSITE_EMAIL.md`
- `docs/plans/2026-09-23_LOVABLE_TRUSTABLE_TECHNICAL_PRESENTATION_PLAN.md`
- `docs/presentations/TRUSTABLE_TECHNICAL_PRESENTATION.html`
- `src/pages/TrustableShowcasePage.tsx` (5,456 lines), `src/components/trustable/*` (Heart-to-Vault Studio, Enterprise Node Map, Brand TLD Dossier)
- `src/lib/trustableAuthGate.ts`, `trustableSecurityAuditor.ts`, `trustableArchitectureKnowledge.ts`
- `docs/audit_packages/LOVABLE_ROUND2_TECHNICAL_AUDIT_PACKAGE_v1.0/*`

All of it is a **presentation layer inside a personal prep app** — simulated state, no real backend, no real auth, no real audit ledger. For an advanced-round technical panel that is the gap to close.

## What this project becomes

A standalone, genuinely production-secured **Trustable** app: real accounts, real roles, real row-level data isolation, real cryptographic audit ledger, real server-side enforcement — presented through the Heart-to-Vault visual language from your hero image.

### 1. Real security foundation (the part that must not be theater)
- Lovable Cloud enabled: real sign-up/sign-in, session handling
- Tenants (enterprise orgs) with strict per-tenant data isolation, enforced in the database, not the UI
- Separate roles table (`owner`, `admin`, `operator`, `auditor`) with a security-definer role check — no roles on profiles, no client-side admin flags
- Every privileged action runs server-side and re-verifies the caller's role and tenant
- Append-only audit ledger: each entry hash-chained to the previous one (SHA-512), tamper-evident, readable by auditors, writable by no one directly

### 2. Trustable Flow — the Bob & Sally demo, made real
- Operator describes a repetitive task in plain language
- A bounded, schema-validated decision step returns a strictly typed action matrix (enum choice / extracted values / confidence score) with a deterministic human-review fallback when confidence is low — this is the TypeSafe Jev story, actually executing
- Flow runs, writes real records, emits real ledger entries, returns minutes saved
- Dignified confirmation, not a cheesy toast

### 3. CISO console
- Live tenant security posture: RLS coverage, role grants, egress policy, key custody
- Tricorder telemetry view: workflow latency, silo hotspots, zero-PII verification
- Ledger explorer with hash-chain verification you can run live on the panel — break a record, watch verification fail
- One-click signed Threat & Workflow Surface Report export (JSON, matching the receipt format you uploaded)

### 4. Executive ROI + adoption
- Aggregate minutes saved, dollarized, by department
- The wildfire adoption trail (Bob → Sally → Kathy → Diane → Frank) driven by real usage rows, not hardcoded arrays

### 5. Architecture showcase (the pitch surface)
- Heart-to-Vault hero matching your uploaded design: dark enclave, Lovable heart core, forming trust boundary, cyan accents
- Zero-egress VAULTABLE topology, end-to-end data flow, DataProvider contract, 90-day roadmap
- Framed as "Trustable, powered by Lovable" throughout

## Seeded demo state

Ships with a demo enterprise tenant pre-populated at first load — departments, personas, completed flows, ledger blocks, ROI figures — so the panel sees a live system, not an empty shell. Your two uploaded receipts (Sally's meeting-notes flow, the zero-egress containment pass) are included as real ledger entries.

## Technical notes

- TanStack Start + Lovable Cloud (Postgres, auth, server functions)
- Tables: `tenants`, `tenant_members`, `user_roles`, `departments`, `flows`, `flow_runs`, `audit_ledger`, `telemetry_events`; RLS on every one, explicit grants, no anon write path
- Hash chain: `block_hash = sha512(prev_hash || canonical_json(payload) || ts)`, computed server-side only; verification endpoint walks the chain
- Bounded decisions via Lovable AI with a strict schema validator; invalid or low-confidence output routes to a review queue rather than being retried into compliance
- Admin-privileged operations never use client-supplied role claims
- Security scan run before delivery; findings fixed, not waived

## Order of work

1. Cloud + schema + RLS + roles + seeded demo tenant
2. Auth and tenant-scoped shell
3. Trustable Flow end-to-end with ledger writes
4. CISO console + live chain verification + signed report export
5. Executive ROI and adoption trail
6. Heart-to-Vault architecture showcase and brand polish
7. Full security scan, end-to-end verification signed in as a real operator and as an auditor

## Adjustments from the latest agent output (confidential)

- **Reviewer access done securely.** The draft email offers a 24h bearer token in the URL and shared passphrases that skip login. A security panel will flag that immediately (tokens leak through browser history, logs, and forwarded emails). Instead: named reviewer accounts for Matt, Jessica, Katie, Kevin, and Luke, each with an auditor or operator role. Access is revocable and every sign-in goes into the ledger. You'd send each person a one-time invite link.
- **Confidentiality marking on every screen and export.** Footer text: "Property of EngineWare.ai. Solely authored and owned by Christopher Ware. Confidential & Proprietary — prepared exclusively for Lovable.dev leadership evaluation." The whole app is private (no search indexing, sign-in required past the landing page).
- **Label proof clearly: what runs vs. what's roadmap.** Things this app actually does (roles, data isolation, hash-chained ledger, schema-checked AI decisions) get a "Live" badge. Hardware isolation (AMD SEV-SNP), on-prem GPU enclaves, kernel egress rules, and the TypeSafe benchmark numbers get a "Reference architecture" badge. Panelists will probe these claims, and being upfront about which is which builds more trust than overclaiming.
- **Red-team workbench (the TrustGuard idea, made real).** Run live attacks against the app itself: prompt injection against the decision step, reading another tenant's data, raising your own role, editing the ledger. Each attempt shows up as blocked, with evidence.
- **Worth checking before you send (not built):** the draft names "Claude 3.5 Sonnet / GPT-4o / o1" (outdated for 2026), says Anton bought lovable.com, and says you own trustable.com, which your own tear sheet calls "available at ~$25k". Make sure every fact is verified before it reaches Matt.
