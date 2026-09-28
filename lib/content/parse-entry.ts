/**
 * lib/content/parse-entry.ts — Story 2-2 AD-5 per-file diagnostic helper.
 *
 * `parseEntry()` wraps `schema.safeParse(raw)` and returns a discriminated union
 * the content walker (story 2-3) can switch on:
 *
 *   - `{ ok: true, data }` — entry parsed successfully. `data` is the inferred
 *     schema type with `meta` populated for unknown keys (FR-13 additive contract).
 *
 *   - `{ ok: false, diagnostic }` — entry failed to parse. `diagnostic` is a
 *     single-line per-file message of the form
 *     `<path>: <dotted.field.path> <zod-issue-message>`.
 *     Story 2-3's reader uses this string verbatim in the build-fail output
 *     (e.g., `pnpm build` exits non-zero with the diagnostic printed once per
 *     failing published entry).
 *
 * Additive behavior (FR-13):
 *   In Zod 4, `.passthrough()` preserves unknown keys at the top level of the
 *   output object (NOT under a `.meta` sub-property). To match the epics
 *   verbatim AC ("unknown keys are preserved on `entry.meta`"), the per-type
 *   schemas pass their `knownKeys` list (base keys + typed fields) and
 *   `parseEntry()` lifts any output key NOT in that list into `data.meta`.
 *
 * The helper is pure: no file I/O, no mutation, no logging. The reader
 * (story 2-3) is responsible for aggregating diagnostics across a directory
 * walk and emitting the build-fail signal.
 */

import type { ZodError, ZodIssue, ZodTypeAny, z } from 'zod';

/**
 * The shape returned to callers. Use `result.ok` to narrow.
 *
 * @template T - The inferred TypeScript type of the schema being parsed
 *               (T extends the standard schema shape with a `meta` field).
 */
export type ParseEntryResult<T> =
  | { ok: true; data: T & { meta: Record<string, unknown> } }
  | { ok: false; diagnostic: string };

/**
 * Parse a raw frontmatter object against a Zod schema and return either the
 * parsed data (with unknown keys lifted to `data.meta`) or a per-file
 * diagnostic.
 *
 * @param opts.path  - The file path the raw frontmatter came from (relative
 *                     to the content repo root). Used verbatim in the
 *                     diagnostic so build-fail output is greppable.
 * @param opts.raw   - The raw frontmatter object (typically the output of
 *                     `gray-matter` or equivalent; not validated here).
 * @param opts.schema - The Zod schema to parse against (one of the 6 entry-type
 *                     schemas from `lib/content/{case-study,pattern,lab,project,
 *                     now-entry,cv}.ts`).
 * @param opts.knownKeys - The set of top-level keys the schema defines. The
 *                     parser lifts any output key NOT in this set into
 *                     `data.meta` (FR-13 additive contract). Each per-type
 *                     schema file exports a constant `<Type>KnownKeys` that
 *                     the caller passes here.
 *
 * @returns A `ParseEntryResult<T>` discriminated by `ok`. On failure, every
 *     `ZodIssue` is rendered as `<path>: <field> <message>` — one diagnostic
 *     per issue, joined by `\n` so the reader can print one line per failing
 *     field. Per AD-5: the build must fail with `file path + failing field`.
 */
export function parseEntry<T extends ZodTypeAny>(opts: {
  path: string;
  raw: unknown;
  schema: T;
  knownKeys: readonly string[];
}): ParseEntryResult<z.infer<T>> {
  const result = opts.schema.safeParse(opts.raw);
  if (result.success) {
    const lifted = liftToMeta(result.data, opts.knownKeys);
    return { ok: true, data: lifted as z.infer<T> & { meta: Record<string, unknown> } };
  }
  const diagnostic = renderDiagnostics(opts.path, result.error.issues);
  return { ok: false, diagnostic };
}

/**
 * Lift any key in `data` that is NOT in `knownKeys` into a new `meta` object.
 *
 * Pure function. Mutates nothing. Returns a fresh object so the inferred type
 * is stable (no aliasing of the safeParse output).
 *
 * @internal Exported only for unit-testing the lift behavior.
 */
export function liftToMeta(
  data: unknown,
  knownKeys: readonly string[],
): Record<string, unknown> & { meta: Record<string, unknown> } {
  const known = new Set<string>(knownKeys);
  const typed: Record<string, unknown> = {};
  const meta: Record<string, unknown> = {};
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      if (known.has(k)) {
        typed[k] = v;
      } else {
        meta[k] = v;
      }
    }
  }
  return { ...typed, meta };
}

/**
 * Render a single line per Zod issue. Exported so the reader (story 2-3) can
 * reuse it when aggregating diagnostics across the directory walk.
 *
 * Shape: `<path>: <dotted.path> <message>`. Empty-path issues (e.g., a
 * top-level `ZodError`) render as `<path>: <message>` with a leading colon
 * trimmed.
 *
 * @internal — exported only so the reader can unit-test the diagnostic shape.
 *   Application code should call `parseEntry()` rather than `renderDiagnostics()`
 *   directly.
 */
export function renderDiagnostics(path: string, issues: readonly ZodIssue[]): string {
  return issues
    .map((issue) => {
      const field = (issue.path.length ? issue.path.join('.') : '').trim();
      return field ? `${path}: ${field} ${issue.message}` : `${path}: ${issue.message}`;
    })
    .join('\n');
}

// Re-export the Zod error type for callers that want the raw issues array
// (rare — the reader mostly consumes the rendered diagnostic string).
export type { ZodError };