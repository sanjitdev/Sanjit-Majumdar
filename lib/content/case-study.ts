/**
 * lib/content/case-study.ts — Story 2-2 case-study schema.
 *
 * Closed-list discipline: this is ONE of 6 entry-type schemas (case-study, pattern,
 * lab, project, now-entry, cv). The shared `BaseEntrySchema` provides
 * `title` + `status` + optional `created`/`updated`; this file adds the typed-entry
 * fields and exports the additive contract.
 *
 * Additive contract (FR-13):
 *   1. `.partial({ title: true })` — every frontmatter field is optional at parse
 *      time EXCEPT `status`. The reader (story 2-3) enforces "published entries
 *      require a title" at aggregation time.
 *   2. `.passthrough()` — unknown keys (e.g., a future `metrics` field added in
 *      a later story) flow into `data.meta` instead of being stripped.
 *
 * ISR tag: a published case-study maps to `<tag>:<slug>` = `case-study:<slug>`.
 * `caseStudyTagSlug()` is the seam the content walker (story 2-3) uses to build
 * the `revalidateTag` argument; the 2-1 workflow uses the same shape.
 */

import { z } from 'zod';
import { BaseEntrySchema, BASE_KNOWN_KEYS, type BaseEntry } from './_shared';
import type { ParseEntryResult } from './parse-entry';
import { parseEntry } from './parse-entry';

/**
 * Per-type fields for a case-study. All optional (FR-13). Extend this object as
 * new case-study frontmatter fields are added in future stories — the additive
 * contract guarantees adding a field never breaks an old entry.
 *
 * Conventions: ISO 8601 dates, proof numbers as strings (per the Conventions
 * table in `architecture-Sanjit-Majumdar-2026-09-23/.memlog.md`).
 */
const CaseStudyFields = z.object({
  /** Stable URL slug — required at parse time so the reader can build `case-study:<slug>`. */
  slug: z.string().min(1),
  /** Long-form summary rendered on the case-study index. */
  summary: z.string().optional(),
  /** Proof numbers cited in the body (kept as strings for display formatting). */
  metrics: z.array(z.string()).optional(),
  /** Client name(s) — used by the homepage proof-vector cluster. */
  client: z.string().optional(),
  /** Year the work shipped (display string, not a date type). */
  year: z.string().optional(),
  /** Tags for cross-linking from other entries (not the same as the ISR tag). */
  tags: z.array(z.string()).optional(),
});

/**
 * The case-study schema. Composed as:
 *   BaseEntrySchema.partial({ title: true }) — title becomes optional at parse
 *     time; everything else (status, created, updated) stays as the base defines.
 *   .extend(CaseStudyFields.shape) — typed-entry fields (slug required, others
 *     optional). Extension must happen BEFORE passthrough so per-type fields
 *     flow through passthrough correctly.
 *   .passthrough() — unknown keys are preserved on `data.meta` (FR-13) — the
 *     `parseEntry()` helper lifts them post-parse using `CaseStudyKnownKeys`.
 */
export const CaseStudySchema = BaseEntrySchema
  .partial({ title: true })
  .extend(CaseStudyFields.shape)
  .passthrough();

/**
 * The inferred TypeScript type for a parsed case-study entry. The `meta` field
 * is auto-populated by `parseEntry()` after a successful safeParse.
 */
export type CaseStudy = z.infer<typeof CaseStudySchema> & { meta: Record<string, unknown> };

/**
 * Convenience: a `CaseStudy` is also assignable to `BaseEntry` (the reader's
 * union type uses this). Provided as a type guard for future readers.
 */
export type CaseStudyAsBase = CaseStudy & BaseEntry;

/**
 * The closed set of known top-level keys for a case-study. Used by
 * `parseEntry()` to lift unknown keys into `data.meta` (FR-13). Mirror the
 * union of `BASE_KNOWN_KEYS` + every typed-field key above. Adding a typed
 * field requires adding it here too.
 */
export const CaseStudyKnownKeys: readonly string[] = [
  ...BASE_KNOWN_KEYS,
  'slug',
  'summary',
  'metrics',
  'client',
  'year',
  'tags',
];

/**
 * Build the ISR tag for a case-study: `case-study:<slug>`. This is the seam
 * between the schema (story 2-2) and the workflow (story 2-1) — the workflow
 * constructs the same shape from the file path; this helper lets the reader
 * (story 2-3) round-trip the tag when revalidating.
 *
 * Pure function. Returns the literal string `<slug>` prefixed with `case-study:`.
 */
export function caseStudyTagSlug(slug: string): `case-study:${string}` {
  return `case-study:${slug}`;
}

/**
 * Re-export the parse helper so a case-study caller can do
 * `import { parseCaseEntry } from './case-study'` without a second import.
 */
export function parseCaseEntry(
  path: string,
  raw: unknown,
): ParseEntryResult<CaseStudy> {
  return parseEntry({ path, raw, schema: CaseStudySchema, knownKeys: CaseStudyKnownKeys });
}