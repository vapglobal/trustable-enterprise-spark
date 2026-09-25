# Enterprise interaction and reporting pass

## Goal
Make every meaningful dashboard summary explorable, strengthen visual hierarchy, explain controls on hover, and provide one consistent report action menu throughout the signed-in workspace.

## What will change

### 1. Shared enterprise interaction layer
- Add reusable tooltip, drill-down dialog, clickable metric, and report-action components.
- Give interactive surfaces clear focus, hover, selected, and pressed states.
- Strengthen panels with restrained layered shadows and brighter emphasis while preserving the Heart-to-Vault design.

### 2. Click-through details
- Overview metrics, department bars, adoption entries, and recent runs open meaningful detail views or the relevant workspace.
- Posture metrics, severities, findings, owners, controls, freshness rows, and ledger status drill into filtered details or full records.
- Evidence, Flow, CISO, Red Team, Audit, Access, Library, and Settings rows/cards expose their available detail instead of remaining static.
- Detail views use existing authorized data only; no placeholder or simulated results.

### 3. Tooltips
- Add descriptive tooltips to icon buttons, badges, status indicators, metrics, abbreviated hashes, controls, and potentially destructive actions.
- Keep visible labels for primary actions; tooltips clarify purpose and consequence.

### 4. Global report actions
- Add a single actions menu to the signed-in workspace that exports the current report context as PDF, PowerPoint, text, CSV, JSON, Markdown, and Word.
- Include Copy and Download actions using the same normalized report data.
- Preserve the confidential notice in every generated format and clearly name each export.
- Keep the existing permission-checked audit export path intact; do not bypass server authorization.

### 5. Verification
- Validate the signed-in workspace on desktop and mobile, including drill-downs, tooltips, every export type, copy, and download.
- Confirm no overlaps, clipping, runtime errors, or build errors.

## Technical details
- Frontend and presentation files only; protected backend contracts remain unchanged.
- Use existing TanStack routes, authorized query results, Radix/shadcn primitives, and semantic design tokens.
- Add browser-compatible document generation packages only where necessary for valid PDF, PowerPoint, and Word files.
- Report menus receive page-specific structured data, while a workspace fallback exports the visible page text when no richer report source is registered.