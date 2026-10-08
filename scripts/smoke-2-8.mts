// scripts/smoke-2-8.mts — Story 2-8 Vercel plan-tier audit smoke test.
//
// Run with: npx tsx scripts/smoke-2-8.mts  (or `pnpm smoke:2-8`)
//
// Verifies the audit document at
// `docs/run-notes/vercel-plan-audit-2026-10-08.md` exists and carries
// the five sections required by the story's AC #1, plus the citation
// block required by AC #2.
//
// This is a research-only story; the smoke is hermetic (no network).
// It reads the audit document from disk and asserts the structural
// shape, not the policy claims — those are reviewed by a human.
//
// Exits 0 on all-pass; exits 1 on any failure.

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

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
const AUDIT_PATH = join(REPO_ROOT, 'docs/run-notes/vercel-plan-audit-2026-10-08.md');

console.log('=== Story 2-8 Vercel plan-tier audit smoke test ===');

// ---------------------------------------------------------------------------
// Section 1: audit document exists
// ---------------------------------------------------------------------------

console.log('\n--- audit document presence ---');
{
  assert(existsSync(AUDIT_PATH), `audit exists at ${AUDIT_PATH}`);
}

// ---------------------------------------------------------------------------
// Section 2: AC #1 — five required sections
// ---------------------------------------------------------------------------

console.log('\n--- AC #1: five required sections ---');
let source = '';
{
  source = readFileSync(AUDIT_PATH, 'utf-8');

  // (a) Current plan tier (Hobby / Pro / Enterprise) — the audit
  // explicitly handles all three cases in its Recommendation section.
  assert(
    /Hobby/i.test(source) && /Pro/i.test(source) && /Enterprise/i.test(source),
    'audit discusses Hobby, Pro, and Enterprise tiers',
  );

  // (b) Memory ceiling for Node.js serverless functions on the tier.
  assert(/1024\s*MB/.test(source), 'audit cites the 1024 MB Hobby ceiling');
  assert(/3008\s*MB/.test(source), 'audit cites the 3008 MB Pro ceiling');

  // (c) Whether 1769 MB is achievable.
  assert(/1769\s*MB/.test(source), 'audit cites the 1769 MB AD-7 target');
  // The audit records the achievability verdict in the table
  // ("1769 MB achievable?") plus a per-tier verdict (Hobby: **No.** /
  // Pro: **Yes.** / Enterprise: **Yes.**).
  assert(
    /achievable\?/i.test(source) && /\*\*No\.\*\*/.test(source) && /\*\*Yes\.\*\*/.test(source),
    'audit records achievability per tier (Hobby No, Pro/Enterprise Yes)',
  );

  // (d) Cost of any required upgrade.
  assert(/\$20/i.test(source) || /\$240/i.test(source), 'audit cites the Pro plan cost ($20/month or $240/year)');

  // (e) Go / no-go decision for E4.3.
  assert(/Go for E4\.3/i.test(source), 'audit records the E4.3 go-decision');
  assert(
    /no-go|Recommendation|Recommendation/i.test(source),
    'audit records the recommendation structure',
  );
}

// ---------------------------------------------------------------------------
// Section 3: AC #2 — references Vercel's current docs with retrieval date
// ---------------------------------------------------------------------------

console.log('\n--- AC #2: Vercel docs cited with retrieval date ---');
{
  assert(/2026-10-08/.test(source), 'audit records a retrieval date (2026-10-08)');
  assert(/vercel\.com/.test(source), 'audit cites vercel.com URLs');
  assert(/Sources/i.test(source), 'audit has a Sources section');
  // AD-7 binding must be cited.
  assert(/AD-7/.test(source), 'audit cites the AD-7 binding');
  // Cold-start trade-off (AD-7 lists a 4-second budget).
  assert(/cold.start/i.test(source) || /Cold.start/i.test(source), 'audit discusses cold-start trade-offs');
}

// ---------------------------------------------------------------------------
// Section 4: AC #3 — surfaces the upgrade prompt for Hobby
// ---------------------------------------------------------------------------

console.log('\n--- AC #3: upgrade prompt for Hobby ---');
{
  // The TL;DR + Recommendation must mention the Hobby→Pro upgrade path.
  assert(/upgrade/i.test(source), 'audit discusses an upgrade path');
  assert(
    /Hobby[\s\S]{0,200}upgrade/i.test(source) || /Hobby[\s\S]{0,200}Pro/i.test(source),
    'audit mentions Hobby → Pro path',
  );
}

// ---------------------------------------------------------------------------
// Section 5: doc is committed to the repo
// ---------------------------------------------------------------------------

console.log('\n--- audit document is on disk (committed) ---');
{
  // Length sanity check — the audit should be substantive, not a stub.
  assert(source.length > 1500, `audit is substantive (${String(source.length)} chars)`);
  // The document should be Markdown.
  assert(/^#\s+/m.test(source), '  → has a top-level heading');
}

// ---------------------------------------------------------------------------
console.log(`\n${failed === 0 ? '=== ALL PASS ===' : `=== ${failed} FAILURE(S) ===`}`);
if (failed > 0) process.exit(1);
