---
work_item_id: wi-9-weekly-content-audit-workflow
intent: close-out-epic-2
story_ref: epic-2 / story-2-9
title: Weekly content-audit workflow (fails on AD-9 drift)
status: pending
complexity: low
mode: autopilot
autonomy_bias_applied: balanced
depends_on: [wi-5-sanjit-content-repo-and-workflow]
binds:
  ad: [AD-9]
  fr: [FR-12]
source_spec: _bmad-output/implementation-artifacts/spec-2-9-implement-weekly-content-audit-workflow.md
current_state: backlog
created: 2026-10-08T18:30:00Z
---

# Work item — Weekly content-audit workflow (fails on AD-9 drift)

## What ships

A weekly GitHub Actions workflow
`.github/workflows/content-audit.yml` that:
- Runs every Monday at 09:00 UTC (`on: schedule: cron: '0 9 * * 1'`).
- Reads Vercel deployment history for the past 7 days (via the
  Vercel API or the GitHub deployment API when Vercel is the
  GitHub integration).
- Asserts **no** past-7-days Vercel deployment was triggered by a
  commit to `sanjit-content` (AD-9: content edits must trigger
  only `revalidateTag()` via webhook — never a code-repo build).
- Fails the workflow if the assertion is violated. Posts the
  offending commit + deployment URL to the workflow log.

## Acceptance criteria

1. `.github/workflows/content-audit.yml` exists with a
   `schedule: cron: '0 9 * * 1'` trigger and an `on: workflow_dispatch`
   manual trigger.
2. The workflow runs the audit per the spec.
3. The workflow exits non-zero when an offending deployment is
   detected. The job summary cites the deployment ID, the
   offending commit, and the GitHub Actions run ID.
4. Local smoke: `scripts/audit-content.mjs` (already in the
   repo per `package.json#scripts` — `pnpm audit:content`) wires
   the same logic but reads from a local fixture for testability.
5. `pnpm typecheck`, `pnpm audit:content`, `pnpm lint` exit 0.

## Verification

- `pnpm typecheck`
- `pnpm audit:content`
- `pnpm lint`
- Manual: open the workflow in GitHub Actions; trigger via
  `workflow_dispatch`; observe the audit result.

## Notes

- Currently backlog. Fresh spec via `bmad-build` step-02.
- `pnpm audit:content` already exists in `package.json`. This
  story binds the local script's logic to the CI workflow and
  asserts it runs on schedule.
- May run in batched scope with WI-6 and WI-8 after WI-5 lands.
