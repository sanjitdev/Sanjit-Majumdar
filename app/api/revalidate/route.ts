/**
 * `POST /api/revalidate` — webhook receiver for content edits.
 *
 * Story 2-5. Binds: AD-1 (single read path + closed tag enumeration),
 * AD-3 (closed serverless endpoint list — this is the third edge
 * endpoint), AD-9 (no build on content edits — this handler replaces a
 * Vercel hook), AGENTS.md pitfall #3 (Next 16 `revalidateTag(tag, 'max')`
 * signature is REQUIRED — single-arg form is deprecated).
 *
 * Wire shape (mirrors `sanjit-content/.github/workflows/revalidate.yml`
 * line 235-303 verbatim):
 *   POST /api/revalidate?tag=<tag>[&slug=<slug>][&sha=<sha>]
 *   Authorization: Bearer <REVALIDATE_SECRET>
 *   Body: { source: string, sha?: string }   // body is informational
 *
 * Tag construction (AD-1 closed set, enforced in `lib/api/revalidate.ts`):
 *   - bare:  ?tag=now         → 'now'
 *            ?tag=cv          → 'cv'
 *   - typed: ?tag=case-study  → 'case-study:<slug>'
 *            ?tag=pattern     → 'pattern:<slug>'
 *            ?tag=lab         → 'lab:<slug>'
 *            ?tag=project     → 'project:<slug>'
 */

import { revalidateTag } from 'next/cache';
import { verifyAuth, buildTag } from '@/lib/api/revalidate';

// AD-3: this is the THIRD closed endpoint. Edge runtime — no Node-only
// APIs. Web Crypto + Next.js's `revalidateTag` are sufficient.
export const runtime = 'edge';

/**
 * Single-line structured log. Spine convention (matches
 * `scripts/clone-content.mts` and the audit scripts). Vercel's log
 * stream picks this up as JSON.
 */
function logEvent(payload: Record<string, unknown>): void {
  console.log(JSON.stringify(payload));
}

export async function POST(req: Request): Promise<Response> {
  const request_id = crypto.randomUUID();
  const startedAt = Date.now();

  // Auth gate FIRST. Do not parse the body before auth — no point
  // allocating a body buffer for a request we're going to reject.
  const auth = await verifyAuth(req, process.env.REVALIDATE_SECRET);
  if (!auth.ok) {
    logEvent({
      event: 'revalidate',
      ok: false,
      code: auth.code,
      error: auth.error,
      request_id,
      duration_ms: Date.now() - startedAt,
      status: auth.code === 'misconfigured' ? 500 : 401,
    });
    const status = auth.code === 'misconfigured' ? 500 : 401;
    return new Response(
      JSON.stringify({ ok: false, code: auth.code, error: auth.error }),
      { status, headers: { 'content-type': 'application/json' } },
    );
  }

  // Parse query params. The 2-1 workflow posts ?tag=...&slug=...&sha=...
  const url = new URL(req.url);
  const tagParam = url.searchParams.get('tag');
  const slugParam = url.searchParams.get('slug');
  const shaParam = url.searchParams.get('sha');

  const tagResult = buildTag(tagParam, slugParam);
  if (!tagResult.ok) {
    logEvent({
      event: 'revalidate',
      ok: false,
      code: tagResult.code,
      error: tagResult.error,
      tag: tagParam,
      slug: slugParam,
      request_id,
      duration_ms: Date.now() - startedAt,
      status: 400,
    });
    return new Response(
      JSON.stringify({ ok: false, code: tagResult.code, error: tagResult.error }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }

  // Body is informational. The 2-1 workflow posts `{ source, sha }`;
  // we read it for log enrichment but the query string is authoritative.
  let bodySha: string | undefined;
  try {
    const body = await req.json();
    if (body && typeof body.sha === 'string') {
      bodySha = body.sha;
    }
  } catch {
    // Body is optional. A request with no body or invalid JSON still
    // succeeds if the tag is valid.
  }

  const finalSha = shaParam ?? bodySha ?? null;

  // ───────────────────────────────────────────────────────────────
  // THE call. Two arguments, 'max' profile — see AGENTS.md pitfall #3.
  // Single-arg `revalidateTag(finalTag)` is FORBIDDEN (deprecated in
  // Next 16). This is the binding contract of story 2-5.
  // ───────────────────────────────────────────────────────────────
  try {
    revalidateTag(tagResult.tag, 'max');
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logEvent({
      event: 'revalidate',
      ok: false,
      code: 'revalidate_failed',
      error,
      tag: tagResult.tag,
      sha: finalSha,
      request_id,
      duration_ms: Date.now() - startedAt,
      status: 500,
    });
    return new Response(
      JSON.stringify({ ok: false, code: 'revalidate_failed', error }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }

  const revalidatedAt = new Date().toISOString();
  logEvent({
    event: 'revalidate',
    ok: true,
    tag: tagResult.tag,
    sha: finalSha,
    request_id,
    duration_ms: Date.now() - startedAt,
    status: 200,
  });

  return new Response(
    JSON.stringify({
      ok: true,
      tag: tagResult.tag,
      sha: finalSha,
      revalidatedAt,
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
}
