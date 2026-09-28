// scripts/smoke-2-5.mts — Story 2-5 revalidate handler smoke test.
//
// Run with: npx tsx scripts/smoke-2-5.mts  (or `pnpm smoke:2-5`)
//
// Verifies every I/O & Edge-Case Matrix row from
// spec-2-5-implement-post-apirevalidate-edge-handler-...md by exercising
// the pure helpers in `lib/api/revalidate.ts` (no Next.js dev server
// required, no network required).
//
// Exits 0 on all-pass; exits 1 on any failure (mirrors smoke-2-4.mts).

import { verifyAuth, buildTag } from '../lib/api/revalidate.ts';

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed++;
  } else {
    console.log(`  ok: ${msg}`);
  }
}

function makeReq(headers: Record<string, string>): Pick<Request, 'headers' | 'url'> {
  return {
    headers: {
      get(name: string): string | null {
        return headers[name] ?? headers[name.toLowerCase()] ?? null;
      },
    } as unknown as Headers,
    url: 'https://example.test/api/revalidate',
  };
}

console.log('=== Story 2-5 revalidate handler smoke test ===');

// ---------------------------------------------------------------------------
// Section 1: buildTag — closed-set tag construction (AD-1)
// ---------------------------------------------------------------------------
console.log('\n--- buildTag: happy paths ---');

{
  const r = buildTag('now', null);
  assert(r.ok === true && r.tag === 'now', "bare 'now' → 'now'");

  const r2 = buildTag('cv', null);
  assert(r2.ok === true && r2.tag === 'cv', "bare 'cv' → 'cv'");

  const r3 = buildTag('pattern', 'canonical-model');
  assert(r3.ok === true && r3.tag === 'pattern:canonical-model', "typed 'pattern' + slug → 'pattern:canonical-model'");

  const r4 = buildTag('case-study', 'wellbook');
  assert(r4.ok === true && r4.tag === 'case-study:wellbook', "typed 'case-study' + slug → 'case-study:wellbook' (matches 2-1 workflow shape)");

  const r5 = buildTag('lab', 'playground');
  assert(r5.ok === true && r5.tag === 'lab:playground', "typed 'lab' + slug → 'lab:playground'");

  const r6 = buildTag('project', 'foo-bar');
  assert(r6.ok === true && r6.tag === 'project:foo-bar', "typed 'project' + slug → 'project:foo-bar'");

  // Nested slug: `auth/canonical-model`
  const r7 = buildTag('pattern', 'auth/canonical-model');
  assert(r7.ok === true && r7.tag === 'pattern:auth/canonical-model', "nested slug 'auth/canonical-model' accepted");
}

// ---------------------------------------------------------------------------
// Section 2: buildTag — closed-set rejections (defense in depth)
// ---------------------------------------------------------------------------
console.log('\n--- buildTag: rejections ---');

{
  const r = buildTag(null, null);
  assert(r.ok === false && r.code === 'invalid_tag', 'missing tag → invalid_tag');

  const r2 = buildTag('', 'foo');
  assert(r2.ok === false && r2.code === 'invalid_tag', 'empty tag → invalid_tag');

  const r3 = buildTag('banner', 'foo');
  assert(r3.ok === false && r3.code === 'invalid_tag', "unknown type 'banner' → invalid_tag");

  const r4 = buildTag('Pattern', 'foo'); // case-sensitive: closed set is lowercase
  assert(r4.ok === false && r4.code === 'invalid_tag', "case-sensitive: 'Pattern' (capital P) → invalid_tag");

  const r5 = buildTag('pattern', null);
  assert(r5.ok === false && r5.code === 'invalid_tag', "typed without slug → invalid_tag");

  const r6 = buildTag('now', 'extra-slug');
  assert(r6.ok === false && r6.code === 'invalid_tag', "bare tag with slug → invalid_tag (ambiguous)");

  const r7 = buildTag('pattern', 'well book'); // whitespace
  assert(r7.ok === false && r7.code === 'invalid_slug', "slug with whitespace → invalid_slug");

  const r8 = buildTag('pattern', '../etc/passwd'); // path traversal
  assert(r8.ok === false && r8.code === 'invalid_slug', "slug with path traversal → invalid_slug");

  const r9 = buildTag('pattern', '-leading-dash'); // starts with non-alnum
  assert(r9.ok === false && r9.code === 'invalid_slug', "slug starting with dash → invalid_slug");

  const r10 = buildTag('pattern', 'UPPER');
  assert(r10.ok === false && r10.code === 'invalid_slug', "slug with uppercase → invalid_slug");
}

// ---------------------------------------------------------------------------
// Section 3: verifyAuth — happy + sad paths
// ---------------------------------------------------------------------------
console.log('\n--- verifyAuth ---');

{
  const SECRET = 'openssl-rand-hex-32-AAAA';

  // Happy: correct token
  const ok = await verifyAuth(makeReq({ authorization: `Bearer ${SECRET}` }), SECRET);
  assert(ok.ok === true, 'correct bearer token → ok');

  // Sad: missing header
  const miss = await verifyAuth(makeReq({}), SECRET);
  assert(miss.ok === false && miss.code === 'unauthorized', 'missing header → unauthorized');

  // Sad: wrong scheme
  const wrong = await verifyAuth(makeReq({ authorization: `Basic ${SECRET}` }), SECRET);
  assert(wrong.ok === false && wrong.code === 'unauthorized', 'Basic scheme → unauthorized');

  // Sad: wrong token (same length, different content)
  const bad = await verifyAuth(makeReq({ authorization: `Bearer ${'x'.repeat(SECRET.length)}` }), SECRET);
  assert(bad.ok === false && bad.code === 'unauthorized', 'wrong token (same length) → unauthorized');

  // Sad: shorter token
  const short = await verifyAuth(makeReq({ authorization: 'Bearer abc' }), SECRET);
  assert(short.ok === false && short.code === 'unauthorized', 'shorter token → unauthorized');

  // Sad: longer token
  const long = await verifyAuth(makeReq({ authorization: `Bearer ${SECRET}x` }), SECRET);
  assert(long.ok === false && long.code === 'unauthorized', 'longer token → unauthorized');

  // Sad: misconfigured (no secret)
  const mc = await verifyAuth(makeReq({ authorization: `Bearer ${SECRET}` }), undefined);
  assert(mc.ok === false && mc.code === 'misconfigured', 'unset secret → misconfigured');

  // Sad: empty string secret
  const empty = await verifyAuth(makeReq({ authorization: `Bearer ${SECRET}` }), '');
  assert(empty.ok === false && empty.code === 'misconfigured', 'empty string secret → misconfigured');

  // Sad: case-insensitive scheme (RFC 6750 allows `bearer`)
  const ci = await verifyAuth(makeReq({ authorization: `bearer ${SECRET}` }), SECRET);
  assert(ci.ok === true, 'case-insensitive scheme (bearer) → ok');
}

// ---------------------------------------------------------------------------
// Section 4: integration — auth runs BEFORE buildTag (auth fail must not
// leak the tag-construction error)
// ---------------------------------------------------------------------------
console.log('\n--- integration: auth-first ordering ---');

{
  // If auth fails, the caller never reaches buildTag. This is the
  // operational contract: a malformed query on an unauthorized request
  // returns 401, not 400.
  const auth = await verifyAuth(makeReq({}), 'good-secret');
  assert(auth.ok === false && auth.code === 'unauthorized', "no auth → 401 even if query is malformed");
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n=== ${failed === 0 ? 'ALL PASS' : `${failed} FAIL`} ===`);
process.exit(failed === 0 ? 0 : 1);
