#!/usr/bin/env node
// scripts/audit-isr-ttl.mjs — Story 2-6 ISR TTL audit.
//
// Walks `app/**/page.tsx` and asserts every closed ISR route carries
// `export const revalidate = 300` (or any integer-valued revalidate
// under 600s — the spec calls out 300 specifically but accepts the
// family of values per FR-14). Fails the build on a missing or
// misconfigured TTL.
//
// Closed ISR route list: `scripts/audit-routes.shared.mjs#PROD_ROUTES`.
// The 5 preview routes (`app/preview/**`) are component harnesses with
// `metadata.robots = { index: false, follow: false }`; they are NOT
// user-facing ISR routes and are excluded from the audit.
//
// Output (per spine convention):
//   {"event":"isr-ttl.audit","ok":true,"routes_checked":N,"ttl_ms_avg":300000}
//   {"event":"isr-ttl.audit","ok":false,"violations":[...]}
//
// Exit 0 on all-pass; exit 1 on any violation. Run via `pnpm audit:isr-ttl`.

import { readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PROD_ROUTES } from './audit-routes.shared.mjs';

const SCRIPT_DIR = fileURLToPath(new URL('.', import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIR, '..');
const APP_DIR = resolve(PROJECT_ROOT, 'app');

// Map closed ISR route → expected app/**/page.tsx path.
function routeToPageFile(route) {
  if (route === '/') return join(APP_DIR, 'page.tsx');
  if (route === '/404') return join(APP_DIR, 'not-found.tsx'); // Next 16 404 file
  // All other routes: `app/<segment>/page.tsx`. We accept nested routes too
  // (e.g. `/recruiter/something` → `app/recruiter/something/page.tsx`) but
  // the closed route list has only top-level segments today.
  const trimmed = route.replace(/^\//, '');
  return join(APP_DIR, trimmed, 'page.tsx');
}

function logEvent(payload) {
  process.stdout.write(JSON.stringify(payload) + '\n');
}

function findTtlValue(source) {
  // Match: `export const revalidate = <number>` or `export const revalidate = '<number>'`
  // (the latter is unusual but Next.js tolerates it).
  const numericMatch = source.match(
    /^\s*export\s+const\s+revalidate\s*=\s*(\d+)\s*;?/m,
  );
  if (numericMatch) return Number(numericMatch[1]);

  // Match: `export const revalidate = <expression involving seconds>` —
  // we accept any single integer-valued revalidate under 600s (FR-14).
  // The string form is NOT accepted (the audit's job is to keep this
  // auditable, not to chase every Next.js syntax variant).
  return null;
}

const MAX_TTL_SECONDS = 600; // FR-14's "5-minute TTL fallback" — accept up to 10 min as a safety margin.

let checked = 0;
const violations = [];
const routeReports = [];

for (const route of PROD_ROUTES) {
  checked += 1;
  const pageFile = routeToPageFile(route);

  let exists = false;
  try {
    exists = statSync(pageFile).isFile();
  } catch {
    exists = false;
  }

  if (!exists) {
    // Route not yet shipped. The audit does NOT fail on missing files —
    // those land when E3/E4/E5a/E5b ship their respective routes. We
    // record this as a `pending` state in the report so a future
    // contributor can see which routes are outstanding.
    routeReports.push({
      route,
      page_file: relative(PROJECT_ROOT, pageFile),
      status: 'pending',
      ttl_seconds: null,
    });
    continue;
  }

  let source = '';
  try {
    source = readFileSync(pageFile, 'utf-8');
  } catch (err) {
    violations.push({
      route,
      page_file: relative(PROJECT_ROOT, pageFile),
      reason: 'failed to read page.tsx',
      error: err instanceof Error ? err.message : String(err),
    });
    continue;
  }

  const ttl = findTtlValue(source);
  if (ttl === null) {
    violations.push({
      route,
      page_file: relative(PROJECT_ROOT, pageFile),
      reason: 'missing `export const revalidate = N;`',
    });
    continue;
  }
  if (ttl <= 0 || ttl > MAX_TTL_SECONDS) {
    violations.push({
      route,
      page_file: relative(PROJECT_ROOT, pageFile),
      reason: `revalidate=${ttl}s is outside the (0, ${MAX_TTL_SECONDS}] window`,
      ttl_seconds: ttl,
    });
    continue;
  }

  routeReports.push({
    route,
    page_file: relative(PROJECT_ROOT, pageFile).split(sep).join('/'),
    status: 'ok',
    ttl_seconds: ttl,
  });
}

if (violations.length > 0) {
  process.stderr.write(
    '\n[isr-ttl.audit] FAIL -- ' +
      String(violations.length) +
      ' violation(s):\n' +
      violations
        .map((v, i) => `  ${String(i + 1)}. ${v.route} (${v.page_file}): ${v.reason}`)
        .join('\n') +
      '\n',
  );
  logEvent({
    event: 'isr-ttl.audit',
    ok: false,
    routes_checked: checked,
    violations,
    route_reports: routeReports,
  });
  process.exit(1);
}

logEvent({
  event: 'isr-ttl.audit',
  ok: true,
  routes_checked: checked,
  routes_ok: routeReports.filter((r) => r.status === 'ok').length,
  routes_pending: routeReports.filter((r) => r.status === 'pending').length,
  route_reports: routeReports,
});
