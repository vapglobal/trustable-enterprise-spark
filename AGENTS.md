# TRUSTABLE ENTERPRISE SPARK — AGENT PROTOCOL

<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## 🛡️ SOVEREIGN BACKEND GOVERNANCE (MANDATORY)

1. **Backend Contract Locking**:
   - Lovable agents work exclusively on Frontend UI, Layout, Component Styling, and User Experience in `src/components/` and `src/routes/`.
   - Backend files (`src/lib/trustableBridge.ts`, `src/lib/typesafe.ts`, `src/lib/authz.server.ts`, `src/lib/security.functions.ts`, `drizzle/`, `contracts/`, `.lovable/contract.md`) are PROTECTED BY CODEOWNERS. Do NOT touch or overwrite them.

2. **Zero Hallucination / Zero Mock Fallbacks**:
   - Never insert simulated delays (`setTimeout`), fake responses, or phantom toasts.
   - All mutations must pass through `verifyEnterpriseExecutionBoundary` in `src/lib/trustableBridge.ts`.

3. **Immutable Ledger Tracking**:
   - All interactions and commits are tracked by EngineWare Agent Memory.

Property of EngineWare.ai • Intellectual Property of EngineWare.ai • Powered by EngineWare.ai • Owned by Christopher Ware
