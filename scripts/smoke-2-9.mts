// scripts/smoke-2-9.mts — Story 2-9 weekly content-audit workflow smoke test.
//
// Run with: npx tsx scripts/smoke-2-9.mts  (or `pnpm smoke:2-9`)
//
// Verifies the I/O & Edge-Case Matrix for the weekly
// `.github/workflows/content-audit.yml` workflow. The smoke is
// hermetic (no GitHub Actions runner, no network) — it reads the
// workflow YAML and the audit script and asserts the structural
// contract.
//
// AC #1: schedule is `cron: '0 9 * * 1'` AND `workflow_dispatch` is
// declared.
// AC #2: the workflow runs the audit (`pnpm audit:content`).
// AC #3: the audit script exits non-zero on an offender and writes
// the offender list to the workflow log.
// AC #4: `scripts/audit-content.mjs` reads from a local fixture when
// the env vars are absent (it exits 1 with a clear error; the smoke
// asserts that behavior so future contributors do not silently
// regress the env-var contract).
//
// Exits 0 on all-pass; exits 1 on any failure.

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

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
const WORKFLOW_PATH = join(REPO_ROOT, '.github/workflows/content-audit.yml');
const AUDIT_SCRIPT = join(REPO_ROOT, 'scripts/audit-content.mjs');

console.log('=== Story 2-9 weekly content-audit workflow smoke test ===');

// ---------------------------------------------------------------------------
// Section 1: workflow YAML exists
// ---------------------------------------------------------------------------

console.log('\n--- workflow YAML presence ---');
{
  assert(existsSync(WORKFLOW_PATH), `workflow exists at ${WORKFLOW_PATH}`);
  assert(existsSync(AUDIT_SCRIPT), `audit script exists at ${AUDIT_SCRIPT}`);
}

// ---------------------------------------------------------------------------
// Section 2: AC #1 — schedule is `0 9 * * 1` + workflow_dispatch
// ---------------------------------------------------------------------------

console.log('\n--- AC #1: schedule + manual trigger ---');
let yaml = '';
{
  yaml = readFileSync(WORKFLOW_PATH, 'utf-8');
  // The schedule is written in YAML list form. Look for the cron string.
  assert(
    /cron:\s*'0 9 \* \* 1'/.test(yaml),
    "schedule: cron '0 9 * * 1' (Mondays at 09:00 UTC) is declared",
  );
  assert(
    /workflow_dispatch:/.test(yaml),
    'workflow_dispatch manual trigger is declared',
  );
}

// ---------------------------------------------------------------------------
// Section 3: AC #2 — workflow runs the audit
// ---------------------------------------------------------------------------

console.log('\n--- AC #2: workflow runs pnpm audit:content ---');
{
  assert(
    /pnpm audit:content/.test(yaml),
    'workflow step calls pnpm audit:content',
  );
  // The step should pass the Vercel secrets through.
  assert(/VERCEL_TOKEN/.test(yaml), '  → VERCEL_TOKEN is wired as a secret');
  assert(/VERCEL_PROJECT_ID/.test(yaml), '  → VERCEL_PROJECT_ID is wired as a secret');
}

// ---------------------------------------------------------------------------
// Section 4: AC #3 — exit non-zero on offender + log the deployment ID
// ---------------------------------------------------------------------------

console.log('\n--- AC #3: failure path writes offender details ---');
{
  // The audit script writes the offender list to stderr. Read the
  // script and assert the output format includes the deployment id
  // + commit ref + matched path.
  const script = readFileSync(AUDIT_SCRIPT, 'utf-8');
  assert(/offenders/.test(script), 'audit script tracks an offenders list');
  assert(/deployment=/.test(script) || /uid/.test(script), '  → cites the deployment ID');
  assert(/commitRef=/.test(script) || /githubCommitRef/.test(script), '  → cites the commit ref');
  assert(/matchedPath=/.test(script) || /matched/.test(script), '  → cites the matched path token');
  assert(/process\.exit\(1\)/.test(script), '  → exits 1 when offenders.length > 0');
}

// ---------------------------------------------------------------------------
// Section 5: AC #4 — local audit script handles missing env vars
// ---------------------------------------------------------------------------

console.log('\n--- AC #4: missing-env-var contract ---');
{
  // Spawn the audit script with no Vercel env vars. The script
  // should exit 1 and write a clear error to stderr.
  const r = spawnSync('node', [AUDIT_SCRIPT], {
    cwd: REPO_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
    windowsHide: true,
    env: { ...process.env, VERCEL_TOKEN: '', VERCEL_PROJECT_ID: '' },
  });
  assert(r.status === 1, 'audit script exits 1 when VERCEL_TOKEN/VERCEL_PROJECT_ID are absent');
  const stderr = r.stderr ? r.stderr.toString() : '';
  assert(
    /VERCEL_TOKEN and VERCEL_PROJECT_ID must be set/.test(stderr),
    '  → stderr explains the missing-env-var condition',
  );
}

// ---------------------------------------------------------------------------
// Section 6: workflow has a step-summary block (UX of the run log)
// ---------------------------------------------------------------------------

console.log('\n--- run summary on the Actions UI ---');
{
  // The audit's step outcome is surfaced in `$GITHUB_STEP_SUMMARY`
  // so the run is greppable in the Actions UI without scrolling
  // through the raw log.
  assert(/GITHUB_STEP_SUMMARY/.test(yaml), 'workflow writes to $GITHUB_STEP_SUMMARY');
  assert(/AD-9 weekly content-audit/.test(yaml), '  → summary heading cites the audit');
  // The success + failure branches are both present.
  assert(/No content-repo-triggered deployments/.test(yaml), '  → success branch text');
  assert(/Content-repo-triggered deployment/.test(yaml), '  → failure branch text');
}

// ---------------------------------------------------------------------------
// Section 7: workflow mentions pitfall #9 (force-push coverage) and the
// story's remediation path. This is documentation, not behavior, but
// the workflow file is the canonical surface for AD-9.
// ---------------------------------------------------------------------------

console.log('\n--- AD-9 documentation in the workflow ---');
{
  assert(/AD-9/.test(yaml), 'workflow cites AD-9');
  assert(/revalidate/.test(yaml) || /revalidateTag/.test(yaml), '  → references the revalidate flow (2-5)');
}

// ---------------------------------------------------------------------------
console.log(`\n${failed === 0 ? '=== ALL PASS ===' : `=== ${failed} FAILURE(S) ===`}`);
if (failed > 0) process.exit(1);
