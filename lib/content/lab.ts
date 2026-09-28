/**
 * lib/content/lab.ts — Story 2-2 lab schema.
 *
 * A lab entry is a tool or experiment page mounted at `/lab/<slug>`. Per E3.5,
 * the lab index categorizes entries as production / experiment / personal.
 *
 * Additive contract (FR-13): `.partial({ title: true })` + `.passthrough()`.
 * ISR tag: `lab:<slug>`.
 */

import { z } from 'zod';
import { BaseEntrySchema, BASE_KNOWN_KEYS, type BaseEntry } from './_shared';
import type { ParseEntryResult } from './parse-entry';
import { parseEntry } from './parse-entry';

const LabFields = z.object({
  /** Stable URL slug — required at parse time so the reader can build `lab:<slug>`. */
  slug: z.string().min(1),
  /** Short tagline for the lab index. */
  tagline: z.string().optional(),
  /**
   * Lab categorization: production | experiment | personal. Story 3.5 consumes
   * this for the index-page grouping. Default-undefined allowed so existing
   * entries without categorization still parse.
   */
  category: z.enum(['production', 'experiment', 'personal']).optional(),
  /** Free-form summary. */
  summary: z.string().optional(),
  /** Tech stack used. */
  stack: z.array(z.string()).optional(),
  /** External URL if the tool is hosted elsewhere. */
  href: z.string().url().optional(),
});

export const LabSchema = BaseEntrySchema
  .partial({ title: true })
  .extend(LabFields.shape)
  .passthrough();

export type Lab = z.infer<typeof LabSchema> & { meta: Record<string, unknown> };
export type LabAsBase = Lab & BaseEntry;

export const LabKnownKeys: readonly string[] = [
  ...BASE_KNOWN_KEYS,
  'slug',
  'tagline',
  'category',
  'summary',
  'stack',
  'href',
];

export function labTagSlug(slug: string): `lab:${string}` {
  return `lab:${slug}`;
}

export function parseLabEntry(
  path: string,
  raw: unknown,
): ParseEntryResult<Lab> {
  return parseEntry({ path, raw, schema: LabSchema, knownKeys: LabKnownKeys });
}