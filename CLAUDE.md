# trustable-enterprise-spark - Claude Code entrypoint

@./AGENTS.md

`AGENTS.md` above is the canonical repo brief. It is imported, not duplicated - **edit `AGENTS.md`, never restate it here.**

<!-- BEGIN AGENT-RESPONSE-CONTRACT v1.1.0 -->
## Agent Response Contract v1.1.0 - binding, every response
Generated from `data/agent_response_contract.json` by `scripts/response_contract_sync.py`. Edit the JSON, re-run `--all`. Hand edits inside these markers are overwritten; anything outside them is never touched.
Long-form spec: `.cursor/rules/agent-response-contract.mdc`. Claude Code does not load `.cursor/rules/*`, which is why the contract is restated here as binding.

### The three anchors - every response, every tier
1. **Outcome line** - First line: bold one-sentence OUTCOME (what happened / what is true now), followed by status chips. Never open with process narration ('Let me check...', 'I will now...').
2. **Next** - ## ⏭️ Next - numbered one-click choices. Each is a single line the user can approve by number. Offer 2-4. Always include the do-nothing option when the work is complete.
3. **Stamp** - Last line, nothing after it. Format defined in .cursor/rules/response-stamp.mdc (EW-STAMP).

### Tier - pick the LOWEST that honestly fits (inflating is a violation)
| Tier | When | Cap |
|---|---|---|
| **T0 ANSWER** | A question, an explanation, a chat turn. No files changed, no work executed. | 20 lines |
| **T1 TASK** | A small, single-concern change. Roughly 1-3 files, no subagents, no orchestration. | 30 lines |
| **T2 BUILD** | A feature, a multi-file change, anything using subagents, anything that shipped. | 75 lines |
| **T3 PROGRAM** | Multi-repo, fleet-wide, orchestrated workflows, or a session wrap-up. | 110 lines |

### T2/T3 section order - omit any that is genuinely empty
- `## 🎯 The ask` (max 3) - Restate what you understood the user to want, in your own words.
- `## ✅ Plan` (max 8) - Checklist with a status chip and an OWNER on every line. Owner is 'me', a named subagent + model, or 'user'.
- `## 🤖 Roster` (max 8) - T3 only. Table of orchestrators/subagents: Agent | Model | Job | Status.
- `## 🔧 Changed` (max 10) - Table: Stack | What changed (human outcome, not filenames) | Where (clickable link).
- `## 🧪 Verified` (max 8) - Table: Check | Result | Evidence. Evidence is a number, an HTTP status, a command, or a link.
- `## 💡 Why it matters` (max 5) - Bullets. What this unlocks or prevents, who it helps, and the concrete speed/cost/effort delta where you can honestly estimate it.
- `## 👀 See it` (max 4) - The exact click path or URL. 'Settings → Connections → Gmail' or a localhost/production link.
- `## 🚧 Open` (max 6) - What is still running (who/what/ETA) and every issue hit, honestly, with root cause in one line.
- `## 📚 Docs` (max 5) - Inline links to every .md you wrote or should have written: implementation notes, research results, analysis, plans, diagrams, runbooks.
- `## 🌐 Public` (max 4) - What a real user/member can see or download NOW vs SOON, with the link.
- `## 🔭 Do better` (max 5) - Honest retrospective: what would have been faster, cheaper, or cleaner - about YOUR approach, not just the code.
- `## 📊 Ledger` (max 5) - ONE compact table or line set: sync/commit state, models used with rough % split, subagents spawned, spend when known, LOC.
**State explicitly, never omit silently:** `## 🚧 Open` -> "Nothing running, nothing blocked." · `## 🌐 Public` -> "Nothing user-visible in this change."

### Chips  🟢 done, verified, healthy, green · 🟡 partial, caution, needs attention, unverified · 🔴 blocked, broken, urgent, failed · 🔵 info, FYI, context · ⏳ running now · ◯ queued, not started · ❌ abandoned or rejected
### Stack tags - mandatory on every Changed row  `[BE]` backend / Python / services · `[FE]` frontend / React / UI · `[API]` route surface / endpoint contract · `[DB]` schema, migration, data · `[INFRA]` process, server, deploy, scheduler · `[DOCS]` documentation, rules, config · `[iOS]` mobile / Capacitor / TestFlight · `[AI]` model, prompt, agent behaviour

### Vertical economy - as binding as the sections
- Max 1 consecutive blank line(s). Blank line after a heading: no. Max 2 sentences per bullet, 8 lines per section. Prefer table > bullet list > paragraph.
- **Forbidden:** Chunky multi-sentence paragraphs · A heading followed by a blank line then one bullet · Restating the same fact in prose and then again in a table · Process narration ('Let me...', 'Now I will...') in a final response · Arrow-chain fragments used INSTEAD of a sentence (A -> B -> fails). Arrow SEQUENCE notation inside a spec table or a pipeline description is fine - the ban is on replacing prose with arrows. · Naming any file, tool, route, or concept without a link (see cite-with-links.mdc) · Naming any web page, app route, module page or deployed site by path or nickname alone (e.g. '/geo', 'the showcase'). Always write the FULL URL as a clickable link with the URL itself visible, e.g. [https://careercaptain.ai/geo](https://careercaptain.ai/geo). If it is not deployed, say so and give the local URL. · Emitting a section whose only content is 'N/A' or 'None' when the section is optional · Leaving or citing a doc only in a worktree, scratchpad, .claude/.cursor/.codex or temp folder. Every doc goes to <repo>/docs/<category>/ on main; cite the repo-relative path (docs/runbooks/X.md) · Passing any script, command, batch file, or user-facing fix to the user without FIRST testing and verifying it as an agent. If an agent creates or repairs a script, endpoint, or configuration, the agent MUST execute it, inspect the output, and prove live connectivity/state before passing it to the user. Never outsource verification testing to the human user..
- The user has nerve damage and scrolling costs real pain. Vertical economy is a feature.

### Pre-send self-check - run silently before every substantive response
1. Does line 1 state the OUTCOME, not what I am about to do?
2. Did I pick the LOWEST honest tier, or did I inflate?
3. Is every 'done' backed by evidence in the Verified table?
4. Did I execute and test this fix/script myself as an agent and prove it works before handing it off to the user?
5. Is every file, route and tool a clickable link?
6. Is every web page, app route or site written as its FULL URL, clickable, with the URL text visible (never a bare '/route')?
7. Did I state what is still running and what is blocked - or explicitly say 'nothing'?
8. Did I write the Do-better section, honestly, about my own approach?
9. Does the response end with numbered choices, then the stamp, and nothing after?
10. Did every doc I wrote land at <repo>/docs/<category>/ on main (not only a worktree, scratchpad or agent folder), cited by its repo-relative path?
11. Can I delete 20% of the lines without losing meaning? If yes, delete them.

### Subagent clause - paste into every subagent brief
> Your final report follows the Agent Response Contract: open with the bold outcome line, link every artifact, back every claim with evidence, state what is still running or blocked, and close with numbered next choices. No process narration.
<!-- END AGENT-RESPONSE-CONTRACT v1.1.0 -->
