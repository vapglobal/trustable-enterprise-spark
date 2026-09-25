# LOVABLE ENTERPRISE BACKEND CONTRACT & SOVEREIGN BOUNDARY

> **CRITICAL ARCHITECTURAL DIRECTIVE FOR LOVABLE AGENTS**  
> **Tenant:** `tenant=enterprise`  
> **Authority:** EngineWare Sovereign Backend Gate  
> **Enforcement Mode:** AST-Bounded Deterministic TypeSafe Protocol  

---

## 1. ABSOLUTE TRUTH & ANTI-CORRUPTION RULES

1. **NO BACKEND OVERWRITING**:
   Lovable MUST NEVER modify, delete, rename, or overwrite backend security, database, or contract files:
   - `src/lib/trustableBridge.ts`
   - `src/lib/typesafe.ts`
   - `src/lib/authz.server.ts`
   - `src/lib/security.functions.ts`
   - `drizzle/`
   - `contracts/`
   - `AGENTS.md`
   - `.lovable/contract.md`

2. **NO SILENT MOCK FALLBACKS**:
   Under NO circumstances may Lovable introduce client-side mocks, fake setTimeout typing delays, or canned keyword matching when an API endpoint fails or is missing.
   If an endpoint is offline or unwired:
   - Throw a strongly-typed error.
   - Display unambiguous offline status in the UI.
   - Never pretend state was persisted when it was not.

3. **TYPE INTEGRITY IS MANDATORY**:
   All domain entities, API requests, and mutation payloads MUST be typed via TypeScript discriminated unions conforming to TypeSafe Jev System One primitives. Do not downgrade to `any` or strip zod/drizzle validations.

4. **COMMITS AUDITED BY ENGINEWARE LEDGER**:
   Every commit pushed by Lovable is audited by `scripts/lovable_ledger.py` into SQLite and synced to EngineWare Agent Memory. Corrupted schemas or unauthorized edits are automatically rolled back.

Property of EngineWare.ai. Intellectual Property of EngineWare.ai. Powered by EngineWare.ai. Owned by Christopher Ware.
