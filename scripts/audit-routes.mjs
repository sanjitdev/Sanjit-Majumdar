// Route-invariant assertion (amended AD-12).
// Every public route must contain ALL of:
//   (1) the spine-line verbatim string,
//   (2) >=1 proof number from the closed PROOF_NUMBERS set,
//   (3) >=1 return-path pattern (href="/" OR href="https://sanjit.dev").
// The PROOF_NUMBERS set excludes single-digit numeric values like '6' (trivially
// bypassable by any English sentence that happens to contain the digit).
// Script exits non-zero on first violation.
import { AUDIT_ROUTES } from './audit-routes.shared.mjs';

const PORT = process.env.PORT ?? '3000';
const BASE = `http://localhost:${PORT}`;

const SPINE_LINE = 'This person builds serious software \u2014 and this website is proof.';
const PROOF_NUMBERS = ['7+', '10K+', '35%', '22h', '1.2M', '\u221268%', '7-person', '8+ years'];
const RETURN_PATH_PATTERNS = ['href="/"', 'href="https://sanjit.dev"'];

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
      `[audit:routes] FAIL ${route} -- network error after 3 retries: ${err.message}`,
    );
    console.error(
      `  (is 'pnpm start' running on port ${PORT}? the workflow's health-check must pass first)`,
    );
    process.exit(1);
  }
  if (!res.ok) {
    console.error(`[audit:routes] FAIL ${route} -- HTTP ${res.status} ${res.statusText}`);
    process.exit(1);
  }
  const html = await res.text();

  if (!html.includes(SPINE_LINE)) {
    console.error(`[audit:routes] FAIL ${route} -- missing spine-line substring`);
    process.exit(1);
  }

  const hasProof = PROOF_NUMBERS.some((needle) => html.includes(needle));
  if (!hasProof) {
    console.error(
      `[audit:routes] FAIL ${route} -- missing proof number (none of ${JSON.stringify(PROOF_NUMBERS)} found)`,
    );
    process.exit(1);
  }

  const hasReturn = RETURN_PATH_PATTERNS.some((needle) => html.includes(needle));
  if (!hasReturn) {
    console.error(
      `[audit:routes] FAIL ${route} -- missing return path (none of ${JSON.stringify(RETURN_PATH_PATTERNS)} found)`,
    );
    process.exit(1);
  }

  console.log(`[audit:routes] OK ${route}`);
}

for (const route of AUDIT_ROUTES) {
  await checkRoute(route);
}

console.log(`[audit:routes] PASS -- ${AUDIT_ROUTES.length} routes satisfy invariant`);
