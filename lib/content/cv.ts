/**
 * lib/content/cv.ts — Story 2-2 CV schema.
 *
 * The CV is a single-file markdown document at `content/cv.md` — distinct from
 * the per-entry frontmatter model because the CV is ONE document with
 * structured sections, not a collection of entries.
 *
 * Bare-tag contract: `cv` has no slug — the tag IS the identity. ISR tag is
 * the bare string `cv` (per the 2-1 bare-tag enumeration). The reader (story
 * 2-3) treats the CV as a single published document with optional sections,
 * not as an array of typed entries.
 *
 * Additive contract (FR-13): `.partial({ title: true })` + `.passthrough()`.
 * The CV is allowed to ship with incomplete sections (a draft) — the reader
 * renders whatever sections parse cleanly and skips the rest.
 */

import { z } from 'zod';
import { BaseEntrySchema, BASE_KNOWN_KEYS, type BaseEntry } from './_shared';
import type { ParseEntryResult } from './parse-entry';
import { parseEntry } from './parse-entry';

/**
 * One experience block — employer + role + dates + summary. All optional so
 * a partial CV (draft state) parses without forcing every field.
 */
const ExperienceBlock = z.object({
  employer: z.string().optional(),
  role: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  summary: z.string().optional(),
});

const EducationBlock = z.object({
  institution: z.string().optional(),
  degree: z.string().optional(),
  year: z.string().optional(),
});

const CVFields = z.object({
  /** Free-form summary section (a few sentences — the "header" paragraph). */
  summary: z.string().optional(),
  /** Experience section — list of positions, newest first. */
  experience: z.array(ExperienceBlock).optional(),
  /** Education section — list of degrees/certifications. */
  education: z.array(EducationBlock).optional(),
  /** Skills section — flat list of strings. */
  skills: z.array(z.string()).optional(),
  /** Contact email or link (display-only). */
  contact: z.string().optional(),
});

export const CVSchema = BaseEntrySchema
  .partial({ title: true })
  .extend(CVFields.shape)
  .passthrough();

export type CV = z.infer<typeof CVSchema> & { meta: Record<string, unknown> };
export type CVAsBase = CV & BaseEntry;

/** The bare ISR tag for CV. */
export const CV_TAG = 'cv' as const;

/**
 * Known-keys closure for the parser. Note `experience` and `education` are
 * nested keys (they hold arrays of objects) — they go in the top-level set.
 */
export const CVKnownKeys: readonly string[] = [
  ...BASE_KNOWN_KEYS,
  'summary',
  'experience',
  'education',
  'skills',
  'contact',
];

export function parseCV(
  path: string,
  raw: unknown,
): ParseEntryResult<CV> {
  return parseEntry({ path, raw, schema: CVSchema, knownKeys: CVKnownKeys });
}