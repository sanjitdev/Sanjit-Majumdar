// Story 2-3 reader smoke test. Run with: npx tsx scripts/smoke-2-3.mts
// Builds a temporary fixture directory under os.tmpdir() (so it doesn't
// pollute the repo), writes the I/O matrix rows, calls readContent(), and
// asserts every row. Exits 0 on all-pass; exits 1 on any failure.
//
// This file is the verification surface for step-03 — not a permanent test.
// A future CI-hardening story will move it under tests/ with vitest.

import {
  mkdtempSync,
  rmSync,
  mkdirSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { readContent, parseFrontmatter } from '../lib/content/reader.ts';

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed++;
  } else {
    console.log(`  ok: ${msg}`);
  }
}

// ---------------------------------------------------------------------------
// parseFrontmatter unit checks (covers the in-house parser directly)
// ---------------------------------------------------------------------------
console.log('=== Story 2-3 reader smoke test ===');
console.log('\n--- parseFrontmatter unit checks ---');

{
  const r = parseFrontmatter('---\n{"title":"x","status":"published"}\n---\nbody');
  assert(typeof r.frontmatter === 'object' && r.frontmatter !== null, 'parses JSON frontmatter');
  if (typeof r.frontmatter === 'object' && r.frontmatter !== null) {
    const o = r.frontmatter as Record<string, unknown>;
    assert(o.title === 'x', 'frontmatter title parsed');
    assert(o.status === 'published', 'frontmatter status parsed');
  }
  assert(r.body === 'body', 'body stripped of delimiters');
}

{
  const r = parseFrontmatter('# No frontmatter\njust markdown');
  assert(typeof r.frontmatter === 'object', 'no-delimiter returns object');
  assert(r.body.startsWith('# No frontmatter'), 'no-delimiter body preserved');
}

{
  const r = parseFrontmatter('---\n---\nbody');
  assert(typeof r.frontmatter === 'object', 'empty delimiters return object');
  assert(r.body === 'body', 'empty delimiters body preserved');
}

{
  const r = parseFrontmatter('---\nnot-json\n---\nbody');
  assert(typeof r.frontmatter === 'object', 'non-JSON falls back to empty object');
  assert(r.body === 'body', 'non-JSON body preserved');
}

{
  const r = parseFrontmatter('---\n{"a":1}\n---'); // unterminated body
  assert(typeof r.frontmatter === 'object', 'unterminated body parses frontmatter');
}

// ---------------------------------------------------------------------------
// readContent integration checks — fixture under tmpdir()
// ---------------------------------------------------------------------------

const tmpRoot = mkdtempSync(join(tmpdir(), 'smoke-2-3-'));
const contentRoot = join(tmpRoot, 'content');

// Build the typed-tag directories.
mkdirSync(join(contentRoot, 'case-studies'), { recursive: true });
mkdirSync(join(contentRoot, 'case-studies', 'subgroup'), { recursive: true });
mkdirSync(join(contentRoot, 'patterns'), { recursive: true });
mkdirSync(join(contentRoot, 'lab'), { recursive: true });
mkdirSync(join(contentRoot, 'projects'), { recursive: true });

// HAPPY_READ_PUBLISHED_SET (case-study)
writeFileSync(
  join(contentRoot, 'case-studies/wellbook.mdx'),
  '---\n{"title":"Wellbook","status":"published","slug":"wellbook","client":"Wellbook Co"}\n---\nbody',
);
// HAPPY_READ_DRAFT (case-study)
writeFileSync(
  join(contentRoot, 'case-studies/draft.mdx'),
  '---\n{"title":"Draft","status":"draft","slug":"draft"}\n---\nbody',
);
// PUBLISHED_MALFORMED_FRONIT (no slug — AD-5 fail)
writeFileSync(
  join(contentRoot, 'case-studies/bad.mdx'),
  '---\n{"title":"Bad","status":"published"}\n---\nbody',
);
// PUBLISHED_MISSING_TITLE
writeFileSync(
  join(contentRoot, 'case-studies/notitle.mdx'),
  '---\n{"status":"published","slug":"notitle"}\n---\nbody',
);
// MULTI_DEEP_PATH
writeFileSync(
  join(contentRoot, 'case-studies/subgroup/deep.mdx'),
  '---\n{"title":"Deep","status":"published","slug":"deep"}\n---\nbody',
);
// UNKNOWN_DIRECTORY (should be silently skipped)
mkdirSync(join(contentRoot, 'random'), { recursive: true });
writeFileSync(
  join(contentRoot, 'random/file.mdx'),
  '---\n{"title":"Random","status":"published","slug":"random"}\n---\nbody',
);
// NO_FRONITTER
writeFileSync(
  join(contentRoot, 'case-studies/nofront.mdx'),
  'just raw markdown\n',
);
// Pattern published
writeFileSync(
  join(contentRoot, 'patterns/canonical-model.mdx'),
  '---\n{"title":"Canonical Model","status":"published","slug":"canonical-model"}\n---\nbody',
);
// Lab published (production category)
writeFileSync(
  join(contentRoot, 'lab/tool.mdx'),
  '---\n{"title":"Tool","status":"published","slug":"tool","category":"production"}\n---\nbody',
);
// Project published
writeFileSync(
  join(contentRoot, 'projects/foo.mdx'),
  '---\n{"title":"Foo","status":"published","slug":"foo"}\n---\nbody',
);

// HAPPY_READ_NOW_SNAPSHOT (placeholder shape — tolerated)
writeFileSync(
  join(contentRoot, 'now-snapshot.json'),
  '{"entries":[],"last_updated":null}',
);

// SNAPSHOT_LAST_UPDATED_MISMATCH + bad CV are tested in the edge-case
// section below with isolated tmpdir() roots (so they don't pollute this
// integration fixture).

// HAPPY_READ_CV
writeFileSync(
  join(contentRoot, 'cv.md'),
  '---\n{"title":"CV","status":"published","summary":"Senior engineer","skills":["ts","react"]}\n---\n# Heading\nbody',
);

console.log('\n--- readContent integration checks ---');

const result = readContent({ contentRoot });

// --- AC1 / AC2: only published entries in published[] ---
{
  const tags = result.published.map((e) => e.tagSlug).sort();
  assert(
    tags.includes('case-study:wellbook'),
    'AC1: case-study:wellbook in published',
  );
  assert(
    tags.includes('case-study:deep'),
    'AC1: case-study:deep (multi-deep path) in published',
  );
  assert(
    tags.includes('pattern:canonical-model'),
    'AC1: pattern:canonical-model in published',
  );
  assert(tags.includes('lab:tool'), 'AC1: lab:tool in published');
  assert(tags.includes('project:foo'), 'AC1: project:foo in published');
  assert(tags.length === 5, `AC1: published has 5 entries (got ${tags.length})`);
}

// Drafts NOT in published
{
  const draftSlugs = result.drafts.map((e) => e.tagSlug);
  assert(draftSlugs.includes('case-study:draft'), 'AC1: case-study:draft in drafts');
  const inPublished = result.published.some((e) => e.tagSlug === 'case-study:draft');
  assert(!inPublished, 'AC1: drafts excluded from published');
}

// PUBLISHED_MALFORMED_FRONIT — diagnostic
{
  const hasBadDiag = result.diagnostics.some((d) =>
    d.includes('case-studies/bad.mdx') && d.includes('slug'),
  );
  assert(hasBadDiag, 'AC1: malformed published emits per-file diagnostic');
}

// PUBLISHED_MISSING_TITLE — diagnostic
{
  const hasTitleDiag = result.diagnostics.some((d) =>
    d.includes('case-studies/notitle.mdx') && d.includes('title'),
  );
  assert(hasTitleDiag, 'AC1: missing-title published emits diagnostic');
}

// publishedSet byTagSlug O(1) lookup
{
  const e = result.publishedSet.byTagSlug.get('case-study:wellbook');
  assert(!!e, 'publishedSet.byTagSlug has case-study:wellbook');
  assert(e?.path === 'case-studies/wellbook.mdx', 'byTagSlug entry has correct path');
  const deep = result.publishedSet.byTagSlug.get('case-study:deep');
  assert(!!deep, 'multi-deep path resolves via byTagSlug (last-segment slug)');
}

// publishedSet byPath lookup
{
  const e = result.publishedSet.byPath.get('case-studies/wellbook.mdx');
  assert(!!e, 'publishedSet.byPath has case-studies/wellbook.mdx');
}

// publishedSet frozen
{
  const frozen = Object.isFrozen(result.publishedSet);
  assert(frozen, 'publishedSet is frozen');
}

// UNKNOWN_DIRECTORY silently skipped
{
  const hasRandom = result.published.some((e) => e.tagSlug === 'case-study:random');
  assert(!hasRandom, 'unknown directory is silently skipped');
}

// NO_FRONITTER — treated as draft (no status claim)
{
  const hasNoFront = result.drafts.some((e) => e.tagSlug === 'case-study:nofront');
  assert(hasNoFront, 'no-frontmatter file appears in drafts');
}

// Snapshot placeholder tolerated
{
  assert(result.nowSnapshot !== null, 'nowSnapshot is non-null for placeholder');
  assert(
    result.nowSnapshot?.entries.length === 0,
    'placeholder has empty entries',
  );
  assert(
    result.nowSnapshot?.last_updated === null,
    'placeholder has last_updated: null',
  );
}

// CV parsed
{
  assert(result.cv !== null, 'cv is parsed for published CV');
  assert(result.cv?.data.summary === 'Senior engineer', 'cv summary parsed');
  assert(result.cv?.body.includes('# Heading'), 'cv body preserved');
  // CV NOT in published[] (bare-tag surface)
  const cvInPublished = result.published.some((e) => e.path === 'cv.md');
  assert(!cvInPublished, 'CV is NOT in published[] (bare-tag surface)');
}

// Drafts — published-set field exists
{
  assert(Array.isArray(result.published), 'published is an array');
  assert(Array.isArray(result.drafts), 'drafts is an array');
  assert(Array.isArray(result.diagnostics), 'diagnostics is an array');
}

// tagSlugs order
{
  assert(
    result.publishedSet.tagSlugs.length === result.published.length,
    'tagSlugs mirrors published length',
  );
}

// ---------------------------------------------------------------------------
// Edge cases — empty / missing root, snapshot mismatch, bad CV
// ---------------------------------------------------------------------------

console.log('\n--- readContent edge cases ---');

// Empty result for missing root
{
  const r = readContent({ contentRoot: join(tmpRoot, 'does-not-exist') });
  assert(r.diagnostics.length === 1, 'missing root → 1 diagnostic');
  assert(
    r.diagnostics[0].includes('content root not found'),
    'missing root diagnostic shape',
  );
  assert(r.published.length === 0, 'missing root → empty published');
}

// Non-directory root (treat as not found)
{
  const filePath = join(tmpRoot, 'not-a-dir.txt');
  writeFileSync(filePath, 'x');
  const r = readContent({ contentRoot: filePath });
  assert(r.diagnostics.length === 1, 'non-directory root → 1 diagnostic');
}

// Now-snapshot with valid entries + matching last_updated
{
  const root = mkdtempSync(join(tmpdir(), 'smoke-2-3-snap-ok-'));
  mkdirSync(root, { recursive: true });
  writeFileSync(
    join(root, 'now-snapshot.json'),
    '{"entries":[{"id":"n1","title":"a","status":"published","date":"2026-09-28T00:00:00Z","updated":"2026-09-28T00:00:00Z"}],"last_updated":"2026-09-28T00:00:00Z"}',
  );
  const r = readContent({ contentRoot: root });
  assert(
    r.nowSnapshot?.last_updated === '2026-09-28T00:00:00Z',
    'matching last_updated accepted',
  );
  assert(
    !r.diagnostics.some((d) => d.includes('last_updated does not match')),
    'matching last_updated emits no diagnostic',
  );
  rmSync(root, { recursive: true, force: true });
}

// Now-snapshot with mismatch
{
  const root = mkdtempSync(join(tmpdir(), 'smoke-2-3-snap-mm-'));
  mkdirSync(root, { recursive: true });
  writeFileSync(
    join(root, 'now-snapshot.json'),
    '{"entries":[{"id":"n1","title":"a","status":"published","date":"2026-09-28T00:00:00Z","updated":"2026-09-28T00:00:00Z"}],"last_updated":"2026-09-27T00:00:00Z"}',
  );
  const r = readContent({ contentRoot: root });
  assert(
    r.diagnostics.some((d) => d.includes('last_updated does not match')),
    'mismatched last_updated emits diagnostic',
  );
  rmSync(root, { recursive: true, force: true });
}

// Now-snapshot with bad JSON
{
  const root = mkdtempSync(join(tmpdir(), 'smoke-2-3-snap-bad-'));
  mkdirSync(root, { recursive: true });
  writeFileSync(join(root, 'now-snapshot.json'), 'not json');
  const r = readContent({ contentRoot: root });
  assert(
    r.diagnostics.some((d) => d.includes('invalid JSON')),
    'bad JSON snapshot emits diagnostic',
  );
  rmSync(root, { recursive: true, force: true });
}

// Now-snapshot with malformed entry (no id)
{
  const root = mkdtempSync(join(tmpdir(), 'smoke-2-3-snap-no-id-'));
  mkdirSync(root, { recursive: true });
  writeFileSync(
    join(root, 'now-snapshot.json'),
    '{"entries":[{"date":"2026-09-28T00:00:00Z","status":"published","updated":"2026-09-28T00:00:00Z"}],"last_updated":"2026-09-28T00:00:00Z"}',
  );
  const r = readContent({ contentRoot: root });
  assert(
    r.diagnostics.some((d) => d.includes('id')),
    'now-entry missing id emits diagnostic',
  );
  rmSync(root, { recursive: true, force: true });
}

// CV with malformed frontmatter
{
  const root = mkdtempSync(join(tmpdir(), 'smoke-2-3-cv-bad-'));
  mkdirSync(root, { recursive: true });
  writeFileSync(
    join(root, 'cv.md'),
    '---\n{"title":"CV","status":"published","experience":"not-an-array"}\n---\nbody',
  );
  const r = readContent({ contentRoot: root });
  assert(r.cv === null, 'malformed CV returns null');
  assert(
    r.diagnostics.some((d) => d.includes('cv.md')),
    'malformed CV emits diagnostic',
  );
  rmSync(root, { recursive: true, force: true });
}

// Partial content root (only case-studies exists)
{
  const root = mkdtempSync(join(tmpdir(), 'smoke-2-3-partial-'));
  mkdirSync(join(root, 'case-studies'), { recursive: true });
  writeFileSync(
    join(root, 'case-studies/only.mdx'),
    '---\n{"title":"Only","status":"published","slug":"only"}\n---\nbody',
  );
  const r = readContent({ contentRoot: root });
  assert(r.published.length === 1, 'partial root walks what exists');
  assert(r.nowSnapshot === null, 'partial root → null snapshot');
  assert(r.cv === null, 'partial root → null CV');
  rmSync(root, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------
rmSync(tmpRoot, { recursive: true, force: true });

console.log(`\n=== ${failed === 0 ? 'ALL PASS' : `${failed} FAILURES`} ===`);
process.exit(failed === 0 ? 0 : 1);