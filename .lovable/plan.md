# Trustable Graph Foundation, Contract Ledger, and Verification Program

## Goal
Turn Trustable’s graph into the primary enterprise workspace: simple enough for Bob and Sally, powerful enough for architects and security teams, with every requirement tracked to implementation, QA, red-team, and immutable audit evidence.

## Current verified baseline
- Flow and OASA Console load in authenticated desktop and mobile sessions.
- Flow and OASA now share a compact searchable multi-select facet tree with counts and an ellipsis trigger.
- Seven OASA Console entries are wired to existing authenticated server actions with real idle, loading, validation, success, denied, and error states.
- Three OASA endpoints remain explicitly labeled Reference architecture because no callable EngineWare contract is present.
- Homepage creation-loop typography and Architecture’s connected graph have been upgraded.
- Current roadmap files are persistent planning artifacts, not immutable ledger receipts. No claim will be made that chat instructions are already recorded immutably.

## 1. Contract completion ledger
- Create one canonical requirement register that captures each instruction as a numbered parent or child item, preserves its source timestamp, and groups duplicates without deleting the original wording.
- Track owner, priority, dependencies, scope, implementation state, Live/Reference classification, and blockers for each item.
- Require these completion gates before an item can be closed:
  1. implementation evidence,
  2. automated test evidence,
  3. browser evidence,
  4. accessibility result,
  5. red-team result,
  6. TypeSafe/JEV verification status,
  7. immutable audit receipt.
- Add an in-app ledger view with search, tree filters, drill-down evidence, status history, and report actions.
- Keep local roadmap state labeled Planning until a verified backend mutation contract can append an immutable receipt through the protected EngineWare boundary.
- Do not create a fake “overnight loop.” Use a resumable milestone queue with explicit run limits, checkpoints, blockers, and visible last-run state when a verified scheduler/worker contract exists.

## 2. Full graph-canvas workspace
- Replace the static architecture visualization with a reusable, full-canvas graph workspace modeled on the supplied CareerCaptain references.
- Use a three-pane layout:
  - left flyout: searchable node/component palette, templates, services, people, data, policies, and saved graphlets;
  - center canvas: pan, zoom, select, drag, connect, multi-select, snap, fit view, minimap, and keyboard movement;
  - right flyout: selected-node properties, permissions, parameters, weights, evidence, telemetry, and actions.
- Add compact top tabs for Graph, Accessible list, Controls, Simulation, Telemetry, and History.
- Add click-to-toggle overlays for security gates, bottlenecks, trust boundaries, harnesses, loops, latency, data classification, ownership, and Live/Reference status.
- Add visual callouts, edge labels, warnings, checks, animated request paths, grouped silos, and collapsible subgraphs.
- Add undo/redo history, save/save-as, duplicate, export, share, and reset-to-last-saved controls.
- Preserve an accessible synchronized list/table view for keyboard and screen-reader users.

## 3. Weighting and simulation
- Let users adjust node capacity, confidence, cost, risk, latency, and priority, plus edge throughput and dependency weight.
- Validate ranges before execution and show recommended defaults with a custom Other value where choices are presented.
- Run simulations only through a verified execution contract; never simulate success with timers or fabricated telemetry.
- Display before/after bottlenecks, failed gates, reroutes, resource pressure, expected impact, and a downloadable receipt.
- Mark client-only visual previews as Reference architecture until server execution and audit receipts are connected.

## 4. OASA Console completion
- Keep all seven verified Trustable server actions executable from the catalog.
- Add typed parameter editors, recommended presets, searchable enums, custom values, client validation, server validation, request cancellation where supported, and sanitized copyable calls.
- Persist exact terminal states: success, validation error, authorization denial, provider error, unavailable contract, and cancelled.
- Add request history, saved queries, response inspection, telemetry linkage, and ledger receipt drill-down only when their verified contracts are available.
- Never map the three unavailable OASA reference routes to invented endpoints.

## 5. Shared guided-field and filter framework
- Apply the reusable searchable facet tree to every true filter surface, including catalogues, audit filters, evidence, library, and assistant context.
- Standardize form wrappers with visible labels, useful placeholders, recommended values, searchable suggestions, custom Other entry, contextual tooltip, AI assist where safe, and Library insertion where relevant.
- Exclude passwords, credentials, tokens, and other sensitive fields from AI, clipboard, and suggestion features.
- Support keyboard traversal, focus return, screen-reader names/descriptions, 44px mobile targets, and no nested interactive elements.

## 6. Security, TypeSafe/JEV, and red-team verification
- Build a repeatable matrix for every Live capability: anonymous denial, wrong-role denial, tenant isolation, validation boundaries, mutation authorization, audit append, ledger verification, and export safety.
- Run the existing live red-team suite and add UI evidence links for each tested control.
- Record TypeSafe/JEV as Unverified until the callable EngineWare contract and machine-readable proof are available; never infer verification from prose or screenshots.
- Recheck the known broad permission-catalog policy and dependency advisories; resolve or explicitly accept each before production-ready status.
- Require all mutable graph actions to pass the protected enterprise execution boundary when backend support is added.

## 7. Regression and acceptance matrix
- Test Homepage, Architecture, Flow, OASA Console, ledger, and graph canvas at desktop and phone sizes in light and dark modes.
- Test search, tree selection, clearing, keyboard navigation, focus, tooltip visibility, flyouts, tabs, drag/drop, undo/redo, overlays, simulation validation, and node drill-downs.
- Exercise each real OASA server action with valid input and at least one validation/permission failure; verify the visible state and returned audit evidence.
- Check horizontal overflow, clipped text, overlapping controls, minimum target sizes, contrast, reduced motion, and synchronized graph/list content.
- Store test result, timestamp, environment, evidence reference, and unresolved blocker against the corresponding ledger item.

## Milestones
1. **Ledger foundation** — requirement taxonomy, completion gates, in-app register, honest immutable-receipt boundary.
2. **Canvas foundation** — full-screen panes, node palette, graph navigation, selection, editing, overlays, accessible list.
3. **Simulation controls** — weights, validation, visual outcomes, server contract handoff.
4. **Console completion** — all verified actions exercised with accurate states, history, and receipts.
5. **Enterprise form pass** — guided fields and tree filters across remaining forms.
6. **Battle test** — automated, browser, accessibility, RBAC, red-team, TypeSafe/JEV, and security review.
7. **Release evidence** — every completed requirement has proof and an immutable receipt; blocked items remain visibly open.

## Technical boundaries
- Frontend work stays in `src/components/` and `src/routes/`.
- Do not modify protected EngineWare bridge, authorization, security, contracts, generated integrations, or database files.
- Prefer the existing design system and installed components; add a proven graph library only after confirming Worker/browser compatibility.
- Keep EngineWare.ai / Christopher Ware ownership and confidential, no-redistribution notices visible on screens and exports.
- CareerCaptain screenshots are visual and interaction references. The MICDP2 module and EngineWare TypeSafe/JEV contracts remain unverified until accessible through an approved source or callable interface.

## External blockers
- Immutable requirement receipts and saved graph mutations need an approved protected-backend contract.
- EngineWare OASA negotiation, JEV/TypeSafe verification, CareerCaptain synchronization, MICDP2 module reuse, email, and Dropbox remain Reference architecture until their callable connections are verified.
- A persistent autonomous overnight worker cannot be represented as running unless an authenticated scheduler, bounded queue, lock, idempotent progress store, and circuit breaker are actually connected.