# Trustable — Organism Growth, Certification & Enterprise Flywheel Model

Status: design synthesis, read-only review. Everything below is either **Live** (backed by real rows/queries in the current schema — `flows`, `flow_runs`, `audit_ledger`, `telemetry_events`, `departments`, `tenant_members`) or explicitly marked **Reference (illustrative)** where no backing data model exists yet. No screen may show a number without one of these two badges.

## 1. Safe terminology (replaces viral/growth-hacking language)

| Avoid | Use instead |
|---|---|
| "viral loop," "invite to unlock," "referral chain" | **Network growth**, **healthy adoption path**, **organism growth** |
| "streak," "leaderboard shaming," "FOMO" | **Momentum**, **standing**, **recognition** |
| "infect," "spread" | **Extend**, **connect**, **onboard** |
| "level up" (game-only framing) | **Maturity stage** (ties to real capability, not points) |
| "viral coefficient" | **Adoption reach** (# of colleagues a person has credibly helped onboard, capped and auditable) |

UI copy principle: every gamified element must map to a *real, auditable* organizational outcome (minutes saved, flows certified, incidents avoided) — never an abstract score. No countdown timers, no artificial scarcity, no dark-pattern nudges.

## 2. Maturity model: Level 1 / 5 / 10

Levels represent **flow maturity + operator trust**, not raw usage volume. Progression requires both usage AND a passed safety review — this is the anti-gaming control.

### Level 1 — "Sprout" (Live)
- Trigger: operator completes first Trustable Flow with a ledger-verified run.
- Visual: single green node pulsing on the org map, connected only to the operator's own department.
- Entitlements: create personal flows, use catalog templates, view own minutes-saved.
- Copy: "Your first flow is live and verified in the ledger."

### Level 5 — "Rooted" (Live, with one Reference sub-metric)
- Trigger: 5 distinct certified flows OR 3 flows adopted by a second named colleague, each with a passing Red-Team check.
- Visual: node map shows a small cluster (3-6 nodes) with edges labeled by minutes saved, colored by department.
- Entitlements: save-as-template to team catalog, invite named colleagues (no open links — matches existing "no bearer-token" security rule), view team ROI rollup.
- Reference sub-metric (label required): "predicted quarterly savings" projection — illustrative until enough `flow_runs` history exists for a real trend line.

### Level 10 — "Canopy" (mixed Live/Reference)
- Trigger: certified flows span ≥3 departments, cumulative ledger-verified minutes saved crosses tenant threshold (e.g., 500 hrs), zero unresolved Red-Team findings.
- Visual: full organism map — org-wide node graph, department clusters as "branches," a glowing root/trunk representing the tenant's aggregate ledger integrity score.
- Entitlements: publish to org-wide catalog, appear in Management Report as a certified flow owner, eligible for customer discount threshold (see §6).
- Reference elements (must carry "Reference architecture" badge): cross-tenant benchmark comparisons ("top 10% of enterprises"), since no cross-tenant data pooling exists yet.

## 3. Certification states (Live/Reference labeling, not gamification)

Every flow badge on the catalog and node map uses one of exactly three states, always visibly labeled:
- **Live — Verified**: ledger hash-chain confirms real runs (green check).
- **Live — Pending Review**: real runs exist, Red-Team/audit review not yet complete (amber).
- **Reference — Illustrative**: template or projection with no real run data yet (gray, dashed border, tooltip: "Reference architecture: not yet run in your tenant").

This directly extends the existing plan's "Label proof clearly: what runs vs. what's roadmap" rule to the growth/gamification layer.

## 4. Personas (sample data, all fictional, all labeled Reference unless real seeded rows exist)

| Name | Callsign | Role | Story beat |
|---|---|---|---|
| Bob | — | Operator, pilot originator | Level 1 → 5 across 2-week pilot; the canonical "Bob & Sally" flow made real. |
| Diane | — | Ops manager | Adopts Bob's flow, becomes second certified node at Level 5, appears in Management Report as department champion. |
| Hubert | — | Compliance/Auditor | Reviews and certifies flows, never appears in adoption-reach counts (auditors are excluded from growth metrics to avoid conflict of interest). |
| Puter | — | IT/Platform admin | Manages entitlements and role grants; visible in org graph as the tenant's root/trunk administrator node. |
| Kathy | "Wildfire" *(rename to "Kindler" — avoid fire/viral imagery)* → **"Beacon"** | Department lead | Second-hop adopter; demonstrates cross-team spread as healthy network growth, not "wildfire." |
| Sally | "Anchor" | Early adopter, meeting-notes flow | The original demo persona; Level 5, stable high-trust node. |
| Frank | "Relay" | Cross-department connector | Bridges two department clusters at Level 10, shown as the edge that turns two branches into one canopy. |
| Jessica | "Sentinel" | Executive sponsor | Views Management Report only; not a flow operator. |

Note: the existing plan file already used "wildfire adoption trail (Bob → Sally → Kathy → Diane → Frank)." Per the safety directive, rename this artifact **"Adoption Trail"** or **"Growth Ring"** in all UI copy — never "wildfire," "viral," or "spread like fire."

## 5. Quantifiable minutes-saved math (Live where flow_runs exist)

```
minutes_saved_per_run = baseline_manual_minutes − observed_flow_minutes
tenant_minutes_saved  = Σ minutes_saved_per_run  (over flow_runs, ledger-verified only)
dollarized_value      = tenant_minutes_saved / 60 × blended_hourly_rate
```
- `baseline_manual_minutes`: captured once per flow template from operator estimate at creation time, stored and shown as **Reference (operator-estimated)** until a measured baseline (A/B or historical average) exists — never presented as a hard fact.
- `observed_flow_minutes`: **Live**, timestamp delta between flow start and ledger-confirmed completion.
- `blended_hourly_rate`: **Reference (illustrative)** unless HR/finance data is integrated — default a visibly-labeled placeholder (e.g., $45/hr) with a tooltip disclosing it's a placeholder.
- Example (illustrative): Bob's flow — baseline 12 min (Reference estimate) − observed 1.5 min (Live) = **10.5 min saved/run**, ×140 runs/month (Live count) = 1,470 min ≈ 24.5 hrs/month ≈ **$1,102/month** (Reference, placeholder rate) for that one flow.

## 6. Feature entitlements by level

| Level | Create flows | Save to team catalog | Publish org-wide | Invite named colleagues | API/expert mode | CISO console visibility | Discount eligibility |
|---|---|---|---|---|---|---|---|
| 1 | ✅ personal only | ❌ | ❌ | ❌ | Read-only sanitized request view | none | none |
| 5 | ✅ | ✅ | ❌ | ✅ (named invite only, no open links) | Full API console | Team-level telemetry | Tier 1 (see below) |
| 10 | ✅ | ✅ | ✅ | ✅ + delegate certification review | Full + saved queries/OAS export | Tenant-wide posture view | Tier 2 |

## 7. Customer discount thresholds (Reference — commercial terms, illustrative until Sales signs off)

All figures below carry a **Reference (illustrative — pending Sales/Finance approval)** badge; none are Live-computed today.

| Threshold (ledger-verified, tenant-wide) | Discount |
|---|---|
| ≥3 certified Level-5 flows across ≥2 departments | 5% next-term discount |
| ≥500 cumulative ledger-verified minutes saved AND zero unresolved Red-Team findings | 10% discount + named Customer Success contact |
| ≥1 Level-10 "Canopy" tenant-wide certification | 15% discount + co-marketing case-study option (opt-in, reviewed by both parties) |

Discounts are computed from the same ledger data shown to the customer — no private/hidden scoring — so Sales cannot claim a discount the customer's own dashboard doesn't already show.

## 8. Management reporting (Live rollups, Reference projections clearly separated)

Executive/Management Report screen sections:
1. **Adoption Trail** (Live): org graph snapshot, count of Sprout/Rooted/Canopy nodes by department.
2. **Ledger-Verified ROI** (Live): tenant_minutes_saved, dollarized_value with rate-source tooltip.
3. **Certification Health** (Live): % flows Live-Verified vs Pending vs Reference, open Red-Team findings.
4. **Forecast** (Reference, dashed chart style): projected next-quarter savings — labeled "illustrative projection, not a commitment."
5. **Discount Standing** (Reference until Sales integration): current tier and distance to next threshold, same numbers customer sees.

## 9. Organizational graph effects

- Each certified operator = a node; each colleague they onboard = a directed edge, weighted by that flow's ledger-verified minutes saved (not by headcount, preventing gaming via mass-inviting).
- Department clusters render as translucent "branches"; a branch turns solid/certified only when ≥1 Level-5 node exists inside it — ties visual state to real certification, not popularity.
- Cross-department edges (e.g., Frank "Relay") are the only way to reach Level 10 tenant status — enforces genuine cross-silo value, not one department gaming its own metrics.
- Auditor nodes (Hubert) render distinctly (shield icon, non-glowing) and are excluded from all growth/adoption-reach math to prevent conflict of interest.
- Graph is tenant-scoped only (matches existing RLS isolation) — no cross-tenant graph, avoiding any implication of viral cross-company spread.

## 10. Explicit assumption flags requiring visible Reference labeling

- Baseline "manual minutes" figures (operator-estimated, not measured) — **Reference**.
- Blended hourly rate for dollarization — **Reference (placeholder)**.
- Cross-tenant/industry benchmark comparisons — **Reference (no data pool exists)**.
- Forecast/predicted savings trend lines before sufficient `flow_runs` history — **Reference**.
- Discount tiers and thresholds — **Reference (commercial, pending Sales/Finance sign-off)**.
- Everything else derived directly from `flow_runs`, `audit_ledger`, `telemetry_events`, `tenant_members` — **Live**.
