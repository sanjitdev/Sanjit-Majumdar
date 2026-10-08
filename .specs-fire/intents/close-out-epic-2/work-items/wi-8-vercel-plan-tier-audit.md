---
work_item_id: wi-8-vercel-plan-tier-audit
intent: close-out-epic-2
story_ref: epic-2 / story-2-8
title: Vercel plan-tier audit for POST /api/forward-pdf memory budget (≥ 1769 MB)
status: pending
complexity: low
mode: autopilot
autonomy_bias_applied: balanced
depends_on: []
binds:
  ad: [AD-7]
  fr: []
source_spec: _bmad-output/implementation-artifacts/spec-2-8-audit-vercel-plan-tier-for-post-apiforward-pdf-memory-budget-1769-mb.md
current_state: backlog
created: 2026-10-08T18:30:00Z
---

# Work item — Vercel plan-tier audit for POST /api/forward-pdf memory budget (≥ 1769 MB)

## What ships

A research-only audit document recording whether the current Vercel
plan tier can run the `POST /api/forward-pdf` Puppeteer endpoint
with `≥ 1769 MB` of memory (AD-7). The endpoint ships in E4.3
but the audit must close **now** so E4 can plan its dependency.

## Acceptance criteria

1. The audit document exists at
   `docs/run-notes/vercel-plan-audit-2026-10-08.md` (or the spec's
   recorded location), with:
   - Current plan tier (Hobby / Pro / Enterprise).
   - Memory ceiling for Node.js serverless functions on that tier.
   - Whether `≥ 1769 MB` is achievable **without** an upgrade, or
     whether an upgrade is required.
   - The cost of any required upgrade (annual / monthly).
   - A go / no-go decision for E4.3 and the recommended next
     action if no-go.
2. The audit references Vercel's current docs (cited inline with
   retrieval dates) and any rate-limit / cold-start trade-offs
   noted in AD-7.
3. If the answer is Hobby-and-OK, the audit is the green light
   for E4 (no upgrade). If Hobby is insufficient, the audit
   surfaces the upgrade prompt for the user to confirm before
   E4.3 ships.

## Verification

- The audit document exists and is committed to the repo.
- The go / no-go decision is recorded explicitly in
  `_bmad-output/implementation-artifacts/spec-2-8-…md` notes.

## Notes

- Currently backlog. Fresh spec via `bmad-build` step-02.
- Research-only; no code change.
- May run in batched scope with WI-6 and WI-9 after WI-5 lands.
- If Hobby is insufficient, the user confirms the upgrade before
  E4 starts (treated as a separate intent: "Upgrade Vercel plan
  for E4 readiness").
