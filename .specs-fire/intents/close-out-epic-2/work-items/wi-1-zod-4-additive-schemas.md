---
work_item_id: wi-1-zod-4-additive-schemas
intent: close-out-epic-2
story_ref: epic-2 / story-2-2
title: Additive Zod 4 schemas for all content types
status: pending
complexity: medium
mode: confirm
autonomy_bias_applied: balanced
depends_on: []
binds:
  ad: [AD-5]
  fr: [FR-13]
source_spec: _bmad-output/implementation-artifacts/spec-2-2-implement-additive-zod-4-schemas-for-case-study-pattern-lab-project-currently-building-entry-cv.md
current_state: review (sprint-status.yaml 2026-09-28)
created: 2026-10-08T18:30:00Z
---

# Work item — Additive Zod 4 schemas for all content types

## What ships

A Zod 4 schema per content type, sharing one base, with
`.partial({ title: true })` + `.passthrough()` semantics so adding
a field never breaks an old entry (AD-5, FR-13). Files land in
`lib/content/`.

- `lib/content/schema.ts` — shared base + per-type enumerations +
  the `entry.meta` passthrough convention.
- `lib/content/case-study.ts`, `pattern.ts`, `lab.ts`,
  `project.ts`, `currently-building.ts`, `cv.ts` — six
  type-specific schemas.
- `lib/content/index.ts` — barrel.
- `scripts/smoke-2-2.mts` — I/O and edge-case matrix smoke test.

## Acceptance criteria

1. `lib/content/schema.ts` exports a shared base with `title:
   string` required, every other field optional, and `.passthrough()`
   so unknown keys survive.
2. Each of the six content-type schema files exports a `*Schema`
   named export typed as `z.ZodType<EntryType>` with `.partial({ title: true })`
   and `.passthrough()` on the object layer.
3. `scripts/smoke-2-2.mts` exercises the spec's I/O & Edge-Case
   Matrix (`smoke:2-2` wired in `package.json`): parse happy paths
   for each type, parse-does-not-throw on missing optional fields,
   parse-does-not-throw on unknown passthrough keys (preserved on
   `entry.meta`), and parse-throws on missing `title`.
4. `pnpm typecheck` exits 0; `pnpm smoke:2-2` exits 0 with all
   matrix rows passing (37/37 per the 2026-09-28 sprint note).
5. Build fails (CI fails) on any `status: published` entry with
   malformed frontmatter after the reader is wired in WI-2.

## Verification

- `pnpm typecheck`
- `pnpm smoke:2-2`
- `pnpm lint`
- Cross-check with the spec's I/O matrix at
  `_bmad-output/implementation-artifacts/spec-2-2-…md`.

## Notes

- The work is already past step-05 (review) per sprint-status.yaml:
  8 files shipped in `lib/content/`, 37/37 smoke assertions pass,
  `pnpm typecheck` exit 0. The builder should **resume from
  step-06**, not re-derive. The remaining gate is the human
  Sprint Sync / bmad-code-review pass to flip to `done`.
- Public surface: the schemas are imported by WI-2 (reader),
  downstream content readers in E3, E5a.
