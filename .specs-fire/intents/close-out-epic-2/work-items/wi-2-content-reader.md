---
work_item_id: wi-2-content-reader
intent: close-out-epic-2
story_ref: epic-2 / story-2-3
title: Content reader walking only status === 'published'
status: pending
complexity: medium
mode: confirm
autonomy_bias_applied: balanced
depends_on: [wi-1-zod-4-additive-schemas]
binds:
  ad: [AD-1, AD-5]
  fr: [FR-13]
source_spec: _bmad-output/implementation-artifacts/spec-2-3-implement-content-reader-libcontent-walking-only-status-published.md
current_state: review (sprint-status.yaml 2026-09-28)
created: 2026-10-08T18:30:00Z
---

# Work item — Content reader walking only status === 'published'

## What ships

A content reader at `lib/content/reader.ts` exporting
`readContent({ contentRoot }) => { published, drafts, diagnostics }`.
- Walks only `status: published` entries (AD-1).
- Tolerant of drafts (allowed to be malformed; never block the build).
- Build exits 1 on any `status: published` entry whose frontmatter
  fails `Zod.safeParse()` against its type-specific schema, with a
  per-file diagnostic carrying the file path and the failing
  field via `ZodError.issues` (AD-5).
- The diagnostics shape is canonical so scripts/clone-content.mts
  (WI-3) can surface failures at build time.

## Acceptance criteria

1. `lib/content/reader.ts` exports
   `readContent({ contentRoot: string }) => { published, drafts, diagnostics }`
   with the canonical shape documented in the spec.
2. The walker skips draft entries (excluded from the build output)
   and surfaces their parsed-or-unparsed metadata in `drafts`
   without failing the build.
3. A `status: published` entry with malformed frontmatter causes
   `readContent` to return a `diagnostics` entry referencing the
   file path and `ZodError.issues`, and the surrounding process
   exits non-zero when wired to `scripts/clone-content.mts`.
4. `lib/content/reader.ts` is the **single read path** for
   downstream content reads. AD-1 explicitly forbids routes from
   reading content via the GitHub HTTP API at runtime.
5. `scripts/smoke-2-3.mts` covers the I/O & Edge-Case Matrix for
   the reader: happy paths per type, draft tolerated, malformed
   published fails the build, missing file diagnostic, missing
   directory behavior.

## Verification

- `pnpm typecheck`
- `pnpm smoke:2-3`
- `pnpm lint`
- Build-level smoke: write a published stub with a
  known-bad field, run `readContent` via `tsx`, assert exit ≠ 0
  and a diagnostic citing the bad field.

## Notes

- The work is already at step-05 (review) per sprint-status.yaml.
  Resume from step-06.
- The reader is consumed by WI-3 (build-time clone), by E3's
  pattern index + case-study pages, and by E5a's `/now`
  snapshot reader.
