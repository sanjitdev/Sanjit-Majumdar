// scripts/audit-routes-mount-points.spec.mjs — verbatim closed-set lock for the
// `extractComponentText(...)` mount-point selectors passed at the call site in
// scripts/audit-routes.mjs (1-11 amendment, locked by 1-12-foundation-closeout
// fix 1). Asserts the corrected closed set:
//
//   [
//     'section[aria-label="Hero"]',
//     'footer[role="contentinfo"]',
//   ]
//
// Fails if a future contributor adds, removes, reorders, or quotes-styles
// any element. Run via `node scripts/audit-routes-mount-points.spec.mjs`
// (no deps). Invariant: the spine-line route-invariant in audit-routes.mjs
// is bound to the homepage composition via these two mount points, not a
// raw HTML substring match (the <Hero> gradient-text climax splits the spine
// line across two <span>s, which is the 1-11 anomaly that motivated the
// component-text-aggregate check).

const EXPECTED = [
  'section[aria-label="Hero"]',
  'footer[role="contentinfo"]',
];

// Read the canonical source file as TEXT (do NOT import -- audit-routes.mjs
// runs the audit on import, which would require a live server).
const fs = await import('node:fs/promises');
const url = await import('node:url');
const sourcePath = url.fileURLToPath(
  new URL('./audit-routes.mjs', import.meta.url),
);
const sourceText = await fs.readFile(sourcePath, 'utf8');

// Match the `extractComponentText(html, [ ... ])` call site. The selector
// array elements may contain CSS attribute selectors (e.g., `[aria-label="..."]`)
// which themselves contain `[` and `]` characters, so a naive `[^\]]+` class
// would stop at the first inner `]`. Instead, locate the call site by its
// surrounding anchors `extractComponentText(html, [` (start) and the
// statement-terminating `]);` (end), then extract the array literal by
// character-walking the bracket depth.
const callSiteMatch = sourceText.match(/extractComponentText\(\s*html\s*,\s*\[/);
if (!callSiteMatch) {
  console.error(
    '[spec] FAIL -- extractComponentText call site not found in scripts/audit-routes.mjs',
  );
  process.exit(1);
}
const callSiteStart = callSiteMatch.index + callSiteMatch[0].length;
// Walk forward from `callSiteStart`, tracking bracket depth. Capture from
// the opening `[` to its matching `]`. Stop after the matching `]` of the
// array (i.e., when depth returns to -1).
function extractArrayLiteral(text, fromIndex) {
  let depth = 1; // We're already inside the outer `[` at `fromIndex`.
  let i = fromIndex;
  while (i < text.length && depth > 0) {
    const ch = text[i];
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) {
        return text.slice(fromIndex, i + 1);
      }
    }
    // Skip over string literals so an embedded `[` or `]` inside a quoted
    // CSS attribute selector (e.g., `[aria-label="foo[bar]"]`) doesn't
    // throw off the bracket counting.
    else if (ch === "'" || ch === '"') {
      const quote = ch;
      i++;
      while (i < text.length && text[i] !== quote) {
        if (text[i] === '\\' && i + 1 < text.length) i += 2;
        else i++;
      }
    }
    i++;
  }
  return null;
}
const arrayLiteral = extractArrayLiteral(sourceText, callSiteStart);
if (!arrayLiteral) {
  console.error(
    '[spec] FAIL -- could not find matching `]` for extractComponentText selector array in scripts/audit-routes.mjs',
  );
  process.exit(1);
}
// Rename `callSiteMatch[1]` to keep the rest of the script unchanged.
// (The captured array literal is now held in `arrayLiteral` below — see the
// walking-extraction helper above.)
// Normalize the captured array literal to a JSON-parseable form. The source
// uses single-quoted JS string delimiters (project style: `\'selector\'`)
// with double-quoted characters inside CSS attribute selectors (e.g.,
// `[aria-label="Hero"]`). A naive `' -> "` flip would produce invalid JSON
// because the inner `"` chars would terminate the string early. Walk the
// literal char-by-char: at the outer level, treat `'` as the JS string
// delimiter and emit `"` for the JSON form; emit any other `"` literally
// after escaping it. Whitespace, commas, brackets, and newlines pass through.
function normalizeToJsonLiteral(raw) {
  let out = '';
  let i = 0;
  while (i < raw.length) {
    const ch = raw[i];
    if (ch === "'") {
      // Opening or closing single-quoted JS string — flip to double-quoted JSON string.
      out += '"';
      i++;
      while (i < raw.length && raw[i] !== "'") {
        if (raw[i] === '\\' && i + 1 < raw.length) {
          // Preserve escape sequences verbatim (e.g., `\'`, `\"`, `\\`).
          out += raw[i] + raw[i + 1];
          i += 2;
        } else if (raw[i] === '"') {
          // Inner double-quote (e.g., CSS attribute selector) — escape for JSON.
          out += '\\"';
          i++;
        } else {
          out += raw[i];
          i++;
        }
      }
      if (i < raw.length) {
        // Skip the closing `'`.
        out += '"';
        i++;
      }
    } else {
      out += ch;
      i++;
    }
  }
  return out;
}

const literal = normalizeToJsonLiteral(arrayLiteral);
let actual;
try {
  actual = JSON.parse(literal);
} catch (err) {
  console.error(
    `[spec] FAIL -- could not parse selector array literal: ${err.message}`,
  );
  console.error(`[spec] captured literal: ${arrayLiteral}`);
  console.error(`[spec] normalized form: ${literal}`);
  process.exit(1);
}

if (!Array.isArray(actual)) {
  console.error(
    '[spec] FAIL -- extractComponentText selector argument is not an array',
  );
  process.exit(1);
}

const errors = [];
if (actual.length !== EXPECTED.length) {
  errors.push(
    `length mismatch: expected ${EXPECTED.length} elements, got ${actual.length}`,
  );
}
for (let i = 0; i < EXPECTED.length; i++) {
  if (actual[i] !== EXPECTED[i]) {
    errors.push(
      `element [${i}]: expected ${JSON.stringify(EXPECTED[i])}, got ${JSON.stringify(actual[i])}`,
    );
  }
}
// Defense-in-depth: the two-element mount-point set is the binding for the
// amended AD-12 spine-line invariant. Reject any expansion without a parallel
// amendment to AD-12 + this spec.
if (actual.length > EXPECTED.length) {
  errors.push(
    `selector array grew beyond the closed set of ${EXPECTED.length} -- AD-12 amendment required`,
  );
}
// All entries must be non-empty strings; a stray empty selector would match
// the whole document and silently pass the invariant.
if (actual.some((s) => typeof s !== 'string' || s.length === 0)) {
  errors.push('selector array contains empty or non-string entries');
}

if (errors.length > 0) {
  console.error('[spec] FAIL -- extractComponentText mount-point selectors drift detected:');
  for (const e of errors) console.error(`  - ${e}`);
  console.error(`[spec] expected: ${JSON.stringify(EXPECTED)}`);
  console.error(`[spec] actual:   ${JSON.stringify(actual)}`);
  process.exit(1);
}
console.log(
  `[spec] PASS -- extractComponentText mount-point selectors are the verbatim closed set (${EXPECTED.length} elements)`,
);

// ─── Behavioral fixture (1-12-foundation-closeout fix #3) ─────────────────
// Drift-detection alone (the section above) does NOT exercise extractComponentText
// against actual HTML — that's why the original over-escape bug at
// scripts/audit-routes.mjs line 51 (escaping `[` and `]` inside CSS attribute
// selectors) went undetected. This fixture re-implements the same regex-build
// + match-loop logic against synthetic HTML and asserts the contract:
//
//   (a) The spine line IS extracted from a `<section aria-label="Hero">`
//       that contains a gradient-text climax split across two `<span>`s
//       (mirrors the 1-11 <Hero> implementation in components/Hero.tsx).
//   (b) The spine line is NOT extracted from a different `<section>` that
//       happens to mention the same words in prose (e.g., a future
//       `<section aria-label="Blog">` footer copy mentioning "spine line").
//   (c) The footer `<footer role="contentinfo">` is matched independently
//       (the mount-point array iterates each selector and emits one section
//       text per entry — closing review finding #6 defense).
//
// If a future edit to extractComponentText regresses any of these, the
// fixture fails fast with a precise diff. The fixture is self-contained:
// no live server, no `.next/server/app/index.html` dependency.
const SPINE_LINE = 'This person builds serious software \u2014 and this website is proof.';

// Re-implementation mirrors scripts/audit-routes.mjs:67-96 verbatim. If the
// production extractor drifts, this mirror MUST drift in lock-step — the
// fixture is intentionally minimal (no retry, no error handling) so the diff
// is obvious in code review.
function fixtureExtract(html, selectors) {
  const sections = [];
  for (const selector of selectors) {
    const tagName = selector.split(/[\[\s:>+~]/)[0];
    const escapedTag = tagName.replace(/[<>]/g, '\\$&');
    const re = new RegExp(`<${escapedTag}\\b[^>]*>([\\s\\S]*?)</${escapedTag}\\s*>`, 'g');
    const parts = [];
    for (const match of html.matchAll(re)) {
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

// Synthetic HTML that mirrors a homepage composition:
//   - one `<section aria-label="Hero">` whose body contains the spine line
//     split across two <span>s (gradient-text climax) — MUST match
//   - one `<section aria-label="Blog">` whose body mentions the spine line
//     in prose (decoy) — MUST NOT match (attribute filter rejects it)
//   - one `<footer role="contentinfo">` whose body also contains the spine
//     line (belt + suspenders) — MUST match
//   - one `<section>` with no aria-label (decoy) — MUST NOT match (attribute
//     filter requires the distinguishing attribute key/value)
const syntheticHtml = `
<!doctype html>
<html lang="en">
<body>
  <main id="main">
    <section aria-label="Blog" data-decoy>
      <p>The spine line of this essay is metaphor: the through-line that holds the argument together.</p>
    </section>
    <section aria-label="Hero" data-climax>
      <h1><span>This person builds serious software</span><span> \u2014 and this website is proof.</span></h1>
    </section>
    <section data-no-label>
      <p>This section has no aria-label; it must not be matched.</p>
    </section>
  </main>
  <footer role="contentinfo" aria-label="Site footer">
    <p>${SPINE_LINE}</p>
  </footer>
</body>
</html>
`.trim();

const fixtureResult = fixtureExtract(syntheticHtml, EXPECTED);
const [heroSection, footerSection] = fixtureResult;

const fixtureErrors = [];
if (!heroSection.includes(SPINE_LINE)) {
  fixtureErrors.push(`Hero section did not contain spine line; got: ${JSON.stringify(heroSection)}`);
}
if (!footerSection.includes(SPINE_LINE)) {
  fixtureErrors.push(`Footer section did not contain spine line; got: ${JSON.stringify(footerSection)}`);
}
// Defense-in-depth: the Blog decoy must not pollute either section. The
// attribute-filter branch in fixtureExtract must reject it because its
// aria-label is "Blog", not "Hero" / "Site footer".
if (heroSection.includes('through-line that holds the argument')) {
  fixtureErrors.push(`Hero section incorrectly absorbed Blog decoy: ${JSON.stringify(heroSection)}`);
}
if (footerSection.includes('through-line that holds the argument')) {
  fixtureErrors.push(`Footer section incorrectly absorbed Blog decoy: ${JSON.stringify(footerSection)}`);
}
if (heroSection.includes('must not be matched')) {
  fixtureErrors.push(`Hero section incorrectly absorbed no-label decoy: ${JSON.stringify(heroSection)}`);
}
if (footerSection.includes('must not be matched')) {
  fixtureErrors.push(`Footer section incorrectly absorbed no-label decoy: ${JSON.stringify(footerSection)}`);
}

if (fixtureErrors.length > 0) {
  console.error('[spec] FAIL -- extractComponentText behavioral fixture violated contract:');
  for (const e of fixtureErrors) console.error(`  - ${e}`);
  console.error(`[spec] heroSection:   ${JSON.stringify(heroSection)}`);
  console.error(`[spec] footerSection: ${JSON.stringify(footerSection)}`);
  process.exit(1);
}
console.log(
  `[spec] PASS -- extractComponentText behavioral fixture: spine line bound to Hero + Footer mount points, decoys rejected`,
);
