/**
 * lib/content/pattern.ts — Story 2-2 pattern schema.
 *
 * A pattern is a problem-framing essay (e.g., `canonical-model.mdx`) that other
 * entries (case-studies, primarily) cite. Per AD-4 + AD-17, the citation walker
 * (story 3.3) string-matches against the published pattern set, and the
 * `pattern_moves` override structure is the partial-mitigation surface for the
 * deferred spine amendment AGENTS.md #14 (AD-4 move-id validation).
 *
 * THIS STORY DOES NOT VALIDATE move-id resolution. The schema accepts the
 * `pattern_moves` field shape verbatim; the walker's build-fail path
 * (partial-mitigation per AD-16) lives in story 3.3.
 *
 * Additive contract (FR-13): same as `case-study.ts` — `.partial({ title: true })`
 * + `.passthrough()`. ISR tag: `pattern:<slug>`.
 */

import { z } from 'zod';
import { BaseEntrySchema, BASE_KNOWN_KEYS, type BaseEntry } from './_shared';
import type { ParseEntryResult } from './parse-entry';
import { parseEntry } from './parse-entry';

/**
 * `pattern_moves` entry — describes a heading in the pattern and the move IDs
 * (framing | decision | counter-example) attached to it. The schema validates
 * the SHAPE; the walker (3.3) validates that the move IDs resolve against the
 * published heading-ID set.
 */
const PatternMoveSchema = z.object({
  heading: z.string().min(1),
  moves: z.array(z.string().min(1)).min(1),
});

const PatternFields = z.object({
  /** Stable URL slug — required at parse time so the reader can build `pattern:<slug>`. */
  slug: z.string().min(1),
  /** Short tagline for the pattern index. */
  tagline: z.string().optional(),
  /** Free-form summary. */
  summary: z.string().optional(),
  /**
   * Pattern moves — heading + the move IDs attached to that heading. Used by
   * the citation walker (story 3.3) for build-fail validation against the
   * pattern's actual heading IDs.
   */
  pattern_moves: z.array(PatternMoveSchema).optional(),
});

export const PatternSchema = BaseEntrySchema
  .partial({ title: true })
  .extend(PatternFields.shape)
  .passthrough();

export type Pattern = z.infer<typeof PatternSchema> & { meta: Record<string, unknown> };
export type PatternAsBase = Pattern & BaseEntry;

/**
 * Known-keys closure for the parser. Note: `pattern_moves` is a nested key —
 * it is the KEY in the top-level object that holds the moves array. The
 * walker (3.3) walks into the nested array as needed.
 */
export const PatternKnownKeys: readonly string[] = [
  ...BASE_KNOWN_KEYS,
  'slug',
  'tagline',
  'summary',
  'pattern_moves',
];

/**
 * Build the ISR tag for a pattern: `pattern:<slug>`. Same shape as the 2-1
 * workflow's typed-tag construction.
 */
export function patternTagSlug(slug: string): `pattern:${string}` {
  return `pattern:${slug}`;
}

export function parsePatternEntry(
  path: string,
  raw: unknown,
): ParseEntryResult<Pattern> {
  return parseEntry({ path, raw, schema: PatternSchema, knownKeys: PatternKnownKeys });
}