/**
 * lib/content/index.ts — Story 2-2 barrel export.
 *
 * Re-exports every public symbol from the 6 entry-type schemas + the parse
 * helper + the shared base. The reader (story 2-3) imports from this barrel
 * to avoid 7 separate import statements; downstream consumers (case-study pages,
 * pattern index) import per-file to avoid pulling in unused schemas.
 *
 * Note: this barrel does NOT include `parse-entry.ts` as a wildcard re-export —
 * `parseEntry` and `ParseEntryResult` are re-exported individually so the
 * reader can do `import { parseEntry } from '@/lib/content'`.
 */

export {
  STATUSES,
  TYPED_TAGS,
  BARE_TAGS,
  StatusSchema,
  BaseEntrySchema,
  BASE_KNOWN_KEYS,
} from './_shared';
export type {
  Status,
  TypedTag,
  BareTag,
  BaseEntry,
} from './_shared';

export { parseEntry, renderDiagnostics, liftToMeta } from './parse-entry';
export type { ParseEntryResult, ZodError } from './parse-entry';

// Content reader (story 2-3) — walks the shallow-clone of `sanjit-content/`,
// validates entries via the per-type schemas above, filters to status ===
// 'published', and returns a typed result with a frozen O(1) lookup surface.
export { readContent, parseFrontmatter } from './reader';
export type {
  PublishedEntry,
  DraftedEntry,
  CVResult,
  NowSnapshot,
  PublishedSet,
  ReadContentOptions,
  ReadContentResult,
} from './reader';

// Case-study
export {
  CaseStudySchema,
  CaseStudyKnownKeys,
  caseStudyTagSlug,
  parseCaseEntry,
} from './case-study';
export type { CaseStudy, CaseStudyAsBase } from './case-study';

// Pattern
export {
  PatternSchema,
  PatternKnownKeys,
  patternTagSlug,
  parsePatternEntry,
} from './pattern';
export type { Pattern, PatternAsBase } from './pattern';

// Lab
export {
  LabSchema,
  LabKnownKeys,
  labTagSlug,
  parseLabEntry,
} from './lab';
export type { Lab, LabAsBase } from './lab';

// Project
export {
  ProjectSchema,
  ProjectKnownKeys,
  projectTagSlug,
  parseProjectEntry,
} from './project';
export type { Project, ProjectAsBase } from './project';

// Now entry (bare tag)
export {
  NowEntrySchema,
  NowEntryKnownKeys,
  NOW_TAG,
  parseNowEntry,
} from './now-entry';
export type { NowEntry, NowEntryAsBase } from './now-entry';

// CV (bare tag)
export {
  CVSchema,
  CVKnownKeys,
  CV_TAG,
  parseCV,
} from './cv';
export type { CV, CVAsBase } from './cv';
