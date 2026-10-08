---
work_item_id: wi-5-sanjit-content-repo-and-workflow
intent: close-out-epic-2
story_ref: epic-2 / story-2-1
title: sanjit-content repo with content directory layout + GitHub Actions workflow
status: pending
complexity: medium
mode: confirm
autonomy_bias_applied: balanced
depends_on: [wi-4-revalidate-handler]
binds:
  ad: [AD-1, AD-9]
  fr: [FR-12]
source_spec: _bmad-output/implementation-artifacts/spec-2-1-set-up-sanjit-content-repo-with-content-directory-layout-and-github-actions-workflow-listening-to-push-delete-force-push.md
current_state: backlog
created: 2026-10-08T18:30:00Z
---

# Work item — sanjit-content repo with content directory layout + GitHub Actions workflow

## What ships

A standalone `sanjit-content` repo (lives outside this monorepo)
with:
- `content/` directory layout per AD-1:
  - `case-studies/<slug>.mdx`
  - `patterns/<slug>.mdx`
  - `lab/<slug>.mdx`
  - `projects/<slug>.mdx`
  - `cv.md`
  - `now-snapshot.json` (placeholder; populated by E5a.3)
  - each with Zod-4-compatible frontmatter (per WI-1)
- `.github/workflows/revalidate.yml` listening to `push`, `delete`,
  and `force-push` events. On every push, the workflow computes the
  affected tag(s) and `POST`s
  `/api/revalidate?tag=<tag>&slug=<slug>&sha=<sha>` with
  `Authorization: Bearer ${{ secrets.REVALIDATE_SECRET }}`.
- A `README.md` documenting the contract for content authors.

## Acceptance criteria

1. The repo exists (separate from this code repo) with the
   directory layout enumerated above. Each subdirectory may be
   empty at this stage (content entries land in WI-7 / E3+).
2. `.github/workflows/revalidate.yml` triggers on `push`, `delete`,
   and `force-push` to `main`. The push payload includes the
   affected path(s); the workflow resolves the tag and slug:
   - `content/case-studies/*.mdx` → `tag=case-study&slug=<basename>`
   - `content/patterns/*.mdx` → `tag=pattern&slug=<basename>`
   - `content/lab/*.mdx` → `tag=lab&slug=<basename>`
   - `content/projects/*.mdx` → `tag=project&slug=<basename>`
   - `content/cv.md` → `tag=cv` (no slug)
   - `content/now-snapshot.json` → `tag=now` (no slug)
3. The workflow uses `actions/github-script` to POST the request
   with `Authorization: Bearer ${{ secrets.REVALIDATE_SECRET }}`
   to `${{ secrets.SITE_URL }}/api/revalidate` (defaulting to
   `https://sanjit.dev`).
4. The workflow per-path branch handles **force-push** events
   specifically (force-push may strip history but the workflow
   still revalidates the affected tag with the post-force-push
   `sha` in the URL).
5. The `README.md` documents the wire shape, the env vars
   (`REVALIDATE_SECRET`, `SITE_URL`), and the corresponding
   `pnpm` commands for local testing.
6. CI smoke (`scripts/smoke-2-1.mts` in this repo): a Node script
   that POSTs a fabricated `?tag=case-study&slug=foo` payload to
   a locally-spun-up `/api/revalidate` (mocked edge handler) and
   asserts the wire shape matches. Lives in this repo, not in
   the content repo.

## Verification

- `pnpm typecheck`
- `pnpm smoke:2-1`
- `pnpm lint`
- Manual end-to-end: a push to a test branch on `sanjit-content`
  triggers the workflow → the workflow POSTs to the deployed
  handler → the deployed site's affected route regenerates
  within 5 seconds.

## Notes

- Currently backlog. Requires fresh spec via `bmad-build` step-02.
- Per the dependency chain in `sprint-status.yaml` and
  `epic-2-context.md`: 2-5 must ship before 2-1 (the workflow
  needs a live endpoint to POST to). We respect that order here
  by listing WI-5 (2-5) before WI-5 (2-1).
- The repo itself is a separate Git repository. Files created
  here describe the contract; the actual repo is created
  elsewhere.
- Adding a new tag type to the workflow requires a spine
  amendment to AD-1 (closed tag enumeration).
