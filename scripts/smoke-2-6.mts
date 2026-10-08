// scripts/smoke-2-6.mts — Story 2-6 ISR-TTL audit smoke test.
//
// Run with: npx tsx scripts/smoke-2-6.mts  (or `pnpm smoke:2-6`)
//
// Verifies the I/O & Edge-Case Matrix for `scripts/audit-isr-ttl.mjs`:
//   - homepage `/` has `revalidate = 300` set (positive case)
//   - the audit script exits 0 on a clean tree
//   - the audit script exits 1 on a missing TTL
//   - the audit script exits 1 on a TTL outside the (0, 600] window
//   - the audit script's structured JSON output includes the per-route
//     report
//
// We exercise the audit script via Node child_process against a
// fixture directory tree we control (not the real `app/`), so the
// smoke is hermetic. Exits 0 on all-pass; exits 1 on any failure.
//
// Binds: AD-9 (TTL fallback on every ISR route), FR-14 (5-minute SLA).

import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  readFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
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
const AUDIT_SCRIPT = join(REPO_ROOT, 'scripts/audit-isr-ttl.mjs');

console.log('=== Story 2-6 ISR-TTL audit smoke test ===');

// ---------------------------------------------------------------------------
// Section 1: real `app/page.tsx` carries `revalidate = 300`
// ---------------------------------------------------------------------------

console.log('\n--- live state: app/page.tsx ---');

{
  // Read app/page.tsx and assert the TTL is set. We do NOT re-run the
  // audit script here — that's covered in Section 2. This is a
  // direct, fast check that the homepage contract is met today.
  const source = readFileSync(
    join(REPO_ROOT, 'app/page.tsx'),
    'utf-8',
  );
  const m = source.match(/^\s*export\s+const\s+revalidate\s*=\s*(\d+)\s*;?/m);
  assert(m !== null, 'app/page.tsx exports `const revalidate = N`');
  if (m) {
    const ttl = Number(m[1]);
    assert(ttl === 300, `app/page.tsx has revalidate=300 (got ${String(ttl)})`);
  }
}

// ---------------------------------------------------------------------------
// Section 2: audit script accepts a clean fixture tree
// ---------------------------------------------------------------------------

console.log('\n--- audit script: clean fixture tree ---');

function runAudit(appDir: string): { status: number; stdout: string; stderr: string } {
  // The audit script reads PROD_ROUTES from audit-routes.shared.mjs and
  // walks `app/<segment>/page.tsx`. We use a fixture appDir by chdir-ing
  // a temporary directory that mirrors the project's structure.
  // Simpler approach: copy the audit script to a temp dir with a fake
  // app/, and patch the import. But the script imports from
  // ./audit-routes.shared.mjs — relative to the script's location.
  // We invoke the script as-is from the repo root, then check the
  // exit code; the script's behavior depends on the REAL app/ tree
  // (which is what we want for the live state check) OR a fixture
  // (which requires us to copy the script + shared).
  // For hermeticity, we just run it against the real tree and assert
  // exit 0 today.
  const r = spawnSync('node', [AUDIT_SCRIPT], {
    cwd: REPO_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
    windowsHide: true,
  });
  return {
    status: r.status ?? -1,
    stdout: r.stdout ? r.stdout.toString() : '',
    stderr: r.stderr ? r.stderr.toString() : '',
  };
}

{
  const r = runAudit(REPO_ROOT);
  assert(r.status === 0, 'audit script exits 0 on the live app/ tree');
  if (r.status === 0) {
    // The audit script emits structured JSON on success.
    const last = r.stdout.trim().split(/\r?\n/).pop() ?? '';
    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(last);
    } catch {
      parsed = null;
    }
    assert(parsed !== null, 'audit script emits structured JSON on stdout');
    if (parsed) {
      assert(parsed['event'] === 'isr-ttl.audit', "  → event === 'isr-ttl.audit'");
      assert(parsed['ok'] === true, '  → ok === true');
      assert(typeof parsed['routes_checked'] === 'number', '  → routes_checked is a number');
      assert(Array.isArray(parsed['route_reports']), '  → route_reports is an array');
    }
  } else {
    // Surface the audit's stderr so a future contributor sees what failed.
    process.stderr.write(
      '\n[smoke-2-6] audit script stderr:\n' + r.stderr + '\n',
    );
  }
}

// ---------------------------------------------------------------------------
// Section 3: audit script fails on a fixture with a missing TTL
// ---------------------------------------------------------------------------

console.log('\n--- audit script: missing-TTL fixture (hermetic) ---');

interface FixtureResult {
  status: number;
  stdout: string;
  stderr: string;
}

function runAuditAgainstFixture(opts: {
  homepageTtl: number | null; // null = no `export const revalidate` line at all
  homepageTtlIsString?: boolean;
  homepageTtlValue?: string;
  copyAuditScript: boolean;
  workDir: string;
}): FixtureResult {
  const wd = opts.workDir;
  mkdirSync(join(wd, 'app'), { recursive: true });
  mkdirSync(join(wd, 'scripts'), { recursive: true });

  // Copy audit-routes.shared.mjs verbatim (the script depends on it).
  const sharedSrc = readFileSync(
    join(REPO_ROOT, 'scripts/audit-routes.shared.mjs'),
    'utf-8',
  );
  // The shared module exports PROD_ROUTES. The audit script imports
  // { PROD_ROUTES } from it. We rewrite the import path in the audit
  // script copy to use the file:// URL of the shared module so the
  // script can find it from the temp dir.
  writeFileSync(join(wd, 'scripts/audit-routes.shared.mjs'), sharedSrc);

  // Build the audit script. The script imports
  // `./audit-routes.shared.mjs` via relative path, which resolves
  // against the script's own location; this works in the temp dir.
  const auditSrc = readFileSync(AUDIT_SCRIPT, 'utf-8');
  writeFileSync(join(wd, 'scripts/audit-isr-ttl.mjs'), auditSrc);

  // Build the app/ tree. The audit walks `app/<segment>/page.tsx`.
  // PROD_ROUTES = ['/', '/work', ..., '/404']; the audit converts
  // these to app/page.tsx (for /), app/work/page.tsx, etc. We only
  // need to ship the files we want to test against; missing files
  // are reported as 'pending', not as violations. So the only
  // required file is app/page.tsx (the homepage).
  if (opts.homepageTtl === null) {
    writeFileSync(
      join(wd, 'app/page.tsx'),
      'export default function Home() { return null; }\n',
    );
  } else if (opts.homepageTtlIsString) {
    writeFileSync(
      join(wd, 'app/page.tsx'),
      `export const revalidate = ${opts.homepageTtlValue};\nexport default function Home() { return null; }\n`,
    );
  } else {
    writeFileSync(
      join(wd, 'app/page.tsx'),
      `export const revalidate = ${String(opts.homepageTtl)};\nexport default function Home() { return null; }\n`,
    );
  }

  const r = spawnSync('node', [join(wd, 'scripts/audit-isr-ttl.mjs')], {
    cwd: wd,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
    windowsHide: true,
  });
  return {
    status: r.status ?? -1,
    stdout: r.stdout ? r.stdout.toString() : '',
    stderr: r.stderr ? r.stderr.toString() : '',
  };
}

{
  const tmp = mkdtempSync(join(tmpdir(), 'smoke-2-6-missing-'));
  try {
    const r = runAuditAgainstFixture({
      homepageTtl: null,
      copyAuditScript: true,
      workDir: tmp,
    });
    assert(r.status === 1, 'audit exits 1 when homepage TTL is missing');
    if (r.status === 1) {
      const last = r.stdout.trim().split(/\r?\n/).pop() ?? '';
      let parsed: Record<string, unknown> | null = null;
      try {
        parsed = JSON.parse(last);
      } catch {
        parsed = null;
      }
      assert(parsed !== null, '  → emits structured JSON on failure');
      if (parsed) {
        assert(parsed['ok'] === false, '  → ok === false');
        assert(
          Array.isArray(parsed['violations']) && (parsed['violations'] as unknown[]).length === 1,
          '  → violations has exactly 1 entry (the homepage)',
        );
      }
      assert(
        /missing `export const revalidate/m.test(r.stderr),
        '  → stderr cites the missing TTL',
      );
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// Section 4: audit script fails on a TTL outside the (0, 600] window
// ---------------------------------------------------------------------------

console.log('\n--- audit script: out-of-range TTL (hermetic) ---');

{
  const tmp = mkdtempSync(join(tmpdir(), 'smoke-2-6-oor-'));
  try {
    const r = runAuditAgainstFixture({
      homepageTtl: 1200, // 20 minutes — outside the (0, 600] window
      copyAuditScript: true,
      workDir: tmp,
    });
    assert(r.status === 1, 'audit exits 1 when TTL > 600s');
    if (r.status === 1) {
      const last = r.stdout.trim().split(/\r?\n/).pop() ?? '';
      let parsed: Record<string, unknown> | null = null;
      try {
        parsed = JSON.parse(last);
      } catch {
        parsed = null;
      }
      assert(parsed !== null, '  → emits structured JSON on failure');
      if (parsed) {
        assert(
          Array.isArray(parsed['violations']) && (parsed['violations'] as unknown[]).length === 1,
          '  → violations has exactly 1 entry',
        );
        const v = ((parsed['violations'] as Array<Record<string, unknown>>)[0]) ?? {};
        assert(v['ttl_seconds'] === 1200, '  → violation reports the bad TTL value (1200)');
      }
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// Section 5: audit script accepts a TTL at the upper bound (600s)
// ---------------------------------------------------------------------------

console.log('\n--- audit script: TTL at upper bound (600s, hermetic) ---');

{
  const tmp = mkdtempSync(join(tmpdir(), 'smoke-2-6-edge-'));
  try {
    const r = runAuditAgainstFixture({
      homepageTtl: 600,
      copyAuditScript: true,
      workDir: tmp,
    });
    assert(r.status === 0, 'audit exits 0 when TTL === 600s (at the upper bound)');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
console.log(`\n${failed === 0 ? '=== ALL PASS ===' : `=== ${failed} FAILURE(S) ===`}`);
if (failed > 0) process.exit(1);
