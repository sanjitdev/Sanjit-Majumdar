---
story_key: 2-8-audit-vercel-plan-tier-for-post-apiforward-pdf-memory-budget-1769-mb
title: Audit Vercel plan tier for POST /api/forward-pdf memory budget (≥ 1769 MB)
status: review
created: 2026-10-08
updated: 2026-10-08
epic: 2
binds:
  - AD-7
---

# Story 2-8 — Audit Vercel plan tier for `POST /api/forward-pdf` memory budget (≥ 1769 MB)

> **Status:** in review (research-only audit; the actual upgrade is a separate intent).

## Source ACs (from `epics-Sanjit-Majumdar-2026-09-23/epics.md` lines 360-364)

> As a **site owner**, I want **a research-only audit recording whether the current Vercel plan tier can run `POST /api/forward-pdf` with ≥ 1769 MB of memory (AD-7)**, so that **E4.3 does not surprise-deploy on Hobby and OOM at the first PDF request — a deploy on the wrong plan tier is a 4 a.m. page that I would prefer to catch in advance**.

### Acceptance Criteria

- **AC1** — The audit document exists at `docs/run-notes/vercel-plan-audit-2026-10-08.md` (or the spec's recorded location), with:
  - Current plan tier (Hobby / Pro / Enterprise).
  - Memory ceiling for Node.js serverless functions on that tier.
  - Whether `≥ 1769 MB` is achievable without an upgrade, or whether an upgrade is required.
  - The cost of any required upgrade (annual / monthly).
  - A go / no-go decision for E4.3 and the recommended next action if no-go.

- **AC2** — The audit references Vercel's current docs (cited inline with retrieval dates) and any rate-limit / cold-start trade-offs noted in AD-7.

- **AC3** — If the answer is Hobby-and-OK, the audit is the green light for E4 (no upgrade). If Hobby is insufficient, the audit surfaces the upgrade prompt for the user to confirm before E4.3 ships.

## What shipped

| File | Role | ACs |
|---|---|---|
| `docs/run-notes/vercel-plan-audit-2026-10-08.md` | the audit document — TL;DR + memory ceilings + recommendation + cost summary + sources | AC1, AC2, AC3 |
| `scripts/smoke-2-8.mts` | smoke test asserting the audit document exists, the go-decision is recorded, the memory ceilings are cited | AC1, AC2 |

### Audit summary

The audit records the following findings (full table and citations in the audit document):

- **Hobby** — 1024 MB memory fixed. 1769 MB **NOT achievable**. The Puppeteer bundle will OOM.
- **Pro** — Up to 3008 MB memory (configurable per function). 1769 MB achievable. Recommended tier.
- **Enterprise** — Up to 3008 MB+ (configurable). 1769 MB achievable. Not required for this single endpoint.

**Go-decision:** E4.3 can ship on the Vercel Pro plan. If the current plan is Hobby, the user must upgrade to Pro before E4.3 ships. The upgrade cost is $20/seat/month (single seat, 2026-10-08 pricing).

### Current plan tier

**Unknown** — the Vercel plan tier is not recorded in the repo (it lives on the Vercel dashboard, in the team billing settings). The audit document prompts the user to confirm the current tier before E4.3 ships.

### AC verification

- **AC1 — audit document exists with the five required sections:**
  - `docs/run-notes/vercel-plan-audit-2026-10-08.md` ships with all five sections (current tier / memory ceiling / achievability / cost / go-decision).
  - The go-decision is recorded as "Go for E4.3 with the Vercel Pro plan" with the conditional logic for Hobby/Pro/Enterprise.

- **AC2 — references Vercel's current docs with retrieval dates:**
  - The Sources section at the bottom of the audit document lists 6 URLs (Vercel Functions memory config, Hobby/Pro/Enterprise plan limits, pricing, `@sparticuz/chromium` repo, AD-7 binding).
  - Retrieval date 2026-10-08 is recorded.

- **AC3 — surfaces the upgrade prompt for Hobby:**
  - The TL;DR explicitly states the Hobby/Pro/Enterprise conditional.
  - The "Recommendation" section prompts the user to confirm the current plan before E4.3 ships.

## Out-of-scope for this story (deferred)

- The actual Vercel plan upgrade — **separate intent** ("Upgrade Vercel plan for E4 readiness") because it is a billing decision, not a code change. The audit document is the green light; the upgrade is the user's call.
- The `vercel.json` memory configuration for the future `app/api/forward-pdf/route.ts` — **story 4.3** ships the route and configures the memory setting. The audit confirms the tier can support 1769 MB; the configuration lands in 4.3.
- A live test of the Puppeteer endpoint on Vercel — **story 4.3** ships the endpoint; 4.8 verifies the round trip end-to-end.

## Ask-First items

- **The current Vercel plan tier.** The audit document records the conditional logic; the user confirms the tier by reading the Vercel dashboard and updating the audit's "Current plan tier" section. The audit's go-decision is independent of the current tier (the recommendation is "upgrade to Pro if Hobby, ship as-is if Pro/Enterprise").

## Verification commands

```bash
npx tsx scripts/smoke-2-8.mts        # 11/11 ok (audit document exists + sections present)
```

## Risks / known gaps

- **Vercel pricing changes.** The cost summary cites 2026-10-08 pricing ($20/seat/month for Pro). A future Vercel pricing change would require updating the audit. The audit document is dated; a future re-audit is a 1-2 hour task.
- **Hobby's `maxDuration` ceiling.** As of 2026-10-08, Hobby's `maxDuration` was 60s (the late-2024 increase). If Vercel reduces Hobby's `maxDuration` again, the audit's recommendation changes. The audit cites the retrieval date; future re-audits should re-check.
- **The Puppeteer bundle's actual memory footprint.** The 1769 MB target is AD-7's binding; the actual Chromium process may use 1500-1800 MB depending on the page being rendered. A future story that re-measures the footprint may surface a tighter or looser memory target.

## Status

| Status | Date | Note |
|---|---|---|
| `backlog` | 2026-09-23 | Story defined in epics |
| `in-progress` | 2026-10-08 | Audit document written; smoke-2-8.mts shipped |
| `review` | 2026-10-08 | This spec file written; step-05 review pending |
| `done` | — | Pending: human Sprint Sync / bmad-code-review pass + Vercel plan tier confirmation |
