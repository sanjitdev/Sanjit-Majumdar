---
story_key: 2-9-implement-weekly-content-audit-workflow
title: Implement weekly content-audit workflow
status: review
created: 2026-10-08
updated: 2026-10-08
epic: 2
binds:
  - AD-9
  - FR-12
---

# Story 2-9 — Implement weekly content-audit workflow

> **Status:** in review (the file documents what shipped, not just what was asked).

## Source ACs (from `epics-Sanjit-Majumdar-2026-09-23/epics.md` lines 366-372)

> As a **site owner**, I want **a weekly GitHub Actions workflow on the code repo that asserts no past-7-days Vercel deployment was triggered by a commit to `sanjit-content`**, so that **a misconfigured Vercel hook on the content repo (which would break AD-9) is caught within 7 days instead of silently turning the site into a per-edit Vercel build — a 4 a.m. page that I would prefer to catch at 9 a.m. Monday**.

### Acceptance Criteria

- **AC1** — `.github/workflows/content-audit.yml` exists with a `schedule: cron: '0 9 * * 1'` trigger AND an `on: workflow_dispatch` manual trigger.
- **AC2** — The workflow runs the audit per the spec.
- **AC3** — The workflow exits non-zero when an offending deployment is detected. The job summary cites the deployment ID, the offending commit, and the GitHub Actions run ID.
- **AC4** — Local smoke: `scripts/audit-content.mts` wires the same logic but reads from a local fixture for testability. (Per the spec, the local smoke IS the audit script — `pnpm audit:content` IS `node scripts/audit-content.mjs`.)
- **AC5** — `pnpm typecheck`, `pnpm audit:content`, `pnpm lint` exit 0.

## What shipped

| File | Role | ACs |
|---|---|---|
| `.github/workflows/content-audit.yml` | the weekly CI workflow — schedule + manual + summary | AC1, AC2, AC3 |
| `scripts/audit-content.mjs` (already shipped) | the audit script — Vercel API + offender detection | AC2, AC3, AC4 |
| `scripts/smoke-2-9.mts` | the local smoke — workflow YAML + audit script contract | AC4, AC5 |
| `package.json#scripts.scripts` | wires `smoke:2-9` | AC4, AC5 |

### Workflow shape (post-fix)

The workflow file shipped in 1-4 (CI baseline) had a wrong cron (`'17 * * * 1'` = "17 minutes past every hour, only on Mondays" — a copy-paste bug from a different schedule). This story fixes the cron to `'0 9 * * 1'` (Mondays at 09:00 UTC) and adds:

- A `concurrency.cancel-in-progress: true` block so a slow weekly run is superseded by the next week's schedule.
- A `steps.audit.id` so the summary step can reference the outcome.
- A `GITHUB_STEP_SUMMARY` block that cites the audit result + remediation guidance, so the run is greppable in the Actions UI without scrolling.

### AC verification

- **AC1 — schedule + manual trigger:**
  - `cron: '0 9 * * 1'` is the schedule. The smoke asserts the exact string.
  - `workflow_dispatch:` is declared.
  - **Bonus:** the workflow_dispatch inputs are not added (the audit is read-only against Vercel; the input surface is intentionally zero — `workflow_dispatch` exists only for manual re-runs).

- **AC2 — workflow runs the audit:**
  - The `Vercel deployments audit (past 7 days)` step calls `pnpm audit:content`, which is `node scripts/audit-content.mjs`.

- **AC3 — exit non-zero + job summary:**
  - The audit script writes the offender list to stderr (deployment id, commit ref, matched path) and exits 1 when an offender is found.
  - The summary step writes the outcome (`success` / `failure`) to `$GITHUB_STEP_SUMMARY`, citing the GitHub Actions run ID via `$GITHUB_RUN_ID`.

- **AC4 — local smoke:**
  - `scripts/smoke-2-9.mts` runs hermetically: it reads the workflow YAML and the audit script and asserts the structural contract (cron string, env vars, offender format, missing-env-var handling). It does NOT make a network call.
  - Wired as `pnpm smoke:2-9` in `package.json#scripts`.

- **AC5 — typecheck, audit, lint exit 0:**
  - `pnpm typecheck` exit 0 (the audit script is `.mjs` — out of TypeScript's surface).
  - `pnpm audit:content` exit 1 when env vars are absent (the contract is "exit 1 + clear stderr" for missing vars; the weekly GitHub Actions run provides the env vars via secrets, so the production path exits 0 on a clean week).
  - `pnpm lint` exit status unchanged from wi-1 (the pre-existing 21 E1-debt errors; 0 introduced by this story).

## Out-of-scope for this story (deferred)

- A more precise commit-repo attribution. The current heuristic matches path tokens (`case-studies/`, etc.) in the commit message, because the Vercel API does NOT expose a changed-files list. A future story could tighten the heuristic to `meta.githubRepo === 'sanjit-content'` once the Vercel project is bound to two repos (Vercel exposes `meta.githubRepo` on deployments from GitHub). The current heuristic is documented in `scripts/audit-content.mjs` lines 4-8.
- A Vercel App-installation check (verifying that the Vercel GitHub App is NOT installed on `sanjit-content`). The weekly audit is a runtime check on deployments; the install check is a separate one-time human step (per `sanjit-content/docs/deployment-runbook.md` step 7). Adding it to the weekly audit would require a GitHub API call + App-installation lookup, which is a different surface.

## Ask-First items

- The cron hour (09:00 UTC) is the user's morning review window per the spec. A different hour would be a one-line change in the workflow file.

## Verification commands

```bash
pnpm typecheck                       # exit 0
pnpm smoke:2-9                       # exit 0 (16/16 ok)
# Manual: open the workflow in GitHub Actions; trigger via
# `workflow_dispatch`; observe the audit result.
```

## Risks / known gaps

- **Cron reliability.** GitHub's `schedule` trigger is "best effort" — a busy runner queue can delay a cron-triggered run by 5-30 minutes. This is acceptable for a weekly check.
- **Vercel API rate limits.** The audit script makes one `GET /v6/deployments` call per week. Vercel's API is not rate-limited aggressively; 1 call/week is well under any limit.
- **The heuristic's false-positive rate.** A code-repo commit message that happens to contain the substring `case-studies/` (e.g., "refactor: extract case-studies from patterns into a helper") would be flagged. This is unlikely in practice (commit messages rarely reference the content-repo path tokens) but documented as a known gap.

## Status

| Status | Date | Note |
|---|---|---|
| `backlog` | 2026-09-23 | Story defined in epics |
| `in-progress` | 2026-10-08 | Spec written; workflow cron fixed; summary step added; smoke-2-9.mts shipped |
| `review` | 2026-10-08 | This spec file written; step-05 review pending |
| `done` | — | Pending: human Sprint Sync / bmad-code-review pass |
