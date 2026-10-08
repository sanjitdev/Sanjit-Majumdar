---
work_item_id: wi-6-revalidate-300-ttl
intent: close-out-epic-2
story_ref: epic-2 / story-2-6
title: revalidate: 300 (5-minute TTL) fallback on every ISR route
status: pending
complexity: low
mode: autopilot
autonomy_bias_applied: balanced
depends_on: [wi-3-clone-sanjit-content-at-build-time]
binds:
  ad: [AD-9]
  fr: [FR-14]
source_spec: _bmad-output/implementation-artifacts/spec-2-6-apply-revalidate-300-5-minute-ttl-fallback-on-every-isr-route.md
current_state: backlog
created: 2026-10-08T18:30:00Z
---

# Work item — revalidate: 300 (5-minute TTL) fallback on every ISR route

## What ships

Every public ISR route in this repo declares
`export const revalidate = 300` (5 minutes TTL) as the fallback
for webhook delivery failure (FR-14, AD-9). The handler in WI-4
is the fast path; the TTL is the SLA guarantee.

A single audit-style script (`scripts/audit-isr-ttl.mjs`,
wired as `pnpm audit:isr-ttl`) verifies the TTL is set on the
closed route list. Fails the build on a missing or misconfigured
TTL.

## Acceptance criteria

1. Every `app/**/page.tsx` that renders a public ISR route declares
   `export const revalidate = 300`.
2. `pnpm audit:isr-ttl` (or equivalent) greps `app/**/page.tsx`
   for `revalidate =` and asserts every closed route has it set to
   `300` (or any single integer-valued revalidate under 600s; the
   PRD/spine specifically names 300).
3. `pnpm typecheck`, `pnpm build`, `pnpm audit:isr-ttl` all exit 0.

## Verification

- `pnpm typecheck`
- `pnpm build`
- `pnpm audit:isr-ttl` (when added by this story)

## Notes

- Currently backlog. Simple change; fresh spec via `bmad-build`
  step-02 is small.
- May run in batched scope with WI-7, WI-8, WI-9 after WI-5
  lands, per the workspace `run_scope_preference: batch`.
- The TTL belongs on **every ISR route**, not in the handler
  (per `epic-2-context.md` "Story 2-5 scope guard"). Story 2-6
  ships the page-config additions; the handler (WI-4) is
  delivery-only.
