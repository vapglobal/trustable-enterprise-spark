# Trustable OASA Console Workbench

## Goal
Replace the current API Console with a dense, single-frame enterprise workbench adapted from the supplied EngineWare/MyCDB reference while preserving Trustable’s existing palette, typography, security boundaries, and protected configuration.

## Console experience
- Add a compact, collapsible Trustable workspace rail with detailed flyout groups and clear active-location states.
- Build a second endpoint explorer rail with search, grouped namespaces, status labels, and saved-query access.
- Add top-level and workspace sub-tabs for Console, Activity, Specification & Auth, Documentation, Graph, and About views.
- Keep the main request builder, response/telemetry area, and right code inspector visible together in one bounded desktop frame; use drawers on smaller screens.
- Place the existing Trustable AI assistant as the upper-right Magic Bar entry point, retaining its real account-synced behavior.
- Use the existing Trustable near-black, cyan, heart, warning, and success tokens; adapt EngineWare structure without copying its branding.

## Guided forms
- Give every console control a useful placeholder, pre-populated recommended value, selectable presets, and contextual tooltip.
- Add autocomplete/search for endpoints, environments, parameters, and saved queries.
- Include custom “Other” entry wherever a fixed selection is offered.
- Keep field AI assist and Library insertion where text composition is useful.

## API truth and verification
- Reclassify the four displayed `/v1/...` REST paths because direct checks currently return 404.
- Distinguish verified live Trustable server actions from OASA Reference architecture endpoints in every catalog, badge, inspector, and export.
- Add a visible verification panel that reports the last checked status without simulating successful calls.
- Do not create fake telemetry, fake delays, or pretend calls succeeded.

## Technical boundaries
- Change presentation files only under `src/routes/` and `src/components/`.
- Do not edit protected EngineWare bridge, TypeSafe, authorization, security, database, contract, or generated integration files.
- Reuse installed Radix/shadcn primitives for tabs, tooltips, menus, sheets, searchable commands, and resizable panels.
- Preserve the existing EngineWare.ai / Christopher Ware confidentiality and ownership markings.

## Verification
- Confirm the app builds cleanly.
- Test the signed-in console end to end when an authenticated preview session is available.
- Check desktop and mobile layouts for clipping, overlap, drawer behavior, navigation, tooltips, and Magic Bar access.
- Record real endpoint results and keep unavailable OASA interfaces explicitly marked Reference architecture.
