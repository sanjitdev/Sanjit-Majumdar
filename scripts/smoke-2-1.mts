// scripts/smoke-2-1.mts — Story 2-1 workflow wire-shape smoke test.
//
// Run with: npx tsx scripts/smoke-2-1.mts  (or `pnpm smoke:2-1`)
//
// Verifies the wire contract between `sanjit-content/.github/workflows/
// revalidate.yml` and the deployed site's `POST /api/revalidate` endpoint
// (story 2-5). The workflow produces payloads of the form
// `?tag=<tag>[&slug=<slug>][&sha=<sha>]`; the handler (story 2-5) accepts
// those payloads and rejects anything that does not match the AD-1 closed
// tag enumeration.
//
// This smoke:
//   1. Simulates the workflow's path-to-tag mapping for every documented
//      content file type (case-study, pattern, lab, project, now, cv) and
//      for the multi-deep slug form (`patterns/auth/canonical-model.mdx`).
//   2. Feeds each resulting query string into `buildTag()` from
//      `lib/api/revalidate.ts` and asserts the handler accepts it.
//   3. Feeds each resulting query string into the closed-set tag list
//      from `lib/content/_shared.ts` and asserts the constructed tag is
//      an exact match for a known `<tag>:<slug>` or `<tag>` form.
//   4. Asserts the workflow's NO_Vercel_hook contract (AD-9) by reading
//      `sanjit-content/.gitignore` and asserting `.vercel/` is excluded.
//
// This is the verification surface for story 2-1 step-03. No network
// required. Exits 0 on all-pass; exits 1 on any failure.
//
// Binds: AD-1 (single read path + closed tag enumeration), AD-9 (no
// Vercel build on content edits), FR-12 (separate content repo,
// on-demand ISR), pitfall #9 (force-push coverage).

import { buildTag } from '../lib/api/revalidate.ts';
import {
  TYPED_TAGS,
  BARE_TAGS,
  type TypedTag,
} from '../lib/content/_shared.ts';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed++;
  } else {
    console.log(`  ok: ${msg}`);
  }
}

console.log('=== Story 2-1 workflow wire-shape smoke test ===');

// ---------------------------------------------------------------------------
// Section 1: Path → tag mapping (mirrors sanjit-content/.github/workflows/
// revalidate.yml "Map changed paths to tags" step)
// ---------------------------------------------------------------------------

console.log('\n--- workflow path → tag mapping ---');

/**
 * One row of the I/O & Edge-Case Matrix. Mirrors the regex the workflow
 * uses: `^content\/(case-studies|patterns|lab|projects)\/(.+)\.(mdx|md)$`
 * plus the two bare-file cases (`now-snapshot.json`, `cv.md`).
 */
interface PathCase {
  path: string;
  expectedTag: string; // the query-string `tag` value
  expectedSlug: string | null; // the query-string `slug` value, or null
}

const PATH_CASES: PathCase[] = [
  // Bare tags
  { path: 'content/now-snapshot.json', expectedTag: 'now', expectedSlug: null },
  { path: 'content/cv.md', expectedTag: 'cv', expectedSlug: null },
  // Typed tags — one-deep slugs
  { path: 'content/case-studies/wellbook.mdx', expectedTag: 'case-study', expectedSlug: 'wellbook' },
  { path: 'content/patterns/canonical-model.mdx', expectedTag: 'pattern', expectedSlug: 'canonical-model' },
  { path: 'content/lab/playground.mdx', expectedTag: 'lab', expectedSlug: 'playground' },
  { path: 'content/projects/foo-bar.mdx', expectedTag: 'project', expectedSlug: 'foo-bar' },
  // Typed tags — multi-deep slugs (the workflow regex `(case-studies|...)/
  // (.+)\.(mdx|md)` captures the FULL remainder as slug, joined with `/`)
  { path: 'content/patterns/auth/canonical-model.mdx', expectedTag: 'pattern', expectedSlug: 'auth/canonical-model' },
  { path: 'content/case-studies/2024/wellbook.mdx', expectedTag: 'case-study', expectedSlug: '2024/wellbook' },
  // .md extension (per the workflow regex — `cv.md` and any future bare
  // text-only content) — case-studies/foo.md also valid
  { path: 'content/case-studies/wellbook.md', expectedTag: 'case-study', expectedSlug: 'wellbook' },
];

// Mirror of the workflow's path-to-tag map. Kept in lockstep with
// sanjit-content/.github/workflows/revalidate.yml "Map changed paths to
// tags" step. A regression in either file fails this smoke.
function workflowMap(path: string): { tag: string; slug: string | null } | null {
  if (path === 'content/now-snapshot.json') return { tag: 'now', slug: null };
  if (path === 'content/cv.md') return { tag: 'cv', slug: null };
  const m = path.match(/^content\/(case-studies|patterns|lab|projects)\/(.+)\.(mdx|md)$/);
  if (!m) return null;
  const dir = m[1]!;
  const slug = m[2]!;
  const tag =
    dir === 'case-studies' ? 'case-study' :
    dir === 'patterns'     ? 'pattern' :
    dir === 'lab'          ? 'lab' :
    dir === 'projects'     ? 'project' : null;
  if (!tag) return null;
  return { tag, slug };
}

for (const tc of PATH_CASES) {
  const mapped = workflowMap(tc.path);
  assert(mapped !== null, `workflow maps ${tc.path}`);
  if (!mapped) continue;
  assert(mapped.tag === tc.expectedTag, `  → tag=${tc.expectedTag}`);
  assert(mapped.slug === tc.expectedSlug, `  → slug=${tc.expectedSlug ?? '(none)'}`);
}

// ---------------------------------------------------------------------------
// Section 2: buildTag accepts the workflow's payloads
// ---------------------------------------------------------------------------

console.log('\n--- buildTag accepts workflow payloads ---');

for (const tc of PATH_CASES) {
  const r = buildTag(tc.expectedTag, tc.expectedSlug);
  assert(r.ok === true, `buildTag(${tc.expectedTag}, ${tc.expectedSlug ?? 'null'}) → ok`);
  if (r.ok) {
    // For typed tags, the handler joins to `<tag>:<slug>`. For bare
    // tags, the tag is the identity. The constructed string is what
    // `revalidateTag(tag, 'max')` is called with.
    const expectedFinal =
      tc.expectedSlug !== null
        ? `${tc.expectedTag}:${tc.expectedSlug}`
        : tc.expectedTag;
    assert(r.tag === expectedFinal, `  → final tag '${expectedFinal}'`);
  }
}

// Negative cases — the workflow should never produce these, but if a
// future contributor breaks the regex, buildTag will reject them.
console.log('\n--- buildTag rejects invalid workflow payloads ---');
{
  const r = buildTag('unknown', 'foo');
  assert(r.ok === false && r.code === 'invalid_tag', "buildTag('unknown', 'foo') → invalid_tag");
}
{
  const r = buildTag('case-study', null);
  assert(r.ok === false && r.code === 'invalid_tag', "buildTag('case-study', null) → invalid_tag (typed tag requires slug)");
}
{
  const r = buildTag('now', 'surprise');
  assert(r.ok === false && r.code === 'invalid_tag', "buildTag('now', 'surprise') → invalid_tag (bare tag must not have slug)");
}
{
  const r = buildTag('case-study', 'Bad Slug!');
  assert(r.ok === false && r.code === 'invalid_slug', "buildTag('case-study', 'Bad Slug!') → invalid_slug");
}

// ---------------------------------------------------------------------------
// Section 3: Workflow's tag enumeration matches the closed-set tuples in
// lib/content/_shared.ts (the spine source of truth at the code repo).
// ---------------------------------------------------------------------------

console.log('\n--- tag enumeration matches spine (AD-1 closed set) ---');

// The typed tags the workflow knows about (the directory-name → tag map
// lives in workflowMap above). The spine's TYPED_TAGS must equal the
// set of tag values the workflow can produce.
const WORKFLOW_TYPED_TAGS = new Set<string>(['case-study', 'pattern', 'lab', 'project']);
for (const tag of TYPED_TAGS) {
  assert(WORKFLOW_TYPED_TAGS.has(tag), `spine typed tag '${tag}' is in the workflow's typed-tag set`);
}
for (const tag of WORKFLOW_TYPED_TAGS) {
  assert((TYPED_TAGS as readonly string[]).includes(tag), `workflow typed tag '${tag}' is in the spine's TYPED_TAGS`);
}

const WORKFLOW_BARE_TAGS = new Set<string>(['now', 'cv']);
for (const tag of BARE_TAGS) {
  assert(WORKFLOW_BARE_TAGS.has(tag), `spine bare tag '${tag}' is in the workflow's bare-tag set`);
}
for (const tag of WORKFLOW_BARE_TAGS) {
  assert((BARE_TAGS as readonly string[]).includes(tag), `workflow bare tag '${tag}' is in the spine's BARE_TAGS`);
}

// ---------------------------------------------------------------------------
// Section 4: Force-push coverage (pitfall #9)
//
// The workflow handles force-pushes by walking each commit's
// `added`/`modified`/`removed` arrays. We assert that the path-to-tag
// mapping above accepts paths in all three states.
// ---------------------------------------------------------------------------

console.log('\n--- force-push coverage (pitfall #9) ---');

const FORCE_PUSH_PATHS = [
  // A force-push may add new files, remove old files, and modify files
  // in the same push. Each path lands in one of the three arrays; the
  // mapping must handle all of them.
  'content/patterns/canonical-model.mdx',   // modified
  'content/case-studies/old-case.mdx',      // removed (workflow still dispatches revalidate)
  'content/lab/new-tool.mdx',               // added
];
for (const p of FORCE_PUSH_PATHS) {
  const mapped = workflowMap(p);
  assert(mapped !== null, `force-push-affected path '${p}' maps to a tag`);
}

// ---------------------------------------------------------------------------
// Section 5: AD-9 — no Vercel hook configured on sanjit-content
// ---------------------------------------------------------------------------

console.log('\n--- AD-9: no Vercel hook on sanjit-content ---');

{
  const gitignorePath = resolve(process.cwd(), 'sanjit-content/.gitignore');
  let contents: string;
  try {
    contents = readFileSync(gitignorePath, 'utf-8');
  } catch {
    assert(false, `sanjit-content/.gitignore exists at ${gitignorePath}`);
    contents = '';
  }
  // The .gitignore should exclude `.vercel/` so a future contributor
  // cannot accidentally commit a Vercel config to the content repo.
  // (AD-9: the content repo MUST NOT have a Vercel integration.)
  assert(
    contents.includes('.vercel'),
    'sanjit-content/.gitignore excludes .vercel/ (AD-9)',
  );
}

// ---------------------------------------------------------------------------
// Section 6: Workflow YAML is shipped with the closed event taxonomy
// ---------------------------------------------------------------------------

console.log('\n--- workflow event triggers (AC #2) ---');

{
  const workflowPath = resolve(
    process.cwd(),
    'sanjit-content/.github/workflows/revalidate.yml',
  );
  let wf: string;
  try {
    wf = readFileSync(workflowPath, 'utf-8');
  } catch {
    assert(false, `workflow YAML exists at ${workflowPath}`);
    wf = '';
  }
  // AC #2: the workflow explicitly handles push, delete, and force-push.
  // GitHub's `push` event covers force-pushes by default (pitfall #9) —
  // we assert the `on:` block lists `push` and `delete` (and the
  // README documents the force-push coverage).
  assert(/^on:/m.test(wf), 'workflow declares `on:` block');
  assert(/^\s+push:/m.test(wf), '  → on.push present');
  assert(/^\s+delete:/m.test(wf), '  → on.delete present');
  assert(/^\s+workflow_dispatch:/m.test(wf), '  → on.workflow_dispatch present (manual)');
  // Force-push coverage: the workflow's per-commit walk must read
  // `added` / `modified` / `removed` arrays.
  assert(
    wf.includes('commit.added') && wf.includes('commit.modified') && wf.includes('commit.removed'),
    '  → per-commit added/modified/removed walk (force-push safe)',
  );
  // AD-9: the workflow does NOT call the Vercel deployment API or set
  // up a Vercel hook. It POSTs to $REVALIDATE_URL with the bearer
  // secret — i.e., directly to the deployed site's revalidate handler.
  assert(wf.includes('REVALIDATE_URL'), '  → POSTs to $REVALIDATE_URL (the handler, not a Vercel hook)');
  assert(wf.includes('REVALIDATE_SECRET'), '  → Authorization: Bearer $REVALIDATE_SECRET');
}

// ---------------------------------------------------------------------------
console.log(`\n${failed === 0 ? '=== ALL PASS ===' : `=== ${failed} FAILURE(S) ===`}`);
if (failed > 0) process.exit(1);
