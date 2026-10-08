---
work_item_id: wi-7-canonical-model-pattern-stub
intent: close-out-epic-2
story_ref: epic-2 / story-2-7
title: Pre-publish canonical-model pattern stub in sanjit-content
status: pending
complexity: medium
mode: confirm
autonomy_bias_applied: balanced
depends_on: [wi-5-sanjit-content-repo-and-workflow]
binds:
  ad: [AD-4]
  fr: [FR-7, FR-8]
source_spec: _bmad-output/implementation-artifacts/spec-2-7-pre-publish-a-move-tagged-pattern-stub-in-sanjit-content-patternscanonical-model.md
current_state: backlog
created: 2026-10-08T18:30:00Z
---

# Work item — Pre-publish canonical-model pattern stub in sanjit-content

## What ships

`content/patterns/canonical-model.mdx` in `sanjit-content`,
`status: published`, with a minimum of 3 named moves using the
native `<h2 id="move-{N}">` heading-ID contract from AD-4:
- `move-1` — when this applies (setup)
- `move-2` — first named move
- `move-3` — second named move

Plus a counter-line block as `<h2 id="when-not">` per the
amended AD-4 heading-ID contract (kebab-case, not numbered).

This is the **hard prerequisite for E3.3 + E3.4** (the pattern
citation walker needs a real `canonical-model` publication to
deep-link to).

## Acceptance criteria

1. `sanjit-content/content/patterns/canonical-model.mdx` exists
   with frontmatter:
   ```yaml
   title: Canonical Model
   status: published
   slug: canonical-model
   one_line: "(spine sentence for the pattern index card)"
   ```
2. The MDX body renders at least 3 named moves. Each move heading
   carries the canonical binding ID:
   ```mdx
   ## When this applies
   <id="…">…</id>
   ## M1 — <name>
   {## M1 — `<id="move-1">` Name}
   ## M2 — <name>
   {## M2 — `<id="move-2">` Name}
   ## M3 — <name>
   {## M3 — `<id="move-3">` Name}
   ## When NOT to use it
   {## When NOT to use it `<id="when-not">`}
   ```
3. The build fails if the heading-ID contract is violated
   (i.e., a heading uses `M1` / `#m1` / `#M1` instead of the
   binding `move-1`). The check lives in the reader (WI-2's
   audit hook) — implemented by WI-7's spec when the pattern is
   published.
4. The end-to-end flow fires: a `git push` to `sanjit-content`
   triggers the workflow (from WI-5), which POSTs
   `/api/revalidate?tag=pattern&slug=canonical-model` to the
   deployed site. The deployed route (when E3 lands) reflects
   the change.

## Verification

- The stub file conforms to the pattern Zod schema (WI-1).
- `scripts/smoke-2-7.mts` (when wired) parses the stub and
  asserts the heading IDs `move-1`, `move-2`, `move-3`, and
  `when-not` exist on the rendered tree.
- End-to-end manual: push to `sanjit-content` → workflow → POST
  → log line in the deployed handler → 200 OK.

## Notes

- Currently backlog. Fresh spec via `bmad-build` step-02.
- The stub ships without the full canonical-model body copy
  (that lands in E3.1 alongside the other four patterns).
- The CF#1 partial mitigation (AD-4 `pattern_moves` overrides
  validated at build) does **not** apply here because E3.3 (the
  walker that consumes the override) is not yet shipped. The
  full CF#1 amendment is deferred.
