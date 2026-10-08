---
story_key: 2-7-pre-publish-a-move-tagged-pattern-stub-in-sanjit-content-patternscanonical-model
title: Pre-publish a move-tagged pattern stub in sanjit-content/patterns/canonical-model
status: review
created: 2026-10-08
updated: 2026-10-08
epic: 2
binds:
  - AD-4
  - FR-7
  - FR-8
---

# Story 2-7 — Pre-publish a move-tagged pattern stub in `sanjit-content/patterns/canonical-model`

> **Status:** in review (the file documents what shipped, not just what was asked).

## Source ACs (from `epics-Sanjit-Majumdar-2026-09-23/epics.md` lines 354-358)

> As a **site owner**, I want **a real, published `canonical-model` pattern in `sanjit-content` with the move-1..move-N + when-not heading-ID contract from AD-4**, so that **E3's citation walker has a published target to deep-link to on day one of E3.3 — without that target, the walker's first call site would 404 in production and the citation surface would be silently broken**.

### Acceptance Criteria

- **AC1** — `sanjit-content/content/patterns/canonical-model.mdx` exists with frontmatter: `title: Canonical Model`, `status: published`, `slug: canonical-model`, `one_line: <spine sentence>`.
- **AC2** — The MDX body renders at least 3 named moves. Each move heading carries the binding ID `{#move-N}`. The counter-line block is `{#when-not}`.
- **AC3** — The build fails if the heading-ID contract is violated (audit hook in 3.3).
- **AC4** — The end-to-end flow fires: a `git push` to `sanjit-content` triggers the workflow (from 2-1), which POSTs `/api/revalidate?tag=pattern&slug=canonical-model` to the deployed site. The deployed route (when E3 lands) reflects the change.

## What shipped

| File | Role | ACs |
|---|---|---|
| `sanjit-content/content/patterns/canonical-model.mdx` | the stub — 3 moves + counter-line, AD-4 binding IDs | AC1, AC2, AC4 |
| `scripts/smoke-2-7.mts` | I/O matrix smoke for the stub | AC1, AC2 |

### Stub structure

| Heading | Binding ID | Purpose |
|---|---|---|
| `## When this applies` | (no binding id — slugger-generated) | Setup block |
| `## M1 — Name the entities` | `{#move-1}` | First named move |
| `## M2 — Define the boundary` | `{#move-2}` | Second named move |
| `## M3 — Lock the closed sets` | `{#move-3}` | Third named move |
| `## When NOT to use it` | `{#when-not}` | Counter-line block (AD-4 kebab-case) |

The `one_line` is the spine sentence: *"Name the system you're building before you build it — and the rest of the engineering gets cheaper."* This sentence surfaces on the `/patterns` index card (when E3.2 lands) and on the homepage's `<ProofVectorCluster>` (if a proof vector references this pattern).

### AC verification

- **AC1 — file exists with required frontmatter:**
  - `sanjit-content/content/patterns/canonical-model.mdx` ships with the four required frontmatter keys.
  - `parsePatternEntry` accepts the parsed frontmatter (verified by `smoke:2-7`).

- **AC2 — 3 named moves with binding IDs:**
  - The MDX body carries `## M1 — Name the entities {#move-1}` etc. `rehype-slug` (the MDX layer's default) renders these as `<h2 id="move-1">` etc. — the AD-4 binding form.
  - The counter-line block is `## When NOT to use it {#when-not}` (kebab-case, not numbered — per AD-4 amendment).

- **AC3 — build fails on a violation:** the audit hook is story 3.3's partial mitigation of AGENTS.md pitfall #14 (deferred AD-4 move-id amendment). NOT shipped here. The stub itself conforms; the audit is a 3.3 concern. The `one_line` in frontmatter gives the 3.1 publisher a single, auditable field to verify.

- **AC4 — end-to-end flow fires:** the workflow at `sanjit-content/.github/workflows/revalidate.yml` (story 2-1) already maps `content/patterns/<slug>.mdx` to `?tag=pattern&slug=<slug>`. When E3 lands `/patterns/[slug]/page.tsx`, a push to `sanjit-content` will trigger `revalidateTag('pattern:canonical-model', 'max')` and the new content will surface within 5 seconds.

## Out-of-scope for this story (deferred)

- The full canonical-model body copy — **story 3.1** ships the remaining 4 patterns + the long-form copy for `canonical-model`. The stub here is the minimum-viable publication that satisfies the AD-4 contract.
- The build-fail audit hook for `move-{N}` / `when-not` — **story 3.3** (citation walker partial mitigation of deferred amendment AGENTS.md #14).
- The `/patterns/canonical-model` route — **story 3.1** ships the pattern-page template + this content populates it.
- The homepage `<ProofVectorCluster>` reference — **story 1-8 / 1-11** already ships the cluster; a reference to this pattern would land in a future proof-vector story (out of E2 scope).

## Ask-First items

- The `one_line` sentence is a Sanjit-authored spine line for the pattern. Future 3.1 copy may rewrite it; the audit hook (3.3) does not bind on `one_line` content, only on the frontmatter shape.
- The move naming (`Name the entities` / `Define the boundary` / `Lock the closed sets`) is the stub's authoring. E3.1 will rewrite the move bodies; the move count and binding IDs are the contract.

## Verification commands

```bash
npx tsx scripts/smoke-2-7.mts        # 18/18 ok (file exists + frontmatter + heading IDs)
pnpm typecheck                        # exit 0
SKIP_CLONE=1 npx tsx scripts/clone-content.mts   # reader walks the stub; emits `published_count: 1`
```

## Risks / known gaps

- **The stub is intentionally short.** E3.1 will ship the long-form body. Until then, a future contributor landing on `/patterns/canonical-model` will see a stub. This is acceptable because the route doesn't exist yet (it lands in 3.1).
- **Markdown `## Heading {#id}` vs HTML `<h2 id="id">` form.** The stub uses the Markdown form; `rehype-slug` produces the HTML form. If a future contributor removes `rehype-slug` from the MDX pipeline, the AD-4 binding IDs will silently break. The 3.3 audit hook will catch this when it ships.
- **`one_line` field is novel to the spine.** The `Pattern` schema (story 2-2) accepts `one_line` via the additive contract (`.passthrough()`); the field was not in the original closed list. E3.1 should either promote `one_line` to the closed set (spine amendment) or remove the `{#when-not}` ID's relationship to it.

## Status

| Status | Date | Note |
|---|---|---|
| `backlog` | 2026-09-23 | Story defined in epics |
| `in-progress` | 2026-10-08 | Spec written; stub shipped; `smoke-2-7.mts` shipped |
| `review` | 2026-10-08 | This spec file written; step-05 review pending |
| `done` | — | Pending: human Sprint Sync / bmad-code-review pass |
