/**
 * lib/content/project.ts — Story 2-2 project schema.
 *
 * A project entry is a personal/open-source work-in-progress at
 * `/projects/<slug>` (mounted with the AD-17 `timeline` canvas mode per
 * `lib/canvas-modes.ts`). Distinct from a case-study (which is professional /
 * client work) — projects tend to be personal, late-stage, or experiments.
 *
 * Additive contract (FR-13): `.partial({ title: true })` + `.passthrough()`.
 * ISR tag: `project:<slug>`.
 */

import { z } from 'zod';
import { BaseEntrySchema, BASE_KNOWN_KEYS, type BaseEntry } from './_shared';
import type { ParseEntryResult } from './parse-entry';
import { parseEntry } from './parse-entry';

const ProjectFields = z.object({
  /** Stable URL slug — required at parse time so the reader can build `project:<slug>`. */
  slug: z.string().min(1),
  /** Short tagline for the project index. */
  tagline: z.string().optional(),
  /** Free-form summary. */
  summary: z.string().optional(),
  /** Project status: idea | active | shipped | archived. Display-only; does not gate rendering. */
  project_status: z.enum(['idea', 'active', 'shipped', 'archived']).optional(),
  /** Year started. */
  started: z.string().optional(),
  /** GitHub URL if open-source. */
  repo: z.string().url().optional(),
  /** Live deployment URL. */
  href: z.string().url().optional(),
  /** Tech stack used. */
  stack: z.array(z.string()).optional(),
});

export const ProjectSchema = BaseEntrySchema
  .partial({ title: true })
  .extend(ProjectFields.shape)
  .passthrough();

export type Project = z.infer<typeof ProjectSchema> & { meta: Record<string, unknown> };
export type ProjectAsBase = Project & BaseEntry;

export const ProjectKnownKeys: readonly string[] = [
  ...BASE_KNOWN_KEYS,
  'slug',
  'tagline',
  'summary',
  'project_status',
  'started',
  'repo',
  'href',
  'stack',
];

export function projectTagSlug(slug: string): `project:${string}` {
  return `project:${slug}`;
}

export function parseProjectEntry(
  path: string,
  raw: unknown,
): ParseEntryResult<Project> {
  return parseEntry({ path, raw, schema: ProjectSchema, knownKeys: ProjectKnownKeys });
}