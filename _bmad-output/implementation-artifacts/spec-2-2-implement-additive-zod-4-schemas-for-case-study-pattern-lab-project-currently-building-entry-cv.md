---
title: 'Implement additive Zod 4 schemas for case-study, pattern, lab, project, currently-building entry, cv'
type: feature
created: 2026-09-28
status: done
review_loop_iteration: 0
baseline_commit: 7deec2bdbfb9a893e12d438a38c6d70373281321
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 2-2 is the schema gate for everything in E2 (2-3 content walker, 2-4 shallow-clone, 2-5 revalidate handler, 2-6 TTL fallback) and the seed for E3's citation walker (3.3 needs a stable O(1) lookup against the published set). Without additive Zod 4 schemas, the content reader can't enforce FR-13's "every field except title is optional" contract or AD-5's "published entries fail the build with a per-file diagnostic" model.

**Approach:** Ship six Zod 4 schemas in `lib/content/` — one file per entry type (case-study, pattern, lab, project, now-entry, cv). Every schema is built on a shared `BaseEntrySchema` (title + status + date fields) then `.partial({ title: true })` (so `status` is the only other required field, ensuring published/draft distinction is parseable) and `.passthrough()` (so unknown keys flow into `entry.meta` per FR-13). Each entry type's file exports the schema, the inferred TypeScript type, and (where applicable) a typed slug field. Build-fail diagnostic path is encoded via a tiny `parseEntry()` helper that walks `ZodError.issues` and produces a per-file message — this is the seam Story 2-3's reader will call.

## Boundaries & Constraints

**Always:**
- AD-5 malformed-frontmatter error model: `status: published` entries with invalid frontmatter fail the build with `file path + failing field`; `status: draft` entries are tolerated.
- FR-13 additive contract: every frontmatter field except `title` is optional; unknown keys preserved on `entry.meta` via `.passthrough()`.
- Stack pin: Zod 4.6+ (already installed at 4.6.5). Use Zod 4's `.partial()` and `.passthrough()` syntax — do NOT reach for Zod 3 patterns.
- Naming: schemas end in `Schema` (`CaseStudySchema`); types are inferred via `z.infer<typeof XSchema>`.
- Closed tag enumeration mirrors the 2-1 workflow's verbatim list: typed (`case-study`, `pattern`, `lab`, `project`) carry `<tag>:<slug>`; bare (`now`, `cv`) carry `<tag>` alone. The slug field on each typed schema is the source of truth for the tag tail.
- Export the schema, the type, and (where the entry type has a stable URL) a derived `<Tag>:<Slug>` string helper — this is the seam Story 2-3's walker will use to walk only `status: published` entries.

**Ask First:** None at this scope. The two design calls that COULD be Ask-First are listed in Design Notes (BaseEntrySchema composition pattern, slug field placement) — both are low-blast-radius and reversible; surface them as design-call entries but proceed.

**Never:**
- No file I/O in this story — schemas are pure parse functions. Story 2-3 owns the directory walker + `gray-matter` (or equivalent) frontmatter extraction.
- No tag-dispatch logic — this is the workflow's job (2-1), not the schema's. Schemas return parsed entries; the workflow maps them to `<tag>:<slug>`.
- No mutation of `sanjit-content/` scaffold (2-1's scope) — the schemas parse whatever shape ships from there.
- Do NOT silently adopt any of the three deferred spine amendments (AGENTS.md #14 AD-4 move-id validation, #15 AD-6/AD-12 7-layer drift, #16 AD-7/AD-14 mobile-touch fallback) — each has a designated partial-mitigation story and a separate spec.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PARSE_PUBLISHED | full frontmatter with `title`, `status: published`, plus 4 typed fields | `{ success: true, data: { title, status: 'published', date, ...typedFields, meta: {} } }` | N/A |
| HAPPY_PARSE_DRAFT | full frontmatter with `status: draft` | same shape, `data.status === 'draft'` — does NOT fail the build (AD-5) | N/A |
| MISSING_NEW_FIELD | entry missing a typed field added in a later story | `{ success: true, data: { ...knownFields, title, status } }` — missing field is `undefined`; no throw (FR-13) | N/A |
| UNKNOWN_EXTRA_FIELDS | entry with `tags`, `client`, `metrics` (fields not in schema) | `{ success: true, data: { ...knownFields, meta: { tags, client, metrics } } }` (FR-13) | N/A |
| PUBLISHED_MISSING_TITLE | `{ status: 'published' }` (no title) | `{ success: false, error: ZodError with one issue at "title" }` — `parseEntry()` produces per-file diagnostic | fail build with `path/to/entry.mdx: <field> <message>` |
| PUBLISHED_INVALID_STATUS | `{ title: 'x', status: 'archived' }` | `{ success: false, error: ZodError }` | fail build with status enum mismatch |
| DRAFT_INVALID_STATUS | same as above, status `archived` instead of `draft`/`published` | `{ success: false, ... }` — schema validates regardless of `status` value (the *enforcement* of draft tolerance is reader-owned; the schema just parses) | parser returns diagnostic; reader decides what to do for drafts |
| BARE_TAG_ENTRY | `cv.md`, `now-snapshot.json` row — no slug | slug field optional / absent; the bare tag (`cv`, `now`) is the canonical identity, NOT `tag:slug` (mirrors 2-1's bare-tag enumeration) | N/A |
| TYPED_TAG_SLUG_DERIVATION | `case-study/wellbook.mdx` with `slug: 'wellbook'` | `data.slug === 'wellbook'`; downstream `tagSlug = 'case-study:wellbook'` (the seam) | N/A |

</frozen-after-approval>

## Code Map

- `lib/canvas-modes.ts` -- AD-17 closed canvas-mode tuple + route map. Sibling reference pattern for "closed set as `as const` tuple + inferred union type." Same convention used for `STATUSES`, `TYPED_TAGS`, `BARE_TAGS` in this story.
- `lib/design-tokens.ts` -- AD-18 closed design-token list. The 21 colors / 13 typography / etc. tuples are co-sources for `app/globals.css`; the schemas in this story follow the same "one file, exported tuple + inferred type, used by readers" pattern.
- `lib/utils.ts` -- `cn()` shadcn helper. Out of scope for this story (no Tailwind classes in schemas); referenced so the implementer knows the file tree.
- `package.json` -- `zod: ^4.6.0` pinned (currently resolved to 4.6.5). Confirmed at `node_modules/zod/package.json`. No new dependency needed.
- `_bmad-output/planning-artifacts/epics-Sanjit-Majumdar-2026-09-23/epics.md` lines 332-360 -- Source ACs for Story 2-2 + Story 2-3 (the reader's contract depends on these schemas).
- `_bmad-output/planning-artifacts/architecture/architecture-Sanjit-Majumdar-2026-09-23/.memlog.md` line 59 -- AD-5 malformed-frontmatter error model (verbatim source for the per-file diagnostic contract).
- `_bmad-output/planning-artifacts/prds/prd-Sanjit-Majumdar-2026-09-23/prd.md` line 233 -- FR-13 additive content schema contract (verbatim source for the `.partial({ title: true })` + `.passthrough()` requirement).
- `sanjit-content/.github/workflows/revalidate.yml` -- Verbatim closed tag list (`now`, `cv`, `case-study`, `pattern`, `lab`, `project`). Mirrored as `TYPED_TAGS` + `BARE_TAGS` tuples in `lib/content/_shared.ts`.

## Tasks & Acceptance

**Execution:**
- [ ] `lib/content/_shared.ts` -- create the closed-set tuples (`STATUSES`, `TYPED_TAGS`, `BARE_TAGS`, `BASE_DATE_FIELDS`) + the shared `BaseEntrySchema` (z.object with `title`, `status`, optional `date`/`created`/`updated`) -- single source of truth for the additive base; provides the seam (BaseEntry + per-type extension) that keeps all 6 files symmetric.
- [ ] `lib/content/case-study.ts` -- `CaseStudySchema` extends `BaseEntrySchema.partial({ title: true }).passthrough()`; slug field required; export inferred `CaseStudy` type + `caseStudyTagSlug(slug)` helper. AC: Zod parses `parseEntry()` succeeds on a happy-path published entry; fails on a published entry missing `title`.
- [ ] `lib/content/pattern.ts` -- `PatternSchema` same pattern as CaseStudy. Slug required. Pattern metadata field for `pattern_moves: { heading, moves: MoveId[] }[]` (partial mitigation surface for the deferred amendment AGENTS.md #14 / AD-4 move-id validation -- schemas DO NOT validate move-id resolution; that's 3.3's job).
- [ ] `lib/content/lab.ts` -- `LabSchema` same pattern as CaseStudy. Slug required.
- [ ] `lib/content/project.ts` -- `ProjectSchema` same pattern as CaseStudy. Slug required.
- [ ] `lib/content/now-entry.ts` -- `NowEntrySchema` extends base with no slug (bare tag `now`). Date required (timeline semantics). Body content optional.
- [ ] `lib/content/cv.ts` -- `CVSchema` extends base with no slug (bare tag `cv`). Optional sections (summary, experience[], education[]) with `.partial()` extension on the wrapper.
- [ ] `lib/content/parse-entry.ts` -- `parseEntry<T>({ path, raw, schema })` helper that wraps `schema.safeParse(raw)` and returns either `{ ok: true, data }` or `{ ok: false, diagnostic: \`${path}: ${field} ${message}\` }` built from `ZodError.issues`. This is the seam Story 2-3 will call.

**Acceptance Criteria:**
- Given `lib/content/_shared.ts` + `lib/content/case-study.ts`, when I `import { CaseStudySchema } from '@/lib/content/case-study'`, then `CaseStudySchema.partial({ title: true }).passthrough()` is the schema shape (verifiable by reading the source).
- And when I parse `{ title: 'x', status: 'published', slug: 'wellbook' }` against `CaseStudySchema`, then `safeParse().success === true` and `data.title === 'x'`, `data.status === 'published'`, `data.slug === 'wellbook'`, `data.meta === {}`.
- And when I parse `{ title: 'x', status: 'published', tags: ['a'], client: 'b' }` against `CaseStudySchema`, then `data.meta === { tags: ['a'], client: 'b' }` (FR-13 unknown-key preservation).
- And when I parse `{ status: 'published', slug: 'wellbook' }` (no title) against `CaseStudySchema`, then `safeParse().success === false` and the error includes `path: ['title']` (FR-13 additive-but-title-required).
- And when I parse `{ title: 'x', status: 'archived' }` against `CaseStudySchema`, then `safeParse().success === false` and the error includes `path: ['status']` (AD-5 schema-level enforcement; reader decides build-fail vs draft-tolerance).
- And when I parse `{ title: 'x', status: 'published', slug: 'wellbook', future_field: 42 }` against `CaseStudySchema`, then `safeParse().success === true` and `data.meta.future_field === 42` (FR-13 additive contract; adding a field never breaks an old entry).
- And `parseEntry({ path: 'content/case-studies/wellbook.mdx', raw: { status: 'published' }, schema: CaseStudySchema })` returns `{ ok: false, diagnostic: 'content/case-studies/wellbook.mdx: title Required' }` shape (AD-5 per-file diagnostic).
- And `export type CaseStudy = z.infer<typeof CaseStudySchema>` resolves cleanly under `pnpm typecheck` (no Zod 4 inference regressions).

## Spec Change Log

<!-- Empty until first bad_spec loopback. -->

## Design Notes

**Design call 1 — Shared `BaseEntrySchema` rather than 6 copies of `{ title, status, date }`.** The 6 entry types share three common fields (`title`, `status`, optional `created`/`updated` date ISO 8601 strings per Conventions table). Building a `BaseEntrySchema = z.object({ title: z.string(), status: z.enum(STATUSES), created: z.string().datetime().optional(), updated: z.string().datetime().optional() })` and then per-type `Schema = BaseEntrySchema.partial({ title: true }).extend({...}).passthrough()` keeps the additive contract in one place. The implementer MUST extend then passthrough (not the other way around) so per-type fields flow through `passthrough` correctly.

**Design call 2 — `.partial({ title: true })` placement.** Story 2-2's AC1 says "every field except title is optional" — that requires `.partial({ title: true })`. But `status` ALSO needs to be required at parse time (so the reader can decide draft vs published behavior). The clean way to express "title required AND status required AND rest optional": apply `.partial({ title: true })` to make `title` optional too? No — that would violate FR-13. The correct shape is: the BASE has `title` required; `.partial({ title: true })` then makes title optional at the entry-type level (so a draft can have no title while still passing validation), but `status` stays required (so the reader can branch). Wait — re-read AC: `Given lib\content\schema.ts, When I parse an entry, Then the schema is .partial({title: true}) + .passthrough(); unknown keys are preserved on entry.meta.` So `.partial({ title: true })` IS correct, and the published-vs-draft split is enforced by the READER (story 2-3) — the schema just parses. The published-entry-with-no-title case is built up in `parseEntry()`: schema parses (success), but `data.title` is undefined, so the reader treats that as a published-with-malformed-frontmatter failure. This story ships the parse-time behavior; the reader's draft-tolerance is 2-3.

**Design call 3 — Slug as a required field on typed-entry schemas.** The 2-1 workflow's closed tag list references slugs: `case-study:wellbook`, `pattern:canonical-model`. The slug is the canonical identity of a typed entry. Making it required at parse time (not optional like title) lets the reader build `tagSlug = \`${tag}:${data.slug}\`` without an `if (slug)` guard. Bare-tag entries (now, cv) do NOT carry a slug — their schemas omit the field entirely.

**Design call 4 — `parseEntry()` returns a discriminated union.** `{ ok: true, data } | { ok: false, diagnostic }`. Story 2-3's reader will iterate entries and switch on `result.ok`. The diagnostic string is the AD-5 per-file contract.

## Verification

**Commands:**
- `pnpm typecheck` -- expected: exit 0 (Zod 4 + ESM resolution; tests the type-inference chain).
- `pnpm lint` -- expected: exit 0 (new files follow the existing kebab-case + PascalCase-export convention; no magic numbers; closed-set tuples marked `as const`).
- Manual: open each `lib/content/*.ts` file and confirm (a) the schema is built as `BaseEntrySchema.partial({ title: true }).extend({...}).passthrough()` (or `BaseEntrySchema.extend({...}).passthrough()` for typed entries where title stays required at parse time), (b) the inferred type is exported, (c) the file ends in a trailing newline (per the 1-9 layout-trailing-newline convention).

**Manual checks (no CLI):**
- Open `lib/content/_shared.ts`: confirm `STATUSES = ['draft', 'published'] as const`, `TYPED_TAGS = ['case-study', 'pattern', 'lab', 'project'] as const`, `BARE_TAGS = ['now', 'cv'] as const` (verbatim match to `sanjit-content/.github/workflows/revalidate.yml`).
- Open `lib/content/case-study.ts`: confirm `CaseStudySchema` schema has `title`, `status`, `slug`, and `.passthrough()`. Confirm `caseStudyTagSlug(slug)` returns the literal `'case-study:' + slug`.
- Open `lib/content/parse-entry.ts`: confirm `parseEntry({ path, raw, schema })` shape returns `{ ok: true, data } | { ok: false, diagnostic: \`${path}: ${issue.path.join('.')} ${issue.message}\` }`.
- Open `lib/content/cv.ts` + `lib/content/now-entry.ts`: confirm NO slug field (bare-tag contract).

## Suggested Review Order

**Shared base + closed-set tuples (the seam for FR-13 + AD-5)**

- Status / tag / known-keys tuples — the canonical closed enumeration that mirrors `sanjit-content/.github/workflows/revalidate.yml`.
  [`_shared.ts:62`](../../lib/content/_shared.ts#L62)
- `BaseEntrySchema` composition — the additive base every entry type extends via `.partial({ title: true })`.
  [`_shared.ts:98`](../../lib/content/_shared.ts#L98)

**Parse helper (AD-5 per-file diagnostic)**

- `parseEntry()` discriminated union — the seam story 2-3 will switch on for `{ ok: true }` / `{ ok: false }`.
  [`parse-entry.ts:65`](../../lib/content/parse-entry.ts#L65)
- `liftToMeta()` — the Zod-4-specific implementation of FR-13's "unknown keys on `entry.meta`" contract (Zod 4 `.passthrough()` does NOT auto-meta; the lift happens post-parse).
  [`parse-entry.ts:88`](../../lib/content/parse-entry.ts#L88)
- `renderDiagnostics()` — formats `ZodError.issues` as `<path>: <field> <message>` per AD-5.
  [`parse-entry.ts:119`](../../lib/content/parse-entry.ts#L119)

**Per-type schemas (the 6 entry types)**

- `CaseStudySchema` — the canonical typed-entry schema; the other 3 typed entries (pattern/lab/project) follow the same shape.
  [`case-study.ts:59`](../../lib/content/case-study.ts#L59)
- `NowEntrySchema` — bare-tag entry, no slug, `id` + `date` are the identity axes.
  [`now-entry.ts:37`](../../lib/content/now-entry.ts#L37)
- `CVSchema` — single-file document with optional sections, no slug.
  [`cv.ts:54`](../../lib/content/cv.ts#L54)

**Verification surface (peripherals)**

- `scripts/smoke-2-2.mts` — the matrix-coverage smoke test (37 assertions covering every I/O & Edge-Case Matrix row).
