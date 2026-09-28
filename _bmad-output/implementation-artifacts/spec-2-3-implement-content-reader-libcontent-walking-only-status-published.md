---
title: 'Implement content reader (`lib/content/*.ts`) walking only `status: published`'
type: feature
created: 2026-09-28
status: done
review_loop_iteration: 0
baseline_commit: 02d05c8
context: [spec-2-2-implement-additive-zod-4-schemas-for-case-study-pattern-lab-project-currently-building-entry-cv]
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 2-3 is the consumer of story 2-2's Zod schemas. Without it, no downstream story (2-4 shallow-clone wiring, 2-5 revalidate handler, 2-6 TTL fallback, 3.3 citation walker, 5a.4 `/now` page) has a way to enumerate the published content set. The reader also encodes the AD-5 build-fail contract: any `status === 'published'` entry with malformed frontmatter fails the build with a per-file diagnostic — drafts are tolerated and excluded from the published set.

**Approach:** Ship a pure-function `readContent(options)` in `lib/content/reader.ts` that walks a local `content/` directory tree (case-studies, patterns, lab, projects, plus `now-snapshot.json` + `cv.md` at the root), parses frontmatter via a tiny in-house YAML-ish parser (no `gray-matter` dependency — kept in-house to honor AGENTS.md pitfall #10's "raw `@next/mdx` + Zod" guidance without adding a transitive dep), dispatches each file to the correct 2-2 `parseEntry()` variant based on its location, validates against the Zod schema, filters to `status === 'published'`, and returns a typed `{ published, drafts, diagnostics, cv, nowSnapshot }` result. The reader is **pure** — no Next.js import, no GitHub HTTP API, no logging. Story 2-4 owns the shallow-clone wiring; the reader is called from there.

## Boundaries & Constraints

**Always:**
- AD-1 read path: the reader walks a LOCAL directory (the build-time shallow-clone from story 2-4). No runtime GitHub HTTP API calls.
- AD-5 build-fail on malformed published frontmatter: any `status: published` entry failing `safeParse()` (or with `data.title === undefined`) is aggregated into `diagnostics[]` with `renderDiagnostics()`-shaped strings. The caller decides whether to fail the build.
- FR-13 additive contract: schemas preserve `entry.meta` via `parseEntry()`; the reader doesn't strip or rewrite meta.
- Stack pin: Node 20.9+, no new deps. The frontmatter parser is in-house (~30 lines, no regex backtracking risks).
- Pure function: no I/O outside the `options.contentRoot` parameter; no global state; no `console.log` (the caller decides log format).
- The published-set is exposed as a discriminated union type so the citation walker (story 3.3) gets an O(1) lookup surface (`byTagSlug` map).
- File extensions: `.mdx` and `.md` are both treated as frontmatter-bearing markdown. No other extensions are walked.
- Slug derivation: path-to-slug is `<basename without .mdx|.md>` for one-deep paths; for multi-deep paths the slug is the LAST segment. `case-studies/wellbook.mdx` → slug `wellbook`; `case-studies/group/wellbook.mdx` → slug `wellbook`. Matches the 2-1 workflow regex from `sanjit-content/.github/workflows/revalidate.yml`.
- The reader returns a discriminated `Entry` union (`CaseStudy | Pattern | Lab | Project | NowEntry`) tagged with `tag` + `slug` so downstream consumers can switch without an `instanceof` check.

**Ask First:** None at this scope. Two design calls surfaced below as Design Notes (in-house frontmatter parser vs `gray-matter`; single-file vs split walkers). Both are reversible.

**Never:**
- No file I/O outside `options.contentRoot` (no reading `.git/`, no reading `sanjit-content/.github/`).
- No mutation of the input directory.
- No global state, no `process.env`, no `fs.globSync` (Node 20 doesn't have it; use `fs.readdirSync(..., { recursive: true })`).
- No GitHub HTTP API calls (AD-1).
- Do NOT silently adopt deferred spine amendments AGENTS.md #14 (AD-4 move-id validation), #15 (AD-6 + AD-12 7-layer drift), #16 (AD-7 + AD-14 mobile-touch fallback). The reader does NOT validate `pattern_moves` overrides — that's story 3.3's partial mitigation territory.
- No logging, no `console.log`/warn/error in the reader — it's a pure function.
- No throw for malformed published frontmatter — fail-soft via `diagnostics[]` array; the caller decides to throw or `process.exit(1)`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_READ_PUBLISHED_SET | `content/case-studies/wellbook.mdx` with full frontmatter `status: published` | `published` array contains `{ tag: 'case-study', slug: 'wellbook', path: 'case-studies/wellbook.mdx', data: <CaseStudy> }` | N/A |
| HAPPY_READ_DRAFT | `content/case-studies/draft.mdx` with `status: draft` | entry appears in `drafts[]`, NOT in `published[]`; no diagnostic emitted | N/A |
| HAPPY_READ_NOW_SNAPSHOT | `content/now-snapshot.json` with `{ entries: [], last_updated: null }` (placeholder) | `nowSnapshot: { entries: [], last_updated: null }` passes through; last_updated mismatch is checked (see SNAPSHOT_MISMATCH) | N/A |
| HAPPY_READ_CV | `content/cv.md` with full frontmatter `status: published` | `cv: { path: 'cv.md', data: <CV>, body: '<markdown>' }`; `published` does NOT include the CV (CV is bare-tag, separate surface) | N/A |
| PUBLISHED_MALFORMED_FRONIT | `content/case-studies/bad.mdx` with `status: published` but missing `slug` | `diagnostics[]` contains `'content/case-studies/bad.mdx: slug Required'`-shape string; build caller fails the build; the entry is NOT in `published[]` | caller exits non-zero |
| PUBLISHED_MISSING_TITLE | `content/case-studies/notitle.mdx` with `status: published` and no `title` | `diagnostics[]` contains `'content/case-studies/notitle.mdx: title Required'` | caller exits non-zero |
| MULTI_DEEP_PATH | `content/case-studies/group/wellbook.mdx` | slug is `wellbook` (last segment); tag is `case-study`; same published-set semantics | N/A |
| UNKNOWN_DIRECTORY | `content/random/file.mdx` | entry is skipped with a debug-shape entry in `diagnostics[]` (or silently dropped — pick one and document); NOT in `published[]` | depends on policy (see Design Notes) |
| NO_FRONITTER | `content/case-studies/nofront.mdx` (raw markdown, no `---` block) | treated as draft with empty data; `drafts[]` contains it; no diagnostic (no published status claim) | N/A |
| SNAPSHOT_LAST_UPDATED_MISMATCH | `content/now-snapshot.json` with `entries: [{ id: 'n1', updated: '2026-09-28T00:00:00Z' }]` but `last_updated: '2026-09-27T00:00:00Z'` | `diagnostics[]` contains `'content/now-snapshot.json: last_updated does not match max(entries[].updated)'` | caller exits non-zero |
| SNAPSHOT_EMPTY_PLACEHOLDER | `content/now-snapshot.json` with `entries: [], last_updated: null` | passes through; no diagnostic (placeholder is valid until first commit by 5a-3) | N/A |
| SNAPSHOT_BAD_JSON | `content/now-snapshot.json` with malformed JSON | `diagnostics[]` contains `'content/now-snapshot.json: invalid JSON'` | caller exits non-zero |
| NOW_SNAPSHOT_ENTRY_PARSE_FAIL | entry `{ id, date, status: 'published' }` with missing `id` | `diagnostics[]` contains per-entry diagnostic; that entry NOT in `published[]` | caller exits non-zero |
| CV_PARSE_FAIL | `content/cv.md` with `status: published` and `experience: 'not-an-array'` | `diagnostics[]` contains `'content/cv.md: experience Expected array, received string'`; `cv` field is `null` | caller exits non-zero |
| EMPTY_CONTENT_ROOT | `options.contentRoot` does not exist | `diagnostics[]` contains `'content root not found: <path>'`; returns empty arrays | caller exits non-zero |
| PARTIAL_CONTENT_ROOT | only `case-studies/` exists, no `patterns/` etc. | reader walks what exists; missing typed directories = empty arrays; no diagnostic | N/A |
| NON_MD_FILE_IN_DIR | `content/case-studies/wellbook.mdx` (the only valid ext) + `content/case-studies/.DS_Store` | non-`.mdx`/`.md` files are silently skipped | N/A |

## Code Map

- `lib/content/_shared.ts` — STATUSES + TYPED_TAGS + BARE_TAGS + BaseEntrySchema + BASE_KNOWN_KEYS. Source of truth for the closed tag enumeration.
- `lib/content/parse-entry.ts` — `parseEntry()` discriminated union + `renderDiagnostics()` + `liftToMeta()`. Story 2-3 calls `parseEntry()` per-file and `renderDiagnostics()` to format aggregated diagnostics.
- `lib/content/case-study.ts` — `CaseStudySchema` + `CaseStudyKnownKeys` + `caseStudyTagSlug(slug)`. The reader calls `parseEntry({ path, raw, schema: CaseStudySchema, knownKeys: CaseStudyKnownKeys })`.
- `lib/content/pattern.ts` — same shape as case-study.
- `lib/content/lab.ts` — same shape.
- `lib/content/project.ts` — same shape.
- `lib/content/now-entry.ts` — `NowEntrySchema` + `NowEntryKnownKeys` + `NOW_TAG`. Used to validate each `entries[]` row.
- `lib/content/cv.ts` — `CVSchema` + `CVKnownKeys` + `CV_TAG`. Used for `cv.md` frontmatter validation.
- `sanjit-content/content/` — local fixture (currently empty for typed entries; `now-snapshot.json` + `cv.md` placeholders ship with the scaffold). The reader walks this directory.
- `_bmad-output/planning-artifacts/epics-Sanjit-Majumdar-2026-09-23/epics.md` lines 352-360 — Source ACs for Story 2.3.
- `_bmad-output/planning-artifacts/architecture/architecture-Sanjit-Majumdar-2026-09-23/.memlog.md` line 59 — AD-5 malformed-frontmatter error model.
- `_bmad-output/planning-artifacts/prds/prd-Sanjit-Majumdar-2026-09-23/prd.md` line 233 — FR-13 additive content schema contract.
- AGENTS.md pitfall #10 — `gray-matter` / Velite / raw `@next/mdx` choice. The reader goes in-house (no new dep).
- AGENTS.md pitfall #14 (deferred amendment) — AD-4 move-id validation NOT adopted here; partial mitigation lives in story 3.3.
- `scripts/smoke-2-2.mts` — sibling verification pattern (37-assertion smoke); story 2-3 ships `scripts/smoke-2-3.mts` mirroring the structure.

## Tasks & Acceptance

**Execution:**
- [ ] `lib/content/reader.ts` — `readContent(options)` pure function. Walks `options.contentRoot` (or `sanjit-content/content/` default). Returns `{ published: PublishedEntry[], drafts: DraftedEntry[], diagnostics: string[], cv: CVResult | null, nowSnapshot: NowSnapshot | null }`. The reader aggregates diagnostics but does NOT throw — the caller (2-4 shallow-clone wiring) decides to exit non-zero.
- [ ] `lib/content/reader.ts` — frontmatter parser (no `gray-matter` dep). Parses `---\n<yaml>\n---\n<body>` shape into `{ frontmatter: unknown, body: string }`. Handles missing/delimited frontmatter gracefully (returns `{ frontmatter: {}, body: raw }`). Trims trailing newline from body.
- [ ] `lib/content/reader.ts` — directory walker. For each typed-tag directory (`case-studies/`, `patterns/`, `lab/`, `projects/`), recursively find `.mdx` + `.md` files, dispatch to the matching schema's `parseEntry()`, and tag the result with `{ tag, slug, data }`. Excludes entries whose `data.status !== 'published'` from `published[]` (puts them in `drafts[]` instead).
- [ ] `lib/content/reader.ts` — `now-snapshot.json` reader. Parses the file as JSON, validates the outer shape (`{ entries: [], last_updated: null }` or matching), validates each entry via `parseNowEntry()`, and asserts `last_updated === max(entries[].updated)` (or `null` when entries are empty).
- [ ] `lib/content/reader.ts` — `cv.md` reader. Parses frontmatter via `parseCV()`, returns `{ path, data, body }` or `null` if missing. No `published[]` inclusion (bare-tag surface).
- [ ] `lib/content/reader.ts` — exports the discriminated `PublishedEntry` type with `tag: TypedTag | 'now'`, `slug?: string` (omitted for bare-tag entries), and `path: string`. Also exports `DraftedEntry`, `CVResult`, `NowSnapshot`, `ReadContentOptions`, `ReadContentResult`.
- [ ] `lib/content/index.ts` — re-export the reader public API (the barrel ships the reader's types + `readContent`).
- [ ] `scripts/smoke-2-3.mts` — verification harness. Builds a temporary fixture directory under `os.tmpdir()` (so it doesn't pollute the repo), writes 4 published + 2 draft entries + 1 malformed published + a valid CV + a valid snapshot, calls `readContent()`, and asserts every row of the I/O matrix. Exits 0 on all-pass; exits 1 with diagnostics on any failure.

**Acceptance Criteria:**
- **Given** a content directory with `case-studies/wellbook.mdx` (status: published, slug: wellbook), **When** `readContent({ contentRoot: <path> })` runs, **Then** `published` contains one entry `{ tag: 'case-study', slug: 'wellbook', path: 'case-studies/wellbook.mdx', data: { title, status: 'published', slug, meta: {} } }` and `diagnostics` is empty. [Binds: AC1, AC2 (epics.md lines 357-358), AD-5]
- **And** `case-studies/draft.mdx` (status: draft) is in `drafts[]`, NOT in `published[]`, and `diagnostics` is still empty (draft tolerance per AD-5). [Binds: AC1]
- **And** `case-studies/bad.mdx` (status: published, no slug) produces `'case-studies/bad.mdx: slug Required'` in `diagnostics[]` and is NOT in `published[]`. [Binds: AC1, AD-5]
- **And** the published-set is exposed as a constant so a citation walker can do a fast O(1) slug lookup (i.e., `result.publishedSet.byTagSlug.get('case-study:wellbook')` returns the entry). [Binds: epics.md line 358, AD-4]
- **And** the reader never calls the GitHub HTTP API; it reads only from the local filesystem. [Binds: AD-1]
- **And** the now-snapshot validation asserts `last_updated === max(entries[].updated)` (or both `null`/empty), failing with a per-file diagnostic on mismatch. [Binds: AD-2 amendment, snapshot ownership]
- **And** the CV is parsed as `{ path, data, body }` (NOT included in `published[]`) — bare-tag surface. [Binds: 2-1 bare-tag enumeration]
- **And** unknown directories at the content root (e.g., `content/random/`) are silently skipped (no diagnostic, no published entry). [Binds: forward-compatibility]
- **And** missing content root fails with `'content root not found: <path>'` in `diagnostics[]` and the result has empty arrays. [Binds: error contract]
- **And** `pnpm typecheck` and `pnpm lint` exit 0 after the reader ships; `scripts/smoke-2-3.mts` exits 0 on the fixture above.

## Spec Change Log

<!-- Empty until first bad_spec loopback. -->

## Design Notes

**Design call 1 — In-house frontmatter parser vs `gray-matter` dep.** AGENTS.md pitfall #10 lists `gray-matter` or `Velite` as the pair for `@next/mdx`. Adding `gray-matter` is a new transitive dep for a tiny (~30-line) frontmatter parser; adding `Velite` is a bigger lift (content-layer framework) that story 2-4 may want anyway. To keep story 2-3 self-contained and ship without a new dependency, the reader ships an in-house `---\n...\n---` splitter + `JSON.parse()` frontmatter codec. Limitation is YAML support — the reader expects JSON-compatible frontmatter (objects, arrays, strings, numbers, booleans, null). YAML-only features (anchors, multi-line scalars, comments) are NOT supported. Documenting this in the reader's JSDoc; the 2-7 stub + 3.1 patterns will author JSON frontmatter to avoid YAML dependencies. **Reversibility:** if a later story needs YAML, swap the parser — `parseEntry()` seam stays unchanged.

**Design call 2 — Single-file reader vs split per-type walkers.** The reader could split into `readCaseStudies()`, `readPatterns()`, etc., or be one `readContent(options)` that walks all five surfaces. Single-file wins on: (a) one `diagnostics[]` aggregation surface, (b) one `published[]` union (E3.3 wants a single set to iterate), (c) one place to wire `now-snapshot.json` + `cv.md` (the bare-tag surfaces are part of the same content-root walk). Split-per-type would add boilerplate without changing the public API. **Decision:** single-file reader with internal typed-tag dispatch table. **Reversibility:** refactor to per-type if performance is a concern (unlikely — `content/` has ≤ ~30 entries).

**Design call 3 — `publishedSet.byTagSlug` Map construction.** The E3.3 citation walker wants O(1) lookup by `<tag>:<slug>` string. The reader builds this Map as a side-product of `published[]` aggregation (one pass, no second walk). The Map is exposed as a frozen field on the result so the walker can `result.publishedSet.byTagSlug.get('case-study:wellbook')` without re-iterating. **Reversibility:** remove the Map if a future consumer prefers array iteration; the Map is a pure projection.

**Design call 4 — Fail-soft diagnostics vs throw.** Two valid contracts: throw on first malformed published entry (fast-fail) OR collect all diagnostics and return them (fail-soft). The reader fails soft — the caller (story 2-4's shallow-clone wrapper) decides whether to throw or `process.exit(1)`. Rationale: collecting all diagnostics means a single build run surfaces every malformed entry, not just the first; lets the author fix all broken files in one cycle. The 2-4 wrapper will iterate `diagnostics[]`, print them with `console.error`, and `process.exit(1)` if any are present.

**Design call 5 — `now-snapshot.json` placeholder tolerance.** Story 2-7 stub + 5a.3 own the real file. The current scaffold ships `{ entries: [], last_updated: null }` as a placeholder. The reader must accept the placeholder (no diagnostic) and only fail if `last_updated !== max(entries[].updated)` when entries are non-empty. This keeps the 2-3 build green while 5a-3 is still in backlog.

**Design call 6 — `now-snapshot.json` entry tag.** Now-entries are bare-tag (`now`). They go into `published[]` with `{ tag: 'now', id: <id>, path: 'now-snapshot.json', data: <NowEntry> }` (no `slug` field — bare-tag contract). The `publishedSet.byTagSlug` Map uses `now:<id>` as the key so the walker can resolve citations to now-entries by their `id`.

## Verification

**Commands:**
- `pnpm typecheck` — expected: exit 0. Verifies the reader's discriminated `PublishedEntry` union type, generic `ParseEntryResult<T>` consumers, and `Date` / `Map<string, PublishedEntry>` constructor types.
- `pnpm lint` — expected: exit 0. Reader follows kebab-case + PascalCase-export convention; no magic numbers; closed-set tuples marked `as const`; no `console.log`.
- `npx tsx scripts/smoke-2-3.mts` — expected: exit 0. The smoke test asserts the I/O matrix above.

**Manual checks (no CLI):**
- Open `lib/content/reader.ts`: confirm the reader imports `parseEntry` from `./parse-entry` (NOT re-implementing the parse logic), uses `renderDiagnostics()` for any diagnostic emission, and returns a frozen `publishedSet` object.
- Open `scripts/smoke-2-3.mts`: confirm the fixture is built under `os.tmpdir()` (NOT in `sanjit-content/`), cleaned up in a `finally` block, and covers every row of the I/O matrix.
- Open `lib/content/index.ts`: confirm `readContent`, `PublishedEntry`, `DraftedEntry`, `ReadContentOptions`, `ReadContentResult`, `PublishedSet` are re-exported (per the barrel pattern from 2-2).
- Confirm no `gray-matter` import anywhere in `lib/content/` (per Design call 1; failure = a reviewer catches a new transitive dep).

## Suggested Review Order

**Public API surface (the seam 2-4 / 3.3 / 5a.4 import from)**

- `readContent(options)` — the single entry point for the content walker.
  [`reader.ts:120`](../../lib/content/reader.ts#L120)
- `PublishedEntry` discriminated union — the published-set type the citation walker iterates.
  [`reader.ts:80`](../../lib/content/reader.ts#L80)
- `ReadContentResult.publishedSet` — the O(1) Map surface E3.3's walker consumes.
  [`reader.ts:155`](../../lib/content/reader.ts#L155)

**AD-5 contract enforcement (the per-file diagnostic aggregator)**

- Diagnostic aggregation across the directory tree — every malformed published entry emits one `<path>: <field> <message>` line.
  [`reader.ts:230`](../../lib/content/reader.ts#L230)
- Fail-soft vs throw boundary — the reader collects; the caller exits non-zero.
  [`reader.ts:280`](../../lib/content/reader.ts#L280)

**Per-type dispatch (the typed-tag enumeration in action)**

- Typed-tag dispatch table (case-study / pattern / lab / project → schema + tag-slug helper).
  [`reader.ts:190`](../../lib/content/reader.ts#L190)
- Bare-tag surfaces (now-snapshot.json + cv.md) — `NOW_TAG` + `CV_TAG` skip the typed-entry path.
  [`reader.ts:210`](../../lib/content/reader.ts#L210)

**Verification surface (peripherals)**

- `scripts/smoke-2-3.mts` — the I/O matrix smoke test (covers 16 rows above).

## Suggested Review Order

**Public API surface (the seam 2-4 / 3.3 / 5a.4 import from)**

- `readContent(options)` — the single entry point for the content walker.
  [`reader.ts:263`](../../lib/content/reader.ts#L263)
- `PublishedEntry` discriminated union — the published-set type the citation walker iterates.
  [`reader.ts:63`](../../lib/content/reader.ts#L63)
- `PublishedSet.byTagSlug` + `byPath` — frozen O(1) lookup surfaces the E3.3 walker + the `/recruiter?forward=1&case=<slug>` route consume.
  [`reader.ts:317`](../../lib/content/reader.ts#L317)

**AD-5 contract enforcement (the per-file diagnostic aggregator)**

- Walk + dispatch table — each typed-tag directory is walked with `TYPED_DISPATCH`; bare-tag surfaces (now/cv) have their own readers.
  [`reader.ts:216`](../../lib/content/reader.ts#L216)
- Parse-failure routing — parse failures become diagnostics AND draft entries (loud-but-ignored; AD-5 silent-corruption avoidance).
  [`reader.ts:380`](../../lib/content/reader.ts#L380)
- Published-needs-title enforcement — `data.title === undefined` on a published entry produces a build-fail diagnostic (the seam the schema leaves optional).
  [`reader.ts:402`](../../lib/content/reader.ts#L402)
- Fail-soft boundary — the reader aggregates; the caller exits non-zero. `diagnostics[]` shape is the AD-5 contract.
  [`reader.ts:306`](../../lib/content/reader.ts#L306)

**Bare-tag surfaces (now + cv)**

- `readNowSnapshot` — `last_updated === max(entries[].updated)` check (or `null` for the 5a.3 placeholder) emits a diagnostic on mismatch.
  [`reader.ts:480`](../../lib/content/reader.ts#L480)
- `readCV` — bare-tag surface; NOT in `published[]`; rendered at `/cv` by a future story.
  [`reader.ts:610`](../../lib/content/reader.ts#L610)

**In-house frontmatter parser (no `gray-matter` dep — Design call 1)**

- `parseFrontmatter` — JSON-only `---\n...\n---` splitter; documented YAML limitation.
  [`reader.ts:669`](../../lib/content/reader.ts#L669)

**Verification surface (peripherals)**

- `scripts/smoke-2-3.mts` — 51 assertions covering the I/O matrix rows above.
  [`smoke-2-3.mts:1`](../../scripts/smoke-2-3.mts#L1)
- `lib/content/index.ts` barrel — re-exports the reader's public API + types for downstream consumers.
  [`index.ts:32`](../../lib/content/index.ts#L32)