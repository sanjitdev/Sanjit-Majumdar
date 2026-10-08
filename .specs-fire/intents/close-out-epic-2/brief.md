---
intent_id: close-out-epic-2
title: Close out Epic 2 — content plumbing
status: in_progress
created: 2026-10-08T18:30:00Z
owner: sanjit
autonomy_bias: balanced
spine: _bmad-output/planning-artifacts/architecture/architecture-Sanjit-Majumdar-2026-09-23/ARCHITECTURE-SPINE.md
epics_source: _bmad-output/planning-artifacts/epics-Sanjit-Majumdar-2026-09-23/epics.md
sprint_status_source: _bmad-output/implementation-artifacts/sprint-status.yaml
context_doc_source: _bmad-output/implementation-artifacts/epic-2-context.md
---

# Intent: Close out Epic 2 — content plumbing

## Goal

Finish **Epic 2** (Content Schema, Two-Repo Read Path, and a Move-Tagged
Pattern Stub) so that Sanjit can edit any `status: published` content
file, push to `sanjit-content`, and see the change live on
`sanjit.dev` in under 30 seconds — without the code repo rebuilding.
This is the prerequisite for Epic 3 (patterns + case studies), which
cannot start until the canonical-model pattern stub is published
(story 2-7) and the additive Zod 4 schema + reader + revalidate
webhook are confirmed green in CI (stories 2-2, 2-3, 2-5).

## Users (per PRD §2.1)

- **Sanjit (sole author).** Edits MDX content in `sanjit-content`,
  expects the change to land live on the deployed site without
  touching the code repo or the Vercel dashboard.
- **Recruiter (UJ-1)** and **hiring manager (UJ-2)** benefit
  indirectly: E2 unblocks E3, which is where the 5 patterns and
  case studies — the spine of the credibility surface — ship.

## Problem (binding constraints)

The portfolio is "static-first with edge-rendered islands" (spine
paradigm). Content lives in a separate `sanjit-content` git repo
because the author wants git-versioned content with no CMS
dashboard. A `push` to `sanjit-content` must trigger a webhook that
calls `revalidateTag()` on the deployed site — **never** a code-repo
build (AD-1, AD-9, FR-12, FR-14). The build must fail on malformed
published frontmatter (AD-5, FR-13) and succeed on drafts. The
revalidation handler is an edge-runtime serverless function
(AD-3); the Puppeteer PDF route (which ships in E4) requires
`≥ 1769 MB` of memory on the Vercel plan (AD-7). Weekly CI must
detect any Vercel deployment that was wrongly triggered by a
content-repo commit (AD-9).

## Scope (in)

Finish all 9 stories in Epic 2 — the 5 already in `review` plus the
4 still in `backlog`:

| Story | Status today | Work item |
|---|---|---|
| 2-1 | backlog | Set up `sanjit-content` repo with content directory layout + GitHub Actions workflow listening to `push` / `delete` / `force-push`. |
| 2-2 | review | Additive Zod 4 schemas (case-study, pattern, lab, project, currently-building entry, cv) — already past step-05 with 8 files shipped in `lib/content/` + smoke test; needs the human Sprint Sync / bmad-code-review pass. |
| 2-3 | review | Content reader at `lib/content/reader.ts` walking only `status === 'published'`. |
| 2-4 | review | Next.js shallow-clone of `sanjit-content` at build time (`scripts/clone-content.mts` + `prebuild` / `predev` lifecycle hooks in `package.json`). |
| 2-5 | review | `POST /api/revalidate` edge handler with `revalidateTag(tag, 'max')` (Next 16 signature; two-arg form required). |
| 2-6 | backlog | Apply `revalidate: 300` (5-minute TTL) fallback on every ISR route. |
| 2-7 | backlog | Pre-publish a move-tagged pattern stub in `sanjit-content` at `/patterns/canonical-model` (hard prerequisite for E3's citation walker). |
| 2-8 | backlog | Audit Vercel plan tier for `POST /api/forward-pdf` memory budget (≥ 1769 MB). |
| 2-9 | backlog | Weekly content-audit workflow that fails if any Vercel deployment in the past 7 days was triggered by a content-repo commit. |

## Scope (out)

- Any E3, E4, E5a, E5b work (their own intents).
- Adding a new client component, shadcn primitive, serverless
  endpoint, KV namespace, canvas mode, design token, or breakpoint
  (all closed lists — requires a spine amendment, not this intent).
- The three deferred spine amendments (CF#1 / CF#2 / CF#3) — only
  their partial-mitigation stories (3.3, 5b.3, 4.4) are in scope,
  and only when Epic 2 closes.
- The 7 open E1 retrospective action items (CI hardening) — out
  until a separate "Future CI hardening" intent is captured.

## Success criteria (testable)

1. **All 9 E2 stories reach `done` in `sprint-status.yaml`.** Each
   of the 5 currently `review` stories completes the human Sprint
   Sync / bmad-code-review pass; each of the 4 currently `backlog`
   stories ships a new spec at
   `_bmad-output/implementation-artifacts/spec-2-N-…md`, runs
   through `bmad-build` step-01 → step-05, and lands `done`.
2. **Content edits reflect live in under 30 seconds of webhook
   delivery.** A `push` to `main` in `sanjit-content` for a
   `case-studies/wellbook.mdx` edit triggers the workflow → the
   workflow `POST`s `/api/revalidate?tag=case-study&slug=wellbook`
   with the correct `Authorization: Bearer <REVALIDATE_SECRET>`
   → the deployed route reflects the change within 5 seconds. No
   code-repo build runs.
3. **Webhook failure falls back to the 5-minute TTL.** Disabling
   the webhook delivery (integration test) results in the
   affected route regenerating within 5 minutes via the
   `revalidate: 300` fallback.
4. **Build fails on malformed published frontmatter.** A
   `status: published` entry with an invalid field fails the
   build with a per-file diagnostic citing the file path and
   the failing field via `ZodError.issues`. `status: draft`
   entries are tolerated.
5. **`pnpm typecheck` and `pnpm lint` exit 0.** `pnpm build` exits
   0. `pnpm smoke:2-2`, `smoke:2-3`, `smoke:2-4`, `smoke:2-5` all
   pass.
6. **`/api/revalidate` carries `export const runtime = 'edge'`.**
   The deferred-work entry for 2-5 flags a missing CI-side
   `audit-edge-runtimes.spec.mjs`; that CI assertion is out of
   scope here but the `runtime` export itself is in scope.
7. **Weekly content-audit workflow runs on schedule and fails on
   drift.** The `.github/workflows/content-audit.yml` workflow
   runs every Monday 09:00 UTC and exits non-zero if any Vercel
   deployment in the past 7 days was triggered by a
   `sanjit-content` commit.
8. **Canonical-model pattern stub is published in
   `sanjit-content/patterns/canonical-model.mdx` with `status:
   published` and a minimum of 3 named moves (M1..M3) using
   native `<h2 id="move-{N}">` heading IDs** (AD-4 binding).
   E3's citation walker (story 3.3) will deep-link to
   `/patterns/canonical-model#move-1` from the first case study.
9. **Vercel plan-tier audit report (story 2-8) is recorded in
   `.specs-fire/intents/close-out-epic-2/runs/<run-id>/plan.md`**
   (or the spec file for 2-8) confirming the Hobby plan can run
   the Puppeteer endpoint with `≥ 1769 MB`. If the audit reveals
   the Hobby plan is insufficient, the report flags the upgrade
   path before E4 starts.

## Constraints (binding from spine)

- **Single read path (AD-1).** Content lives in `sanjit-content`;
  the Next.js build shallow-clones it into `content/`; routes
  read from the clone. No runtime GitHub HTTP API call for
  content.
- **Closed serverless endpoint set (AD-3).** Three endpoints
  total — `GET /api/now` (edge), `POST /api/forward-pdf` (Node,
  E4), `POST /api/revalidate` (edge, this intent). Adding any
  endpoint requires a spine amendment.
- **No build on content edits (AD-9).** Content edits trigger
  only `revalidateTag()` via webhook — never a code-repo build.
  Enforced by separate workflows on the two repos, no Vercel
  hook on `sanjit-content`, and a weekly CI audit (story 2-9).
- **TTL fallback (FR-14).** Every ISR route carries
  `revalidate: 300` so a missed webhook still regenerates within
  5 minutes.
- **Build-fail contract (AD-5).** Malformed `status: published`
  frontmatter fails the build with a per-file diagnostic
  (`ZodError.issues`). Drafts are tolerated.
- **Closed tag enumeration (AD-1).** Bare tags `now`, `cv`;
  typed tags `<type>:<slug>` where `<type>` ∈
  {`case-study`, `pattern`, `lab`, `project`}. Adding a new tag
  type requires a spine amendment.
- **Next 16 signature (AGENTS.md pitfall #3).**
  `revalidateTag(tag, 'max')` only — single-arg form is
  deprecated.
- **Closed client-component set (AD-13).** No new client
  components in this intent. E2 is plumbing.
- **Vercel KV retired (AGENTS.md pitfall #1).** Story 2-1's
  GitHub Action uses whatever credentials are appropriate; the
  KV / Upstash migration is E5a's concern (story 5a-1).
- **Auto-mode is active.** The build agent may proceed
  autonomously on the E2 stories; the human-permission Sprint
  Sync / bmad-code-review pass happens after each story
  reaches `review` (this is the existing BMAD workflow gate,
  not a FIRE checkpoint).

## Sequencing

Per `sprint-status.yaml` project notes and the E2 epic context
(`epic-2-context.md`):

1. **Stories 2-2, 2-3, 2-4, 2-5** are already at step-05 review
   with code shipped and smoke tests passing. They need the
   human Sprint Sync / bmad-code-review pass to flip to `done`.
   This is the first 4 work items in the intent.
2. **Story 2-1** lands the `sanjit-content` repo + workflow
   (independent — the workflow POSTs to `/api/revalidate` which
   story 2-5 has shipped). Story 2-1 must run before 2-7 can be
   verified end-to-end.
3. **Story 2-7** publishes the canonical-model stub in
   `sanjit-content`. It is the **hard prerequisite for E3.3 +
   E3.4** (the citation walker requires a published
   `canonical-model` to deep-link to).
4. **Story 2-6** applies the `revalidate: 300` TTL on every ISR
   route. Independent of 2-7; can run in parallel.
5. **Story 2-8** is a research-only audit (Vercel plan tier).
   Independent; can run in parallel with 2-6 / 2-7.
6. **Story 2-9** ships the weekly content-audit workflow.
   Independent; can run last.

A practical run order (respecting dependencies): **2-2 → 2-3 →
2-4 → 2-5 → 2-1 → 2-6 → 2-7 → 2-8 → 2-9**. Stories 2-6, 2-7,
2-8, 2-9 can be batched into a single `batch`-scope run after
2-1 lands, per the workspace `run_scope_preference: batch`
default.

## Open questions

None at intent-capture time. The E2 context and sprint-status are
internally consistent. Story 2-8 may surface an open question
("does the Hobby plan support 1769 MB?") which will be resolved
inside the work item.

## Notes for the builder

- The 5 stories in `review` already have specs in
  `_bmad-output/implementation-artifacts/spec-2-N-…md`. The
  builder should resume from step-05 (the existing
  `review` state), not re-derive.
- The 4 stories in `backlog` need fresh specs written via
  `bmad-build` step-02. They are all small-to-medium surface
  area; none should require a design doc.
- The 2-1 workflow must `POST` to
  `/api/revalidate?tag=<tag>&slug=<slug>&sha=<sha>` with
  `Authorization: Bearer <REVALIDATE_SECRET>`. The handler
  (story 2-5) accepts this exact shape. The two stories were
  designed together — verify the wire shape matches before
  shipping.
- The 2-7 stub is small (one MDX file with frontmatter + 3
  named moves), but its acceptance criteria must validate the
  `M1..Mn` heading-ID contract per AD-4 because the citation
  walker in E3.3 will deep-link to it.
- The 2-9 weekly audit should grep the Vercel deployment log
  for the past 7 days, not query the GitHub Actions log — the
  concern is "did a code-repo build fire because of a content
  push", not "did the content webhook fire".
