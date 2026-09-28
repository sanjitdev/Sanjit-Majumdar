/**
 * `lib/api/revalidate.ts` — pure helpers for the `POST /api/revalidate`
 * edge handler (story 2-5).
 *
 * Extracted from `app/api/revalidate/route.ts` so the smoke test
 * (`scripts/smoke-2-5.mts`) can exercise the closed-set tag
 * construction + auth gate without spinning up a Next.js dev server.
 *
 * Binds: AD-1 (single read path + closed tag enumeration), AD-3
 * (closed endpoint list), AGENTS.md pitfall #3 (Next 16
 * `revalidateTag(tag, 'max')` signature).
 *
 * Edge-runtime compatible: uses only Web Crypto + `TextEncoder`. No
 * `node:crypto`, no `fs`, no `child_process`.
 */

// AD-3 closed tag enumeration. Adding a tag type requires a spine
// amendment (AD-1). This is the single source of truth at runtime —
// the workflow in `sanjit-content` is the contract on the caller side.
export const BARE_TAGS: ReadonlySet<string> = new Set(['now', 'cv']);
export const TYPED_TYPES: ReadonlySet<string> = new Set([
  'case-study',
  'pattern',
  'lab',
  'project',
]);

// Slug charset: kebab-case path segments joined by `/`. Mirrors the
// pattern in `sanjit-content/.github/workflows/revalidate.yml` line 155
// (`content/(case-studies|patterns|lab|projects)/(.+)\.(mdx|md)`) — slugs
// may contain `/` for nested paths (e.g. `auth/canonical-model`).
export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-_/]*$/;

export type AuthResult =
  | { ok: true }
  | { ok: false; code: 'unauthorized' | 'misconfigured'; error: string };

export type TagResult =
  | { ok: true; tag: string }
  | { ok: false; code: 'invalid_tag' | 'invalid_slug'; error: string };

/**
 * Constant-time bearer-token compare. Manual XOR loop so the helper works
 * in both the edge runtime AND Node (the smoke test runs under tsx on
 * Node, where `crypto.subtle.timingSafeEqual` is not present — it is an
 * edge-runtime API). The edge handler does not pay a measurable cost
 * here: the loop is bounded by the token length (32 bytes hex = 64 chars)
 * and runs once per request.
 *
 * XOR-based compare: `result |= a[i] ^ b[i]` for every byte. If any byte
 * differs, `result` is non-zero. The loop runs to completion regardless
 * of where the first mismatch is, so the wall-clock time does not leak
 * the index of the first differing byte (no timing oracle).
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    // `charCodeAt(i)` returns NaN for out-of-range, but lengths match so
    // this is safe.
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Verify the `Authorization: Bearer <token>` header against
 * `expected` (the value of `process.env.REVALIDATE_SECRET`). Uses a
 * constant-time string compare to avoid timing oracles.
 */
export async function verifyAuth(
  req: Pick<Request, 'headers' | 'url'>,
  expected: string | undefined,
): Promise<AuthResult> {
  if (!expected || expected.length === 0) {
    return {
      ok: false,
      code: 'misconfigured',
      error: 'REVALIDATE_SECRET not set on the deployed environment',
    };
  }

  const header = req.headers.get('authorization') ?? '';
  // Bearer scheme — "Bearer <token>" per RFC 6750. Case-insensitive on
  // the scheme.
  const m = /^Bearer\s+(.+)$/i.exec(header);
  if (!m) {
    return {
      ok: false,
      code: 'unauthorized',
      error: 'missing or malformed Authorization header',
    };
  }
  const presented = m[1]!;

  if (!constantTimeEqual(presented, expected)) {
    return { ok: false, code: 'unauthorized', error: 'invalid token' };
  }

  return { ok: true };
}

/**
 * Build the AD-1 closed-set tag from query params. Reject anything that
 * doesn't match the enumeration.
 */
export function buildTag(
  tag: string | null,
  slug: string | null,
): TagResult {
  if (!tag) {
    return {
      ok: false,
      code: 'invalid_tag',
      error: 'tag query param is required',
    };
  }

  if (BARE_TAGS.has(tag)) {
    if (slug !== null) {
      return {
        ok: false,
        code: 'invalid_tag',
        error: `bare tag '${tag}' must not include a slug query param`,
      };
    }
    return { ok: true, tag };
  }

  if (TYPED_TYPES.has(tag)) {
    if (!slug) {
      return {
        ok: false,
        code: 'invalid_tag',
        error: `typed tag '${tag}' requires a slug query param`,
      };
    }
    if (!SLUG_PATTERN.test(slug)) {
      return {
        ok: false,
        code: 'invalid_slug',
        error: 'slug must match [a-z0-9][a-z0-9-_/]*',
      };
    }
    return { ok: true, tag: `${tag}:${slug}` };
  }

  return {
    ok: false,
    code: 'invalid_tag',
    error: `unknown tag type '${tag}'; expected one of: now, cv, case-study, pattern, lab, project`,
  };
}
