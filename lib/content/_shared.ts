/**
 * lib/content/_shared.ts — Story 2-2 shared base + closed-set tuples.
 *
 * The 6 entry-type schemas (case-study, pattern, lab, project, now-entry, cv)
 * all extend `BaseEntrySchema` with `.partial({ title: true })` + `.passthrough()`,
 * but they share three concerns:
 *
 *   1. The closed `STATUSES` enum (`draft` | `published`). AD-5's error model
 *      branches on this value at READER time (story 2-3), not at schema time —
 *      the schema just parses it. Reader-side enforcement: `status: published`
 *      requires a valid title; `status: draft` is tolerated by the build.
 *
 *   2. The closed tag enumeration that mirrors `sanjit-content/.github/workflows/
 *      revalidate.yml` (story 2-1): typed (`case-study`, `pattern`, `lab`,
 *      `project`) carry `<tag>:<slug>`; bare (`now`, `cv`) carry `<tag>` alone.
 *
 *   3. ISO 8601 date strings (`created`, `updated`) per the Conventions table
 *      in `architecture-Sanjit-Majumdar-2026-09-23/.memlog.md`. All optional.
 *
 * The `as const` tuples narrow the inferred union types (TypeScript literal
 * union from `(typeof TUPLE)[number]`) so the per-type schemas can use them
 * as `z.enum(...)` inputs without `as unknown as [string, ...string[]]`
 * casts. Mirrors the pattern in `lib/canvas-modes.ts` (AD-17).
 */

import { z } from 'zod';

/**
 * The 2 closed status values (AD-5 malformed-frontmatter error model).
 * Source of truth: `architecture-Sanjit-Majumdar-2026-09-23/.memlog.md` line 59.
 */
export const STATUSES = ['draft', 'published'] as const;
export type Status = (typeof STATUSES)[number];

/**
 * The 4 typed tags — entries with stable URLs at `/work/<slug>`, `/patterns/<slug>`,
 * `/lab/<slug>`, `/projects/<slug>`. Each tag is paired with a `slug` field on the
 * corresponding schema to build `<tag>:<slug>` for ISR revalidation.
 *
 * Source of truth: `sanjit-content/.github/workflows/revalidate.yml` "Map changed paths
 * to tags" step. Do NOT add or rename without a 2-1 spec amendment.
 */
export const TYPED_TAGS = ['case-study', 'pattern', 'lab', 'project'] as const;
export type TypedTag = (typeof TYPED_TAGS)[number];

/**
 * The 2 bare tags — entries without slugs. The tag IS the identity.
 *
 * - `now`: KV namespace (AD-2) + the `/now` route ticker + the `now-snapshot.json`
 *   shape committed-cadence-owned by 5a.3.
 * - `cv`: the `/cv` route, single-file content at `content/cv.md`.
 */
export const BARE_TAGS = ['now', 'cv'] as const;
export type BareTag = (typeof BARE_TAGS)[number];

/**
 * `z.enum` for status. Built once here so the 6 schemas import a single canonical
 * enum (closed-set discipline — adding a status requires updating `STATUSES` here
 * AND the AD-5 amendment process; a future contributor cannot sneak in a third
 * status by adding it to a single file).
 */
export const StatusSchema = z.enum(STATUSES);

/**
 * ISO 8601 date string (per Conventions table). We use `z.string()` rather than
 * `z.string().datetime()` because frontmatter dates are conventionally
 * `YYYY-MM-DD` (date-only) or full ISO timestamps — `datetime()` would reject
 * the date-only form and force every author to write the time. The convention
 * is documented; the schema accepts any string and the reader normalizes.
 */
const IsoDateString = z.string().min(1);

/**
 * The shared base schema every entry type extends. Acts as a "set of known
 * keys" — `parseEntry()` uses this side-channel to know which top-level keys
 * to extract into `meta` after a successful safeParse.
 *
 * - `title`: required at the BASE level (typed-entry schemas DO NOT re-call
 *   `.partial({ title: true })` for typed entries — the canonical case-study
 *   page has a title; the additive contract from FR-13 is satisfied by the
 *   reader treating `undefined` as malformed-for-published).
 *
 *   Actually: re-reading AC1 verbatim — "the schema is `.partial({title: true})
 *   + .passthrough()`" — every entry-type schema MUST call `.partial({ title:
 *   true })`. The draft tolerance is built into the schema (drafts may have
 *   no title) and the reader (story 2-3) enforces the "published entries
 *   require a title" rule at parse-time aggregation. See Design Notes 2.
 *
 * - `status`: required (the reader's draft-vs-published branch depends on it
 *   being present).
 *
 * - `created`, `updated`: optional ISO date strings.
 *
 * The 6 entry-type files call `.partial({ title: true }).extend({ ...typedFields
 * }).passthrough()` on this object. Extension order matters: extend BEFORE
 * passthrough so per-type fields flow through passthrough correctly.
 */
export const BaseEntrySchema = z.object({
  title: z.string(),
  status: StatusSchema,
  created: IsoDateString.optional(),
  updated: IsoDateString.optional(),
});

/**
 * The inferred base type — every entry-type extension produces a type that
 * is assignable to `BaseEntry`. Useful for the reader (story 2-3) when it
 * unions all 6 published-entry types into a single `PublishedEntry` union.
 *
 * The `meta` field is populated by `parseEntry()` (FR-13 additive contract);
 * it is not declared by the schema (it is the *negative space* of the
 * schema — keys the schema does NOT define).
 */
export type BaseEntry = z.infer<typeof BaseEntrySchema> & {
  meta: Record<string, unknown>;
};

/**
 * The list of base-schema top-level keys. Used by `parseEntry()` to decide
 * which keys in the safeParse output should be lifted into the `meta`
 * object. Per-type schema files extend this with their typed-field names
 * and export the resulting `<Type>KnownKeys` constant for the parser.
 *
 * Order does not matter for the lift — it's a Set lookup — but mirrors the
 * field declaration order in `BaseEntrySchema` for readability.
 */
export const BASE_KNOWN_KEYS = ['title', 'status', 'created', 'updated'] as const;