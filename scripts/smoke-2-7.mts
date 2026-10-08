// scripts/smoke-2-7.mts — Story 2-7 canonical-model pattern stub smoke test.
//
// Run with: npx tsx scripts/smoke-2-7.mts  (or `pnpm smoke:2-7`)
//
// Verifies the I/O & Edge-Case Matrix for the pre-published
// `canonical-model` pattern stub at
// `sanjit-content/content/patterns/canonical-model.mdx`:
//
//   - the file exists
//   - the frontmatter parses via PatternSchema (lib/content/pattern.ts)
//   - the file's heading set includes `move-1`, `move-2`, `move-3`,
//     `when-not` (the AD-4 binding IDs)
//   - the body content carries the move names (not just blank stubs)
//
// Per the work-item notes, the AD-4 heading-ID audit hook lives in
// story 3.3 (the citation walker), not here. This smoke proves the
// stub itself conforms to the AD-4 contract — the audit that FAILS the
// build on a violation is a 3.3 concern.
//
// Exits 0 on all-pass; exits 1 on any failure.

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseFrontmatter } from '../lib/content/reader.ts';
import { parsePatternEntry } from '../lib/content/pattern.ts';
import { PatternSchema } from '../lib/content/pattern.ts';

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed++;
  } else {
    console.log(`  ok: ${msg}`);
  }
}

const REPO_ROOT = resolve(process.cwd());
const STUB_PATH = join(
  REPO_ROOT,
  'sanjit-content/content/patterns/canonical-model.mdx',
);

console.log('=== Story 2-7 canonical-model pattern stub smoke test ===');

// ---------------------------------------------------------------------------
// Section 1: file exists
// ---------------------------------------------------------------------------

console.log('\n--- stub file presence ---');
{
  assert(existsSync(STUB_PATH), `stub exists at ${STUB_PATH}`);
}

// ---------------------------------------------------------------------------
// Section 2: frontmatter parses via PatternSchema
// ---------------------------------------------------------------------------

console.log('\n--- frontmatter parses via PatternSchema ---');
let source = '';
let parsed: { frontmatter: unknown; body: string } | null = null;
{
  source = readFileSync(STUB_PATH, 'utf-8');
  parsed = parseFrontmatter(source);
  assert(parsed !== null, 'parseFrontmatter returns a result');
  assert(typeof parsed.frontmatter === 'object', '  → frontmatter is an object');
}

// ---------------------------------------------------------------------------
// Section 3: parsePatternEntry accepts the parsed frontmatter
// ---------------------------------------------------------------------------

console.log('\n--- parsePatternEntry accepts the stub ---');
{
  const result = parsePatternEntry(STUB_PATH, parsed!.frontmatter);
  assert(result.ok === true, 'parsePatternEntry → ok');
  if (result.ok) {
    assert(result.data.status === 'published', '  → status === "published"');
    assert(typeof result.data.title === 'string', '  → title is a string');
    assert(result.data.title === 'Canonical Model', '  → title === "Canonical Model"');
    assert(result.data.slug === 'canonical-model', '  → slug === "canonical-model"');
  }
}

// ---------------------------------------------------------------------------
// Section 4: AD-4 heading-ID contract — the rendered headings must
// include `move-1`, `move-2`, `move-3`, `when-not`.
// ---------------------------------------------------------------------------

console.log('\n--- AD-4 heading-ID contract (binding) ---');
{
  // The stub uses Markdown `## Heading {#id}` form; `rehype-slug`
  // produces the `<h2 id="id">` form. We assert the BINDING IDs are
  // present in the source as `{#id}` markers (which is what the MDX
  // layer reads to assign the `id` attribute). The full `<h2 id="...">`
  // validation is story 3.3's audit hook.
  const REQUIRED_IDS = ['move-1', 'move-2', 'move-3', 'when-not'];
  for (const id of REQUIRED_IDS) {
    const re = new RegExp('{#' + id + '\\}');
    assert(re.test(source!), `  → binding id \`{#${id}}\` present in source`);
  }

  // Counter-line block lives at `## When NOT to use it {#when-not}` —
  // assert the `When NOT` text is present (so the counter-line is
  // visible, not just a heading anchor with no body).
  assert(/^## When NOT to use it/m.test(source!), '  → "When NOT to use it" heading present');
}

// ---------------------------------------------------------------------------
// Section 5: stub body is non-empty and carries the move names
// ---------------------------------------------------------------------------

console.log('\n--- stub body content ---');
{
  assert(parsed!.body.length > 200, `body is non-trivial (${String(parsed!.body.length)} chars)`);
  for (const phrase of ['Name the entities', 'Define the boundary', 'Lock the closed sets']) {
    assert(parsed!.body.includes(phrase), `  → body contains "${phrase}"`);
  }
  // Counter-line lives under "When NOT to use it".
  assert(
    parsed!.body.includes('throwaway script') || parsed!.body.includes('one-shot migration'),
    '  → counter-line block has body content (not just the heading)',
  );
}

// ---------------------------------------------------------------------------
console.log(`\n${failed === 0 ? '=== ALL PASS ===' : `=== ${failed} FAILURE(S) ===`}`);
if (failed > 0) process.exit(1);
