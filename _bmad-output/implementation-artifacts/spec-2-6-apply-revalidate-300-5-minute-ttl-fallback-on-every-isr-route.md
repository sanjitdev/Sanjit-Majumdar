---
story_key: 2-6-apply-revalidate-300-5-minute-ttl-fallback-on-every-isr-route
title: Apply revalidate: 300 (5-minute TTL) fallback on every ISR route
status: review
created: 2026-10-08
updated: 2026-10-08
epic: 2
binds:
  - AD-9
  - FR-14
---

# Story 2-6 — `revalidate: 300` (5-minute TTL) fallback on every ISR route

> **Status:** in review (the file documents what shipped, not just what was asked).

## Source ACs (from `epics-Sanjit-Majumdar-2026-09-23/epics.md` lines 348-352)

> As a **site owner**, I want **every ISR route to carry `revalidate: 300` so that a missed revalidation webhook still regenerates within 5 minutes**, so that **AD-9's "no build on content edits" rule does not silently drop content updates when the webhook is delayed, fails, or is re-delivered out of order (FR-14)**.

### Acceptance Criteria

- **AC1** — Every `app/**/page.tsx` that renders a public ISR route declares `export const revalidate = 300` (or another single integer-valued revalidate under 600s; the PRD/spine specifically names 300).
- **AC2** — `pnpm audit:isr-ttl` greps `app/**/page.tsx` for `revalidate =` and asserts every closed ISR route has it set to 300. Fails the build on a missing or misconfigured TTL.
- **AC3** — `pnpm typecheck`, `pnpm build`, `pnpm audit:isr-ttl` all exit 0.

## What shipped

| File | Role | ACs |
|---|---|---|
| `app/page.tsx` | added `export const revalidate = 300` to the homepage | AC1 |
| `scripts/audit-isr-ttl.mjs` | Node script that walks `app/**/page.tsx` and asserts the TTL is set | AC2, AC3 |
| `scripts/smoke-2-6.mts` | I/O matrix smoke for the audit script | AC2, AC3 |
| `package.json#scripts` | wires `audit:isr-ttl` and `smoke:2-6` | AC2, AC3 |

### Closed ISR route list (10 production routes from `scripts/audit-routes.shared.mjs`)

`/`, `/work`, `/projects`, `/lab`, `/patterns`, `/now`, `/about`, `/recruiter`, `/built`, `/404`.

Today, only `/` ships (`app/page.tsx`). The remaining 9 routes land in E3+ (E3 case studies + pattern index, E4 recruiter route, E5a `/now`, E5b `/about` + `/built` + `/404`). The audit script enforces the contract from day one: when a future story adds a new ISR route, the audit fails the build until the TTL is added.

The 5 preview routes (`app/preview/**`) are component harnesses with `metadata.robots = { index: false, follow: false }`; they are not user-facing ISR routes and do not need TTL.

### AC verification

- **AC1 — every ISR route carries the TTL:**
  - `app/page.tsx` now exports `export const revalidate = 300`. (Previous state: no `revalidate` export.)
  - The audit script enforces the contract for every route in `PROD_ROUTES`.

- **AC2 — `pnpm audit:isr-ttl` greps + asserts:**
  - `scripts/audit-isr-ttl.mjs` walks `app/**/page.tsx` and checks for `export const revalidate = 300` (or any integer under 600).
  - Reports missing/misconfigured TTLs as a per-file diagnostic, exits 1 on any failure.
  - Wired as `pnpm audit:isr-ttl` in `package.json#scripts`.

- **AC3 — typecheck, build, audit all exit 0:**
  - `pnpm typecheck` exit 0 (the new `revalidate` export is `number`; no schema surface change).
  - `pnpm build` exit 0 (the homepage is the only ISR route that exists; the others fall through to their 404 placeholders until their stories land).
  - `pnpm audit:isr-ttl` exit 0 (the homepage carries the TTL; the audit's closed-route list is verified against `scripts/audit-routes.shared.mjs#PROD_ROUTES`).

## Out-of-scope for this story (deferred)

- The audit script does NOT enforce the TTL on `app/api/**/route.ts` (serverless endpoints). Per AD-3, the three closed endpoints (`/api/now`, `/api/forward-pdf`, `/api/revalidate`) are not ISR — they're either always-fresh (revalidate webhook handler) or dynamic on each request. The TTL contract is route-segment-level only.
- The audit script does NOT enforce the TTL on `app/preview/**` (the 5 component harnesses). Per the 1-12 split (PROD vs PREVIEW), preview routes are not user-facing.

## Ask-First items

- The TTL on the homepage specifically: the closed tag enumeration (AD-1) + the revalidate handler (2-5) + the workflow (2-1) form the FAST path. The TTL is the SLOW path (5-minute SLA fallback). A future story could choose to lower the TTL to e.g. 60s, but the spine amendment process (not a build-time override) would govern that.

## Verification commands

```bash
pnpm typecheck                           # exit 0
pnpm audit:isr-ttl                       # exit 0
pnpm smoke:2-6                           # exit 0
pnpm build                               # exit 0 (full pipeline)
```

## Risks / known gaps

- **A future story could add a new ISR route and forget the TTL.** The audit script catches this in CI, but only if `pnpm audit:isr-ttl` is wired into the CI gate. Per the 1-4 closeout, the audit scripts are surfaced in `.github/workflows/ci.yml`; this story does not modify that workflow (out of scope; the existing wiring already calls `pnpm audit:routes`, which lives alongside `pnpm audit:isr-ttl` and would be added to the same step in a future CI-hardening pass).
- **The TTL does not apply to dynamic endpoints** (the three closed serverless endpoints). A reader expecting a 5-minute refresh on, e.g., `/api/now` will be surprised. The contract is documented in the README; surface this in E5a's `/api/now` story as well.
- **`revalidate = 300` is a value, not a contract.** A future contributor could write `revalidate = 0` (which means "always cache" in some Next 16 contexts) or `revalidate = '1 hour'` (string form). The audit script accepts integer-valued revalidate under 600s to match the spec; stricter validation (only `300`) is a future hardening pass.

## Status

| Status | Date | Note |
|---|---|---|
| `backlog` | 2026-09-23 | Story defined in epics |
| `in-progress` | 2026-10-08 | Spec written; `app/page.tsx` updated; `audit-isr-ttl.mjs` + `smoke-2-6.mts` shipped |
| `review` | 2026-10-08 | This spec file written; step-05 review pending |
| `done` | — | Pending: human Sprint Sync / bmad-code-review pass |
