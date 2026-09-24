// scripts/audit-routes.spec.mjs — verbatim closed-set lock for PROOF_NUMBERS.
// Asserts the corrected closed set from spec-1-4 iteration 2 (review_loop_iteration=2):
//   ['7+', '10K+', '35%', '22h', '1.2M', '\u221268%', '7-person', '8+ years']
// Fails if a future PR adds, removes, or reorders any element — particularly if the
// bypassable '6' is re-added. Run via `node scripts/audit-routes.spec.mjs` (no deps).
//
// Invariant from spec AC#9: PROOF_NUMBERS is a closed set; single-digit numeric values
// like '6' are excluded by design.

const EXPECTED = ['7+', '10K+', '35%', '22h', '1.2M', '\u221268%', '7-person', '8+ years'];

// Read the canonical source file as TEXT (do NOT import -- audit-routes.mjs runs the
// audit on import, which would require a live server and is not the spec's concern).
const fs = await import('node:fs/promises');
const path = await import('node:path');
const url = await import('node:url');
const sourcePath = url.fileURLToPath(new URL('./audit-routes.mjs', import.meta.url));
const sourceText = await fs.readFile(sourcePath, 'utf8');
const match = sourceText.match(/const PROOF_NUMBERS\s*=\s*(\[[^\]]+\]);/);
if (!match) {
  console.error('[spec] FAIL -- PROOF_NUMBERS const not found in scripts/audit-routes.mjs');
  process.exit(1);
}
// Parse the matched literal array. The source uses single-quoted strings with an
// em-dash unicode escape ('\u221268%'); normalize to a real JSON array.
const literal = match[1]
  .replace(/'/g, '"')        // ' -> "
  .replace(/\\"/g, "'")      // restore any escaped single-quotes inside strings
  .replace(/\\u2212/g, '\u2212'); // \u2212 -> U+2212 (already JSON-escaped)
const actual = JSON.parse(literal);

const errors = [];
if (actual.length !== EXPECTED.length) {
  errors.push(`length mismatch: expected ${EXPECTED.length} elements, got ${actual.length}`);
}
for (let i = 0; i < EXPECTED.length; i++) {
  if (actual[i] !== EXPECTED[i]) {
    errors.push(`element [${i}]: expected ${JSON.stringify(EXPECTED[i])}, got ${JSON.stringify(actual[i])}`);
  }
}
// Defense-in-depth: reject the bypassable '6' even if a future contributor reorders or
// adds other elements. The closed-set check above already catches re-additions, but this
// explicit guard makes the intent unmissable.
if (actual.includes('6')) {
  errors.push(`'6' present in PROOF_NUMBERS — single-digit values are bypassable (bad_spec fix #2)`);
}
if (actual.some((n) => typeof n !== 'string' || n.length < 2)) {
  errors.push(`PROOF_NUMBERS contains entries shorter than 2 chars — bypassable`);
}

if (errors.length > 0) {
  console.error('[spec] FAIL -- PROOF_NUMBERS drift detected:');
  for (const e of errors) console.error(`  - ${e}`);
  console.error(`[spec] expected: ${JSON.stringify(EXPECTED)}`);
  console.error(`[spec] actual:   ${JSON.stringify(actual)}`);
  process.exit(1);
}
console.log(`[spec] PASS -- PROOF_NUMBERS is the verbatim closed set (${EXPECTED.length} elements)`);
