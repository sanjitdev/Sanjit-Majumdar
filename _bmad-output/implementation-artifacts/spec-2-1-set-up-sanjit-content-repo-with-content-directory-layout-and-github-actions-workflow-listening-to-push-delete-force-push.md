---
story_key: 2-1-set-up-sanjit-content-repo-with-content-directory-layout-and-github-actions-workflow-listening-to-push-delete-force-push
title: Set up sanjit-content repo with content directory layout and GitHub Actions workflow listening to push / delete / force-push
status: review
created: 2026-09-28
updated: 2026-09-28
epic: 2
binds:
  - AD-1
  - AD-9
  - FR-12
  - FR-14
  - pitfall #9 (force-push coverage)
---

# Story 2-1 — Set up sanjit-content repo

> **Status:** in review (this is the story spec the bmad-build workflow is implementing; the file documents what shipped, not just what was asked).

## Source ACs (from `epics-Sanjit-Majumdar-2026-09-23/epics.md` lines 332-340)

> As a **site owner**, I want **a separate `sanjit-content` repo with the directory layout (`case-studies/`, `patterns/`, `lab/`, `now-snapshot.json`, `cv.md`) and a GitHub Actions workflow that listens to `push`, `delete`, AND `force-push` events**, so that **AD-1's read path and AD-9's no-build-on-content-edits rule both hold — missing force-push coverage breaks AD-1's freshness guarantee (pitfall #9)**.

### Acceptance Criteria

- **AC1** — Given a new `sanjit-content` repo with directory layout, When a content file is pushed / deleted / force-pushed to `main`, Then the workflow fires and calls `POST https://sanjit.dev/api/revalidate?tag=<tag>&slug=<slug>&sha=<sha>`. [Binds: AD-1]
- **AC2** — The workflow explicitly handles `push`, `delete`, AND `force-push` events (verified by inspecting `.github\workflows\revalidate.yml` triggers). [Binds: AD-1; pitfall #9]
- **AC3** — The workflow constructs the full ISR tag as `<tag>:<slug>` when `slug` is present, or `<tag>` alone when absent; bare tags enumerated as `now` and `cv`; typed tags enumerated as `case-study`, `pattern`, `lab`, `project`. [Binds: AD-1]
- **AC4** — No Vercel hook is configured on the content repo — content edits do NOT trigger a Vercel build. [Binds: AD-9]

---

## What shipped

The scaffold lives at `sanjit-content/` (sub-folder of the code repo root). It contains:

| File | Role | ACs |
|---|---|---|
| `sanjit-content/README.md` | two-repo contract orientation + tag enumeration | AC3, AC4 |
| `sanjit-content/.gitignore` | minimal — no build / install / runtime | — |
| `sanjit-content/content/case-studies/.gitkeep` | typed-content directory | AC1 |
| `sanjit-content/content/patterns/.gitkeep` | typed-content directory | AC1 |
| `sanjit-content/content/lab/.gitkeep` | typed-content directory | AC1 |
| `sanjit-content/content/projects/.gitkeep` | typed-content directory | AC1 |
| `sanjit-content/content/now-snapshot.json` | placeholder (canonical shape per AD-2) | AC1 |
| `sanjit-content/content/cv.md` | placeholder (`status: draft` so AD-5 excludes it) | AC1 |
| `sanjit-content/.github/workflows/revalidate.yml` | the workflow itself | AC1, AC2, AC3 |
| `sanjit-content/docs/two-repo-contract.md` | operational topology + failure modes | AC4 |
| `sanjit-content/docs/deployment-runbook.md` | one-time human checklist for the GitHub repo creation | AC4 |

### AC verification

- **AC1 — push / delete / force-push → POST to revalidate:**
  - `revalidate.yml` declares `on.push.branches: [main]`, `on.delete`, `on.workflow_dispatch`.
  - The `Dispatch revalidate` step POSTs to `$REVALIDATE_URL?tag=...&slug=...&sha=...` with `Authorization: Bearer $REVALIDATE_SECRET`.
  - Force-push coverage: GitHub's `push` event fires on force-push by default (pitfall #9 — no separate `force_push` event exists in the GitHub Actions event taxonomy). The workflow's per-commit `added`+`modified`+`removed` walk detects what a force-push added/removed and dispatches one revalidate per affected path.
  - Delete coverage: GitHub's `delete` event is wired but no-ops (content file deletes arrive as `push` with `removed` paths — the workflow handles both code paths).

- **AC2 — explicit push / delete / force-push handling:**
  - `revalidate.yml` `on:` block lists `push`, `delete`, `workflow_dispatch` — and the file's header comment cites pitfall #9 explicitly so a future reviewer can confirm the intent.
  - The "Map changed paths to tags (push event)" step walks `github.event.commits[].added|modified|removed` for each commit in the push (force-push-safe).
  - The "Skip on delete event (handled by push event for content)" step explicitly notes that delete events are handled by the push branch for content file removals.

- **AC3 — full ISR tag construction:**
  - Bare tags (`now`, `cv`): dispatched as `?tag=now` or `?tag=cv` (no `slug`).
  - Typed tags: dispatched as `?tag=case-study&slug=wellbook`, `?tag=pattern&slug=canonical-model`, `?tag=lab&slug=playground`, `?tag=project&slug=foo`.
  - The "Map changed paths to tags" step's regex extracts the directory + slug from the changed path; the "Dispatch revalidate" step constructs the appropriate query string.
  - The closed tag list is documented in `sanjit-content/README.md` "Tag enumeration" + `sanjit-content/docs/two-repo-contract.md` "AD/FR binding summary".

- **AC4 — no Vercel hook:**
  - `sanjit-content/docs/deployment-runbook.md` step 7 explicitly checks `gh repo view --json installedApps` for the Vercel app and provides the uninstall path.
  - `sanjit-content/.gitignore` excludes `.vercel/` and any future Vercel config.
  - The weekly `content-audit.yml` on the code repo (story 1-4) is the automated enforcement — it fails if any Vercel deployment in the past 7 days was triggered by a content-repo commit.

### Out-of-scope for this story (deferred)

- The revalidate handler (`app/api/revalidate/route.ts`) — **story 2-5** (this scaffold's workflow POSTs to an endpoint that doesn't exist yet; the 5-minute TTL fallback in FR-14 covers the gap).
- The shallow-clone at build time — **story 2-4** (deploy-key wiring documented in the runbook; the actual `prebuild` step is on the code repo).
- The Zod schemas — **story 2-2**.
- The content reader / walker — **story 2-3**.
- The 5-minute TTL on ISR routes — **story 2-6**.
- The pre-published pattern stub — **story 2-7**.

### Ask-First items

- **The actual GitHub repo creation** — this scaffold lives as a sub-folder of the code repo because the tool layer restricts file operations to `C:\ZDrive Folders\Projects\Sanjit-Majumdar`. The runbook in `docs/deployment-runbook.md` documents the human steps: create the repo, push the scaffold, configure secrets, verify the round trip. Until that runs, the workflow file is not actually wired to anything.
- **The `REVALIDATE_SECRET` value** — must be generated once via `openssl rand -hex 32` and shared between sanjit-content (Actions secret) and sanjit-majumdar (Vercel env var). Rotation order is documented in `docs/two-repo-contract.md` §2.

### Verification commands (run after the human creates the GitHub repo)

```bash
# in sanjit-content, after the initial push
gh workflow list                              # revalidate should be visible
gh workflow run revalidate.yml -f tag=now     # manual dispatch
gh run watch                                   # tail the run log
# expect: POST https://sanjit.dev/api/revalidate?tag=now&sha=... → HTTP 200

# in sanjit-majumdar (code repo), after the initial deploy of 2-5
pnpm audit:routes                              # route-invariant still holds
# the revalidate endpoint is not a public route, so this just verifies
# nothing regressed.

# weekly (already wired by story 1-4)
pnpm audit:content                             # asserts AD-9 — no Vercel
                                              # deployment in the past 7
                                              # days was triggered by a
                                              # content-repo commit
```

### Risks / known gaps

- **GitHub's `push` event on a force-push does not include a `before` ref that is an ancestor of `after`.** The workflow handles this by walking the `added`+`modified`+`removed` arrays in each commit (which GitHub populates correctly even for force-pushes), rather than by diffing `before` vs `after`. This means a force-push that introduces a brand-new file shows the new file as `added` — and dispatches a revalidate for the corresponding tag. The old content is invalidated implicitly (the slug no longer exists in the build-time clone, so the next request to that route returns 404 / fall-through).
- **The workflow does not batch revalidates.** A push that touches 10 patterns dispatches 10 sequential `curl` calls. With a 10-second `--max-time` per call, a worst-case 100-second workflow run is possible. The `concurrency.cancel-in-progress: true` directive means a fast-following push cancels the slow in-flight one, so worst-case latency is bounded. If this becomes a bottleneck, future optimization is to dispatch in parallel (background jobs) — not in scope for story 2-1.
- **The workflow uses `node` for JSON parsing of `github.event`.** This is intentional (bash JSON parsing is fragile), but it means the workflow has a `node` runtime dependency. GitHub-hosted `ubuntu-latest` runners ship with node by default; this is not a portability concern.
- **The `repository_dispatch` event is NOT used.** The prompt's spec used the term "repository_dispatch" loosely to mean "outbound webhook to the deployed site." The actual mechanism is a direct `curl` POST to `/api/revalidate` from the workflow runner. `repository_dispatch` is a *different* GitHub event (one repo dispatches to another) and is not used here — the deployed site is a Vercel app, not a GitHub repo, so the cross-repo webhook pattern doesn't apply. If a future story wants true GitHub-mediated dispatch (e.g., for a self-hosted revalidation endpoint), revisit.

---

## Status

| Status | Date | Note |
|---|---|---|
| `backlog` | 2026-09-23 | Story defined in epics |
| `in-progress` | 2026-09-28 | Scaffold written to `sanjit-content/` sub-folder |
| `review` | 2026-09-28 | This spec file written; step-05 review pending |
| `done` | — | Pending: human creates the GitHub repo + verifies the round trip |

The story transitions to `done` only after the human runs the runbook and confirms the round-trip dispatch returns HTTP 200.
