/**
 * lib/content/now-entry.ts — Story 2-2 currently-building entry schema.
 *
 * A "now entry" is one row in the `/now` ticker. Entries live as entries inside
 * `content/now-snapshot.json` (canonical shape per AD-2 + E5a.2's payload
 * contract) — the schema parses ONE row of that array.
 *
 * Bare-tag contract: `now` has no slug — the entry's identity is its `id`
 * (or its position in the snapshot array). The ISR tag is the bare string
 * `now` (per `sanjit-content/.github/workflows/revalidate.yml` + the 2-1
 * bare-tag enumeration). The reader (story 2-3) treats `now-entry` rows as
 * a separate published-set keyed by `id`, NOT by `tag:slug`.
 *
 * Additive contract (FR-13): `.partial({ title: true })` + `.passthrough()`.
 */

import { z } from 'zod';
import { BaseEntrySchema, BASE_KNOWN_KEYS, type BaseEntry } from './_shared';
import type { ParseEntryResult } from './parse-entry';
import { parseEntry } from './parse-entry';

const NowEntryFields = z.object({
  /** Unique id for the entry — used as the React key on the ticker list. */
  id: z.string().min(1),
  /**
   * ISO 8601 timestamp the entry was added to the snapshot. Required so the
   * ticker can sort newest-first and so the 7-day gate (AD-10 stale-state
   * fallback contract) has a stable time axis.
   */
  date: z.string().min(1),
  /** Short body text (markdown, single-line). */
  body: z.string().optional(),
  /** Optional link URL (e.g., a GitHub commit or PR). */
  href: z.string().url().optional(),
});

export const NowEntrySchema = BaseEntrySchema
  .partial({ title: true })
  .extend(NowEntryFields.shape)
  .passthrough();

export type NowEntry = z.infer<typeof NowEntrySchema> & { meta: Record<string, unknown> };
export type NowEntryAsBase = NowEntry & BaseEntry;

/**
 * The bare ISR tag for now entries. Mirrors the 2-1 workflow's bare-tag
 * enumeration — `now` has no slug; the tag IS the identity.
 */
export const NOW_TAG = 'now' as const;

export const NowEntryKnownKeys: readonly string[] = [
  ...BASE_KNOWN_KEYS,
  'id',
  'date',
  'body',
  'href',
];

export function parseNowEntry(
  path: string,
  raw: unknown,
): ParseEntryResult<NowEntry> {
  return parseEntry({ path, raw, schema: NowEntrySchema, knownKeys: NowEntryKnownKeys });
}