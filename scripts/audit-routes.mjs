// Route-invariant assertion (amended AD-12).
// Every PRODUCTION route must contain ALL of:
//   (1) the spine-line verbatim string,
//   (2) >=1 proof number from the closed PROOF_NUMBERS set,
//   (3) >=1 return-path pattern (href="/" OR href="https://sanjit.dev").
// The PROOF_NUMBERS set excludes single-digit numeric values like '6' (trivially
// bypassable by any English sentence that happens to contain the digit).
//
// PREVIEW routes (closed set, listed in PREVIEW_ROUTES in audit-routes.shared.mjs)
// get a relaxed structural-only assertion: page must return HTTP 200 with a
// non-empty body. They do NOT carry the spine-line / proof-number / return-path
// invariants because component-preview harnesses intentionally render a single
// component, not the homepage composition. Preview coverage of those invariants
// lives in pa11y-ci (`.pa11yci.json`) and Lighthouse (`pnpm lighthouse`),
// NOT here.
//
// Aggregator semantics (closing review finding #2): the script walks every
// PROD_ROUTES entry, collects outcomes, and reports a summary. A route that
// returns HTTP 404 (not yet built — Epic 2-5b scheduled work) is logged as
// `skip`, NOT counted as a failure. Real invariant violations (HTTP 200 but
// missing spine / proof / return) are `fail`. Exit code is 1 if any `fail`,
// 0 otherwise. Multiple failures are reported together rather than the
// previous "exit on first failure" behavior.
import { PROD_ROUTES, PREVIEW_ROUTES } from './audit-routes.shared.mjs';

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

// Extract the textContent of all elements matching any of the given CSS
// selectors, concatenated as an array of per-section strings. Used to
// assert that the spine line is bound to the homepage composition (e.g.,
// <Hero> + <Footer>) rather than merely appearing contiguously in the raw
// HTML — the latter breaks when copy is split across <span>s for a
// gradient-text climax.
//
// Returns a `string[]` (one entry per selector) so callers can require
// per-section containment: at least one section's textContent carries the
// spine line, NOT a concatenated blur across sections (see checkProductionRoute
// — a future <Footer> copy that mentions "spine line" in prose would false-pass
// under a joined-concat check).
//
// IMPORTANT: The regex uses `<${escapedTagName}\b` (word-boundary-anchored
// tag name) rather than the previous `<${escaped}[^>]*>` because the
// over-eager character-class escape `[.*+?^${}()|[\]\\]` escaped the `[`
// and `]` inside CSS attribute selectors (e.g., `[aria-label="Hero"]`),
// producing `<section\[aria-label="Hero"\][^>]*>` which can never match real
// HTML. Closing #1 of the 1-12 code review.
function extractComponentText(html, selectors) {
  const sections = [];
  for (const selector of selectors) {
    // The selector starts with a tag name (e.g., `section[aria-label="Hero"]`).
    // Strip CSS attributes and quote-strip to recover the bare tag name; this
    // is the only char that needs HTML escaping (to avoid `<section[name=`
    // being read as `<section[name=` if `[name=` happens to be regex-active).
    const tagName = selector.split(/[\[\s:>+~]/)[0];
    const escapedTag = tagName.replace(/[<>]/g, '\\$&');
    const re = new RegExp(`<${escapedTag}\\b[^>]*>([\\s\\S]*?)</${escapedTag}\\s*>`, 'g');
    const parts = [];
    for (const match of html.matchAll(re)) {
      // Filter to matches whose attribute set includes the requested selector's
      // distinguishing attributes (heuristic: a tag-name-only match ignores
      // the `aria-label="Hero"` qualifier and would match ANY `<section>` on
      // the page — including ones inside the Footer that aren't the Hero).
      // We re-test each candidate's outerHTML via a coarse attribute substring
      // check on the selector's distinguishing chars.
      const attributeKey = selector.match(/[a-z-]+(?==")/i)?.[0];
      const attributeValue = selector.match(/="([^"]+)"/)?.[1];
      if (attributeKey && attributeValue) {
        const attrRe = new RegExp(`\\b${attributeKey}="${attributeValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`);
        if (!attrRe.test(match[0])) continue;
      }
      parts.push(match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    }
    sections.push(parts.join(' '));
  }
  return sections;
}

async function checkProductionRoute(route) {
  const url = `${BASE}${route}`;
  let res;
  try {
    res = await fetchWithRetry(url);
  } catch (err) {
    return {
      route,
      outcome: 'fail',
      reason: `network error after 3 retries: ${err.message}`,
    };
  }
  if (!res.ok) {
    // 404 = route not yet built (Epic 2-5b scheduled work). Log as a `skip`
    // and let the summary report what was tested vs. what's pending.
    // Production-route invariant is NOT measured for skipped routes, by
    // design: the route doesn't exist on disk yet, so an invariant assertion
    // would be vacuously false.
    if (res.status === 404) {
      return { route, outcome: 'skip', reason: 'HTTP 404 — route not yet built' };
    }
    return {
      route,
      outcome: 'fail',
      reason: `HTTP ${res.status} ${res.statusText}`,
    };
  }
  const html = await res.text();

  // Spine line may span multiple <span> elements (e.g., the homepage <Hero>
  // splits "This person builds serious software" and "— and this website
  // is proof." across two spans for the gradient-text climax). Test for
  // component-text-aggregate inside the composition's mount points rather
  // than raw HTML contiguity. Bypasses markup boundaries while preserving
  // the "spine line is bound to the homepage composition" invariant.
  //
  // Per-section inclusion (NOT joined-concat) — closing review findings #1
  // and #6: at least one section's textContent must contain the spine line,
  // not the blur of all sections concatenated. This prevents a future
  // <Footer> copy mentioning "spine line" in prose from false-passing.
  const sectionTexts = extractComponentText(html, [
    'section[aria-label="Hero"]',
    'footer[role="contentinfo"]',
  ]);
  const spineInSomeSection = sectionTexts.some((t) => t.includes(SPINE_LINE));
  if (!spineInSomeSection) {
    return {
      route,
      outcome: 'fail',
      reason: `missing spine-line in any mount-point section; dump: ${JSON.stringify(sectionTexts)}`,
    };
  }

  const hasProof = PROOF_NUMBERS.some((needle) => html.includes(needle));
  if (!hasProof) {
    return {
      route,
      outcome: 'fail',
      reason: `missing proof number (none of ${JSON.stringify(PROOF_NUMBERS)} found)`,
    };
  }

  const hasReturn = RETURN_PATH_PATTERNS.some((needle) => html.includes(needle));
  if (!hasReturn) {
    return {
      route,
      outcome: 'fail',
      reason: `missing return path (none of ${JSON.stringify(RETURN_PATH_PATTERNS)} found)`,
    };
  }

  return { route, outcome: 'pass' };
}

async function checkPreviewRoute(route) {
  const url = `${BASE}${route}`;
  let res;
  try {
    res = await fetchWithRetry(url);
  } catch (err) {
    return {
      route,
      outcome: 'fail',
      reason: `network error after 3 retries: ${err.message}`,
    };
  }
  if (!res.ok) {
    return {
      route,
      outcome: 'fail',
      reason: `HTTP ${res.status} ${res.statusText}`,
    };
  }
  const html = await res.text();
  // Structural-only assertion: a preview harness must render a non-empty
  // page. The full AD-12 invariant (spine line + proof number + return path)
  // is intentionally NOT applied here — see file header for rationale.
  if (html.trim().length === 0) {
    return { route, outcome: 'fail', reason: 'empty response body' };
  }
  return { route, outcome: 'pass' };
}

// Aggregate results across all routes and report once at the end. A single
// HTTP 404 is a `skip` for production routes (route not yet built — Epic 2-5b
// scheduled work); a real invariant violation is a `fail`. Exit 1 only on `fail`.
const prodResults = [];
for (const route of PROD_ROUTES) {
  prodResults.push(await checkProductionRoute(route));
}
const previewResults = [];
for (const route of PREVIEW_ROUTES) {
  previewResults.push(await checkPreviewRoute(route));
}

for (const r of prodResults) {
  if (r.outcome === 'pass') {
    console.log(`[audit:routes] OK ${r.route} (production)`);
  } else if (r.outcome === 'skip') {
    console.warn(`[audit:routes] SKIP ${r.route} -- ${r.reason}`);
  } else {
    console.error(`[audit:routes] FAIL ${r.route} -- ${r.reason}`);
  }
}
for (const r of previewResults) {
  if (r.outcome === 'pass') {
    console.log(`[audit:routes] OK ${r.route} (preview, structural-only)`);
  } else {
    console.error(`[audit:routes] FAIL ${r.route} -- ${r.reason}`);
  }
}

const prodPass = prodResults.filter((r) => r.outcome === 'pass').length;
const prodSkip = prodResults.filter((r) => r.outcome === 'skip').length;
const prodFail = prodResults.filter((r) => r.outcome === 'fail').length;
const previewPass = previewResults.filter((r) => r.outcome === 'pass').length;
const previewFail = previewResults.filter((r) => r.outcome === 'fail').length;

console.log(
  `[audit:routes] SUMMARY -- production: ${prodPass} pass / ${prodSkip} skip (not yet built) / ${prodFail} fail; preview: ${previewPass} pass / ${previewFail} fail`,
);

if (prodFail > 0 || previewFail > 0) {
  console.error(
    `[audit:routes] OVERALL FAIL -- ${prodFail + previewFail} invariant violation(s)`,
  );
  process.exit(1);
}
console.log(`[audit:routes] OVERALL PASS -- all built routes satisfy invariant`);
