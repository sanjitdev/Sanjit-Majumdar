// Gzip-budget assertion (FR-20).
// Homepage: < 100 KB gzipped. Any other route: < 200 KB gzipped.
//
// Aggregator semantics (closing review finding #2, 1-12-foundation-closeout):
// Walks every PROD_ROUTES + PREVIEW_ROUTES entry, collects outcomes, reports
// a summary. A route that returns HTTP 404 (not yet built — Epic 2-5b
// scheduled work) is logged as `skip`, NOT counted as a failure. A route that
// returns HTTP 200 but exceeds the gzip budget is `fail`. Exit code is 1 if
// any `fail`, 0 otherwise. Multiple failures are reported together rather
// than the previous "exit on first violation" behavior.
//
// The PROD/PREVIEW split mirrors scripts/audit-routes.mjs so the two audit
// passes share the same aggregator contract and reporting style. Audit-budget
// applies the SAME threshold to both production and preview routes
// (preview harnesses render a single component, so they should easily fit
// under OTHER_THRESHOLD = 200 KB; if a preview grows past 200 KB that's a
// real budget regression worth flagging).
import { gzipSync } from 'node:zlib';
import { PROD_ROUTES, PREVIEW_ROUTES } from './audit-routes.shared.mjs';

const PORT = process.env.PORT ?? '3000';
const BASE = `http://localhost:${PORT}`;

const HOMEPAGE_THRESHOLD = 102400; // 100 KB
const OTHER_THRESHOLD = 204800; // 200 KB

async function fetchWithRetry(url, attempts = 3) {
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fetch(url);
    } catch (err) {
      lastErr = err;
      if (i < attempts) {
        await new Promise((r) => setTimeout(r, 1000 * i));
      }
    }
  }
  throw lastErr;
}

async function checkRoute(route) {
  const url = `${BASE}${route}`;
  let res;
  try {
    res = await fetchWithRetry(url);
  } catch (err) {
    return {
      route,
      outcome: 'fail',
      reason: `network error after 3 retries: ${err.message} (is 'pnpm start' running on port ${PORT}? the workflow's health-check must pass first)`,
    };
  }
  if (!res.ok) {
    // 404 = route not yet built (Epic 2-5b scheduled work). Log as a `skip`
    // and let the summary report what was tested vs. what's pending.
    // Production-route budget is NOT measured for skipped routes, by design:
    // the route doesn't exist on disk yet, so a budget assertion would be
    // vacuously false.
    if (res.status === 404) {
      return { route, outcome: 'skip', reason: 'HTTP 404 — route not yet built' };
    }
    return {
      route,
      outcome: 'fail',
      reason: `HTTP ${res.status} ${res.statusText}`,
    };
  }
  const body = Buffer.from(await res.arrayBuffer());
  const gzipped = gzipSync(body).length;
  const threshold = route === '/' ? HOMEPAGE_THRESHOLD : OTHER_THRESHOLD;
  const thresholdLabel = route === '/' ? '100 KB' : '200 KB';
  if (gzipped >= threshold) {
    return {
      route,
      outcome: 'fail',
      reason: `gzipped ${gzipped} bytes >= ${threshold} bytes (${thresholdLabel})`,
    };
  }
  return {
    route,
    outcome: 'pass',
    detail: `${gzipped} bytes < ${threshold} bytes (${thresholdLabel})`,
  };
}

// Aggregate results across all routes and report once at the end. A single
// HTTP 404 is a `skip` for both production and preview routes (route not yet
// built — Epic 2-5b scheduled work); a real budget violation is a `fail`.
// Exit 1 only on `fail`.
const allResults = [];
for (const route of PROD_ROUTES) {
  allResults.push({ route, kind: 'production', ...(await checkRoute(route)) });
}
for (const route of PREVIEW_ROUTES) {
  allResults.push({ route, kind: 'preview', ...(await checkRoute(route)) });
}

for (const r of allResults) {
  const kindLabel = r.kind === 'production' ? 'production' : 'preview, structural-only';
  if (r.outcome === 'pass') {
    console.log(`[audit:budget] OK ${r.route} (${kindLabel}) -- ${r.detail}`);
  } else if (r.outcome === 'skip') {
    console.warn(`[audit:budget] SKIP ${r.route} -- ${r.reason}`);
  } else {
    console.error(`[audit:budget] FAIL ${r.route} -- ${r.reason}`);
  }
}

const passCount = allResults.filter((r) => r.outcome === 'pass').length;
const skipCount = allResults.filter((r) => r.outcome === 'skip').length;
const failCount = allResults.filter((r) => r.outcome === 'fail').length;

console.log(
  `[audit:budget] SUMMARY -- ${passCount} pass / ${skipCount} skip (not yet built) / ${failCount} fail`,
);

if (failCount > 0) {
  console.error(`[audit:budget] OVERALL FAIL -- ${failCount} budget violation(s)`);
  process.exit(1);
}
console.log(`[audit:budget] OVERALL PASS -- all built routes within gzip budget`);