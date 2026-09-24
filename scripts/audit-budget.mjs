// Gzip-budget assertion (FR-20).
// Homepage: < 100 KB gzipped. Any other route: < 200 KB gzipped.
// Script exits non-zero on first violation so CI fails fast.
import { gzipSync } from 'node:zlib';
import { AUDIT_ROUTES } from './audit-routes.shared.mjs';

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
    console.error(
      `[audit:budget] FAIL ${route} -- network error after 3 retries: ${err.message}`,
    );
    console.error(
      `  (is 'pnpm start' running on port ${PORT}? the workflow's health-check must pass first)`,
    );
    process.exit(1);
  }
  if (!res.ok) {
    console.error(`[audit:budget] FAIL ${route} -- HTTP ${res.status} ${res.statusText}`);
    process.exit(1);
  }
  const body = Buffer.from(await res.arrayBuffer());
  const gzipped = gzipSync(body).length;
  const threshold = route === '/' ? HOMEPAGE_THRESHOLD : OTHER_THRESHOLD;
  const thresholdLabel = route === '/' ? '100 KB' : '200 KB';
  if (gzipped >= threshold) {
    console.error(
      `[audit:budget] FAIL ${route} -- gzipped ${gzipped} bytes >= ${threshold} bytes (${thresholdLabel})`,
    );
    process.exit(1);
  }
  console.log(
    `[audit:budget] OK ${route} -- ${gzipped} bytes < ${threshold} bytes (${thresholdLabel})`,
  );
}

for (const route of AUDIT_ROUTES) {
  await checkRoute(route);
}

console.log(`[audit:budget] PASS -- ${AUDIT_ROUTES.length} routes within budget`);
