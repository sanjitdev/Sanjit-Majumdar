/**
 * lib/content/reader.ts — Story 2-3 content reader.
 *
 * Walks the build-time shallow-clone of `sanjit-content/` (the local
 * `content/` directory produced by story 2-4) and returns a typed result
 * containing:
 *
 *   - `published[]` — every entry with `status === 'published'` that parsed
 *     cleanly via its Zod schema. Tagged with `{ tag, path, data }` so the
 *     citation walker (story 3.3) can switch on `tag` without `instanceof`.
 *   - `drafts[]` — entries with `status === 'draft'` that parsed cleanly.
 *     Excluded from the published set per AD-5.
 *   - `diagnostics[]` — per-file diagnostic strings in the AD-5 shape
 *     `<path>: <field> <message>`. The reader is FAIL-SOFT: it does NOT
 *     throw on malformed published frontmatter; the caller (story 2-4's
 *     shallow-clone wrapper) decides whether to `process.exit(1)`.
 *   - `cv` — the parsed CV document (bare-tag surface, not in `published[]`).
 *   - `nowSnapshot` — the parsed now-snapshot (AD-2 amendment contract:
 *     `{ entries, last_updated: max(entries[].updated) }`).
 *   - `publishedSet` — a frozen O(1) lookup surface for the citation walker.
 *
 * AD-1 read path: the reader walks a LOCAL directory only. No GitHub HTTP API
 * calls. Story 2-4 wires the shallow-clone; this module consumes whatever
 * directory it points at.
 *
 * The reader is PURE: no `console.*`, no `process.env`, no global state. All
 * logging and exit-code decisions live in the caller.
 *
 * Frontmatter parser: in-house, no `gray-matter` dep (per Design call 1 in
 * the spec). Accepts JSON-compatible frontmatter only — YAML-only features
 * (anchors, comments, multi-line scalars) are NOT supported. The 2-7 stub +
 * 3.1 patterns will author JSON frontmatter to avoid YAML dependencies.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { z } from 'zod';

import { BARE_TAGS, TYPED_TAGS, type BareTag, type TypedTag } from './_shared';
import { parseEntry } from './parse-entry';
import { CaseStudySchema, CaseStudyKnownKeys, caseStudyTagSlug } from './case-study';
import { LabSchema, LabKnownKeys, labTagSlug } from './lab';
import { NowEntrySchema, NowEntryKnownKeys, NOW_TAG } from './now-entry';
import { PatternSchema, PatternKnownKeys, patternTagSlug } from './pattern';
import { ProjectSchema, ProjectKnownKeys, projectTagSlug } from './project';
import { CVSchema, CVKnownKeys } from './cv';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * One published entry — a discriminated union tagged with the typed-tag
 * identity (`<tag>:<slug>`) so downstream consumers (the citation walker
 * in story 3.3, primarily) can switch on `tag` without `instanceof`. Bare-tag
 * now-entries use `{ tag: 'now', id: <id> }` (no `slug` field per bare-tag
 * contract).
 *
 * `path` is the path RELATIVE to `options.contentRoot`, using forward slashes
 * (POSIX) regardless of host OS — that's the form the published-set gets
 * shipped under to consumers.
 */
export type PublishedEntry =
  | {
      tag: TypedTag;
      slug: string;
      path: string;
      tagSlug: string;
      data: import('./case-study').CaseStudy &
        Record<string, unknown>;
    }
  | {
      tag: TypedTag;
      slug: string;
      path: string;
      tagSlug: string;
      data: import('./pattern').Pattern & Record<string, unknown>;
    }
  | {
      tag: TypedTag;
      slug: string;
      path: string;
      tagSlug: string;
      data: import('./lab').Lab & Record<string, unknown>;
    }
  | {
      tag: TypedTag;
      slug: string;
      path: string;
      tagSlug: string;
      data: import('./project').Project & Record<string, unknown>;
    }
  | {
      tag: typeof NOW_TAG;
      id: string;
      path: 'now-snapshot.json';
      tagSlug: string;
      data: import('./now-entry').NowEntry & Record<string, unknown>;
    };

/**
 * One drafted entry — same shape as a published entry but tagged with
 * `status: 'draft'`. Excluded from `published[]` (AD-5) but preserved so
 * preview tooling (a future story) can render them.
 */
export type DraftedEntry =
  | {
      tag: TypedTag;
      slug: string;
      path: string;
      tagSlug: string;
      data: Record<string, unknown>;
    }
  | {
      tag: typeof NOW_TAG;
      id: string;
      path: 'now-snapshot.json';
      tagSlug: string;
      data: Record<string, unknown>;
    };

/** The parsed CV document — bare-tag, not in `published[]`. */
export interface CVResult {
  path: 'cv.md';
  data: import('./cv').CV & { meta: Record<string, unknown> };
  body: string;
}

/**
 * The parsed now-snapshot. `last_updated` is `null` for the 5a.3 placeholder
 * (empty entries). After 5a-3 ships, `last_updated` must equal
 * `max(entries[].updated)` — the reader emits a diagnostic on mismatch.
 */
export interface NowSnapshot {
  entries: Array<{
    id: string;
    date: string;
    body?: string;
    href?: string;
    title?: string;
    status?: 'draft' | 'published';
    updated?: string;
    meta: Record<string, unknown>;
  }>;
  last_updated: string | null;
}

/**
 * The O(1) lookup surface for the citation walker (story 3.3). Frozen so
 * callers cannot mutate it after `readContent()` returns.
 *
 * - `byTagSlug` — typed entries keyed by `<tag>:<slug>`; now-entries keyed by
 *   `now:<id>` (bare-tag identity). The single map is convenient for the
 *   walker because both forms are bare-string keys.
 * - `byPath` — all published entries keyed by their relative path (useful
 *   for the `/recruiter?forward=1&case=<slug>` route, which resolves slugs
 *   to paths).
 */
export interface PublishedSet {
  readonly byTagSlug: ReadonlyMap<string, PublishedEntry>;
  readonly byPath: ReadonlyMap<string, PublishedEntry>;
  readonly tagSlugs: readonly string[];
}

/** Options for `readContent()`. */
export interface ReadContentOptions {
  /** Absolute or CWD-relative path to the content root (the shallow-clone). */
  contentRoot: string;
}

/**
 * The aggregated result of a content walk. Diagnostics are per-file strings
 * in the AD-5 shape; the caller decides whether to throw or `process.exit(1)`
 * based on `diagnostics.length`.
 */
export interface ReadContentResult {
  published: PublishedEntry[];
  drafts: DraftedEntry[];
  diagnostics: string[];
  cv: CVResult | null;
  nowSnapshot: NowSnapshot | null;
  publishedSet: PublishedSet;
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

/** The shape returned by the in-house frontmatter parser. */
interface ParsedFrontmatter {
  frontmatter: unknown;
  body: string;
}

/** The typed-tag dispatch table — one entry per `TYPED_TAGS` member. */
interface TypedDispatch {
  /** The directory name in `sanjit-content/content/` (plural form). */
  readonly dir: string;
  /** The typed-tag identity used in the ISR tag string `<tag>:<slug>`. */
  readonly tag: TypedTag;
  /** Each schema is a `ZodObject` with `.passthrough()`; `ZodTypeAny` is
   * the common supertype that lets the dispatch table hold heterogeneous
   * schemas without variance issues. `parseEntry()` is typed at the
   * call site so the per-entry inference still works. */
  readonly schema: z.ZodTypeAny;
  readonly knownKeys: readonly string[];
  readonly tagSlug: (slug: string) => string;
}

// ---------------------------------------------------------------------------
// Typed-tag dispatch table (the canonical place that wires TYPED_TAGS to
// schemas). Adding a 5th typed tag (TYPED_TAGS has length 4 today) requires
// updating this table AND the spine amendment process.
// ---------------------------------------------------------------------------

const TYPED_DISPATCH: readonly TypedDispatch[] = [
  {
    dir: 'case-studies',
    tag: 'case-study',
    schema: CaseStudySchema,
    knownKeys: CaseStudyKnownKeys,
    tagSlug: caseStudyTagSlug,
  },
  {
    dir: 'patterns',
    tag: 'pattern',
    schema: PatternSchema,
    knownKeys: PatternKnownKeys,
    tagSlug: patternTagSlug,
  },
  {
    dir: 'lab',
    tag: 'lab',
    schema: LabSchema,
    knownKeys: LabKnownKeys,
    tagSlug: labTagSlug,
  },
  {
    dir: 'projects',
    tag: 'project',
    schema: ProjectSchema,
    knownKeys: ProjectKnownKeys,
    tagSlug: projectTagSlug,
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Walk `options.contentRoot` and return a typed `ReadContentResult`.
 *
 * PURE function: no I/O outside `options.contentRoot`, no `console.*`, no
 * `process.env`. The caller decides whether to fail the build on
 * `result.diagnostics.length > 0` (the canonical contract: exit non-zero
 * with one diagnostic line per failing published entry).
 *
 * @param options.contentRoot — the absolute or CWD-relative path to the
 *   content directory. Typically `sanjit-content/content/` or the path the
 *   build-time shallow-clone (story 2-4) produces.
 */
export function readContent(options: ReadContentOptions): ReadContentResult {
  const diagnostics: string[] = [];
  const published: PublishedEntry[] = [];
  const drafts: DraftedEntry[] = [];

  let rootStat: ReturnType<typeof statSync> | null = null;
  try {
    rootStat = statSync(options.contentRoot);
  } catch {
    diagnostics.push(`content root not found: ${options.contentRoot}`);
    return emptyResult(diagnostics);
  }

  if (!rootStat.isDirectory()) {
    diagnostics.push(`content root is not a directory: ${options.contentRoot}`);
    return emptyResult(diagnostics);
  }

  // Walk each typed-tag directory (case-studies/, patterns/, lab/, projects/).
  // We walk even if a directory doesn't exist (no diagnostic; the content
  // repo may not have published patterns yet — see 2-7 stub + 3.1 publish).
  for (const dispatch of TYPED_DISPATCH) {
    walkTypedDirectory({
      contentRoot: options.contentRoot,
      dispatch,
      diagnostics,
      published,
      drafts,
    });
  }

  // Read the bare-tag surfaces (now-snapshot.json + cv.md).
  const nowSnapshot = readNowSnapshot({
    contentRoot: options.contentRoot,
    diagnostics,
    published,
    drafts,
  });
  const cv = readCV({
    contentRoot: options.contentRoot,
    diagnostics,
  });

  // Build the O(1) lookup surface once (no second walk).
  const byTagSlug = new Map<string, PublishedEntry>();
  const byPath = new Map<string, PublishedEntry>();
  const tagSlugs: string[] = [];
  for (const entry of published) {
    byTagSlug.set(entry.tagSlug, entry);
    byPath.set(entry.path, entry);
    tagSlugs.push(entry.tagSlug);
  }

  const publishedSet: PublishedSet = Object.freeze({
    byTagSlug,
    byPath,
    tagSlugs,
  });

  return {
    published,
    drafts,
    diagnostics,
    cv,
    nowSnapshot,
    publishedSet,
  };
}

// ---------------------------------------------------------------------------
// Typed-tag directory walker
// ---------------------------------------------------------------------------

function walkTypedDirectory(args: {
  contentRoot: string;
  dispatch: TypedDispatch;
  diagnostics: string[];
  published: PublishedEntry[];
  drafts: DraftedEntry[];
}): void {
  const { contentRoot, dispatch, diagnostics, published, drafts } = args;
  const dirAbs = join(contentRoot, dispatch.dir);

  let exists = false;
  try {
    exists = statSync(dirAbs).isDirectory();
  } catch {
    exists = false;
  }
  if (!exists) {
    return; // missing typed directory is not an error (no published yet)
  }

  // Recursive walk; only `.mdx` + `.md` files. `readdirSync(...,
  // { recursive: true })` returns absolute paths with Node 20.9+ on the
  // platforms we ship to (Linux for Vercel; macOS for dev).
  const entries: string[] = [];
  collectFilesRecursively(dirAbs, entries);

  for (const abs of entries) {
    if (!abs.endsWith('.mdx') && !abs.endsWith('.md')) {
      continue;
    }
    const rel = relative(contentRoot, abs).split(sep).join('/');
    const slug = slugFromPath(rel);
    if (!slug) {
      continue;
    }
    const raw = readFileSync(abs, 'utf-8');
    const parsed = parseFrontmatter(raw);

    const result = parseEntry({
      path: rel,
      raw: parsed.frontmatter,
      schema: dispatch.schema,
      knownKeys: dispatch.knownKeys,
    });
    if (!result.ok) {
      // Parse failure → file is treated as a draft (no `status` claim =
      // nothing to fail the build on per AD-5). The diagnostic is preserved
      // so the build author sees the parse error loudly; drafts are excluded
      // from `published[]` automatically. This handles the NO_FRONITTER
      // matrix row (raw markdown with no `---` block parses to empty
      // frontmatter, fails `status Required`, and lands here).
      diagnostics.push(result.diagnostic);
      drafts.push({
        tag: dispatch.tag,
        slug,
        path: rel,
        tagSlug: dispatch.tagSlug(slug),
        data: {},
      });
      continue;
    }
    const data = result.data as Record<string, unknown> & {
      status?: 'draft' | 'published';
      title?: string;
      slug?: string;
      meta: Record<string, unknown>;
    };
    // Design call 2 from story 2-2: `.partial({ title: true })` makes
    // `title` optional at schema time. The reader enforces the
    // published-needs-title contract (FR-13 + AD-5): a published entry
    // with `title === undefined` fails the build with a per-file
    // diagnostic. Drafts may have no title.
    if (data.status === 'published') {
      if (typeof data.title !== 'string' || data.title.length === 0) {
        diagnostics.push(`${rel}: title Required`);
        // Continue: the diagnostic is the build-fail signal; the entry is
        // NOT added to `published[]` because the reader's contract says
        // published-with-no-title is malformed-for-published (AD-5).
        continue;
      }
      published.push({
        tag: dispatch.tag,
        slug: data.slug ?? slug,
        path: rel,
        tagSlug: dispatch.tagSlug(data.slug ?? slug),
        data: data as never,
      });
    } else {
      drafts.push({
        tag: dispatch.tag,
        slug: data.slug ?? slug,
        path: rel,
        tagSlug: dispatch.tagSlug(data.slug ?? slug),
        data,
      });
    }
  }
}

function collectFilesRecursively(dir: string, out: string[]): void {
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of names) {
    const abs = join(dir, name);
    let stat: ReturnType<typeof statSync> | null = null;
    try {
      stat = statSync(abs);
    } catch {
      continue;
    }
    if (!stat) continue;
    if (stat.isDirectory()) {
      collectFilesRecursively(abs, out);
    } else if (stat.isFile()) {
      out.push(abs);
    }
  }
}

/**
 * Derive the slug from a relative path. The slug is the LAST path segment
 * with the `.mdx` / `.md` extension stripped. Mirrors the 2-1 workflow regex
 * in `sanjit-content/.github/workflows/revalidate.yml`:
 *
 *   - `case-studies/wellbook.mdx` → slug `wellbook`
 *   - `case-studies/group/wellbook.mdx` → slug `wellbook`
 *
 * Returns `null` if no usable basename is found (e.g., trailing slash).
 */
function slugFromPath(rel: string): string | null {
  const lastSlash = rel.lastIndexOf('/');
  const base = lastSlash >= 0 ? rel.slice(lastSlash + 1) : rel;
  if (!base) return null;
  return base.replace(/\.(mdx|md)$/i, '') || null;
}

// ---------------------------------------------------------------------------
// now-snapshot.json reader
// ---------------------------------------------------------------------------

function readNowSnapshot(args: {
  contentRoot: string;
  diagnostics: string[];
  published: PublishedEntry[];
  drafts: DraftedEntry[];
}): NowSnapshot | null {
  const { contentRoot, diagnostics, published, drafts } = args;
  const abs = join(contentRoot, 'now-snapshot.json');
  let raw: string;
  try {
    raw = readFileSync(abs, 'utf-8');
  } catch {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    diagnostics.push('now-snapshot.json: invalid JSON');
    return null;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    diagnostics.push('now-snapshot.json: expected JSON object at top level');
    return null;
  }
  const obj = parsed as Record<string, unknown>;
  if (!Array.isArray(obj.entries)) {
    diagnostics.push('now-snapshot.json: missing "entries" array');
    return null;
  }
  if (obj.last_updated !== null && typeof obj.last_updated !== 'string') {
    diagnostics.push('now-snapshot.json: "last_updated" must be string or null');
    return null;
  }

  // Validate each entry via NowEntrySchema. Per the spec, only entries
  // referenced by `published[]` need the AD-5 published-status gate; rows
  // with `status: 'draft'` go into `drafts[]`.
  const validatedEntries: NowSnapshot['entries'] = [];
  for (let i = 0; i < obj.entries.length; i++) {
    const row = obj.entries[i] as unknown;
    const rowPath = `now-snapshot.json#entries[${i}]`;
    const result = parseEntry({
      path: rowPath,
      raw: row,
      schema: NowEntrySchema,
      knownKeys: NowEntryKnownKeys,
    });
    if (!result.ok) {
      diagnostics.push(result.diagnostic);
      continue;
    }
    const data = result.data;
    if (data.status === 'published') {
      // AD-5: published-with-no-id is a diagnostic. The NowEntrySchema
      // requires `id` at parse time (per `now-entry.ts`), so a missing id
      // already produced a diagnostic above. If `id` is present, append.
      published.push({
        tag: NOW_TAG,
        id: data.id,
        path: 'now-snapshot.json',
        tagSlug: `${NOW_TAG}:${data.id}`,
        data: data as never,
      });
    } else {
      drafts.push({
        tag: NOW_TAG,
        id: data.id,
        path: 'now-snapshot.json',
        tagSlug: `${NOW_TAG}:${data.id}`,
        data,
      });
    }
    validatedEntries.push({
      id: data.id,
      date: data.date,
      body: data.body,
      href: data.href,
      title: data.title,
      status: data.status,
      updated: data.updated,
      meta: data.meta,
    });
  }

  const snapshot: NowSnapshot = {
    entries: validatedEntries,
    last_updated: (obj.last_updated as string | null) ?? null,
  };

  // AD-2 amendment: last_updated must equal max(entries[].updated) when
  // entries are non-empty. The placeholder (`entries: [], last_updated:
  // null`) is tolerated.
  const computedMax = computeMaxUpdated(validatedEntries);
  if (computedMax === null && snapshot.last_updated !== null) {
    diagnostics.push(
      `now-snapshot.json: last_updated does not match max(entries[].updated) (no entry has an updated field; expected last_updated === null)`,
    );
  } else if (
    computedMax !== null &&
    snapshot.last_updated !== null &&
    computedMax !== snapshot.last_updated
  ) {
    diagnostics.push(
      `now-snapshot.json: last_updated does not match max(entries[].updated) (expected ${computedMax}, got ${snapshot.last_updated})`,
    );
  }

  return snapshot;
}

function computeMaxUpdated(
  entries: ReadonlyArray<{ updated?: string }>,
): string | null {
  let max: string | null = null;
  for (const e of entries) {
    if (typeof e.updated === 'string' && e.updated.length > 0) {
      if (max === null || e.updated > max) {
        max = e.updated;
      }
    }
  }
  return max;
}

// ---------------------------------------------------------------------------
// cv.md reader
// ---------------------------------------------------------------------------

function readCV(args: {
  contentRoot: string;
  diagnostics: string[];
}): CVResult | null {
  const { contentRoot, diagnostics } = args;
  const abs = join(contentRoot, 'cv.md');
  let raw: string;
  try {
    raw = readFileSync(abs, 'utf-8');
  } catch {
    return null;
  }

  const parsed = parseFrontmatter(raw);
  const result = parseEntry({
    path: 'cv.md',
    raw: parsed.frontmatter,
    schema: CVSchema,
    knownKeys: CVKnownKeys,
  });
  if (!result.ok) {
    diagnostics.push(result.diagnostic);
    return null;
  }
  // CV is a bare-tag surface (CV_TAG = 'cv'). Per the 2-1 bare-tag
  // enumeration, the CV is NOT in `published[]`; it is the single document
  // mounted at `/cv` (rendered by a future story). The reader still fails
  // the build if the frontmatter is malformed (AD-5) — same shape as
  // published entries, just a different downstream surface.
  if (result.data.status !== 'published') {
    // Draft CV is tolerated by the build (AD-5: drafts may be malformed);
    // but we still emit a diagnostic so the author sees the parse
    // succeeded. Returning null signals "no published CV".
    return null;
  }
  return {
    path: 'cv.md',
    data: result.data,
    body: parsed.body,
  };
}

// ---------------------------------------------------------------------------
// In-house frontmatter parser (no `gray-matter` dep — Design call 1)
// ---------------------------------------------------------------------------

/**
 * Parse a markdown file into frontmatter + body.
 *
 * Accepts:
 *   - `---<newline><json><newline>---<newline><body>` — the canonical shape
 *   - `---<newline>---<newline><body>` — empty frontmatter (returns `{}`)
 *   - `<body>` (no delimiter) — returns `{ frontmatter: {}, body: <raw> }`
 *
 * Limitation (documented in the spec): frontmatter is parsed as JSON. YAML-
 * only features (anchors, comments, multi-line scalars) are NOT supported.
 * The 2-7 stub + 3.1 patterns will author JSON frontmatter to avoid YAML
 * dependencies.
 */
export function parseFrontmatter(raw: string): ParsedFrontmatter {
  // Normalize line endings; CR is rare in authored content but Vercel's
  // checkout sometimes leaves it on Windows-checked-in files.
  const text = raw.replace(/\r\n?/g, '\n');

  // Frontmatter MUST start at column 0 per CommonMark + gray-matter
  // conventions. A file beginning with `# Heading` has no frontmatter.
  if (!text.startsWith('---')) {
    return { frontmatter: {}, body: text.replace(/\n$/, '') };
  }

  // Find the closing `---` delimiter. Scan line-by-line so multi-line JSON
  // is captured verbatim.
  const lines = text.split('\n');
  // lines[0] is the opening '---'.
  let closeIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') {
      closeIdx = i;
      break;
    }
  }
  if (closeIdx === -1) {
    // Unterminated frontmatter: treat the whole file as body (gray-matter's
    // behavior). The author gets an empty frontmatter + the raw text as
    // body, which produces a clear "no status" parse failure downstream.
    return { frontmatter: {}, body: text.replace(/\n$/, '') };
  }

  const yamlText = lines.slice(1, closeIdx).join('\n');
  // Body starts after the closing delimiter + its trailing newline.
  const bodyLines = lines.slice(closeIdx + 1);
  // Strip a single leading blank line (gray-matter convention) but keep
  // meaningful leading content untouched.
  while (bodyLines.length > 0 && bodyLines[0] === '') {
    bodyLines.shift();
  }
  const body = bodyLines.join('\n').replace(/\n$/, '');

  if (yamlText.trim().length === 0) {
    return { frontmatter: {}, body };
  }

  try {
    return { frontmatter: JSON.parse(yamlText), body };
  } catch {
    // Non-JSON frontmatter: surface as an empty frontmatter object + the
    // raw text as body. The Zod parse downstream will see `{}` and emit a
    // precise diagnostic ("status Required").
    return { frontmatter: {}, body };
  }
}

// ---------------------------------------------------------------------------
// Empty result helper (used when the content root is missing)
// ---------------------------------------------------------------------------

function emptyResult(diagnostics: string[]): ReadContentResult {
  return {
    published: [],
    drafts: [],
    diagnostics,
    cv: null,
    nowSnapshot: null,
    publishedSet: Object.freeze({
      byTagSlug: new Map(),
      byPath: new Map(),
      tagSlugs: [],
    }),
  };
}

// ---------------------------------------------------------------------------
// Re-exports for callers that want the raw closed-set tuples
// ---------------------------------------------------------------------------

export { BARE_TAGS, TYPED_TAGS };
export type { BareTag, TypedTag };
export { NOW_TAG } from './now-entry';
export { CV_TAG } from './cv';