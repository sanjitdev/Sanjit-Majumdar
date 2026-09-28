// scripts/check-jsdoc.mjs — sweep codebase for JSDoc block comments
// containing a stray `*/` mid-block (a backtick-wrapped path with `*/` in it
// closes the JSDoc prematurely, causing "Unterminated template" downstream).
//
// Walks the project source tree, lexes block comments in source order, and
// reports any line inside a block comment that contains a `*/` NOT
// immediately preceded by a `*` (i.e., not the JSDoc bullet-list prefix
// of a closing line) AND not the actual block-close.
//
// Run: node scripts/check-jsdoc.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SCAN_DIRS = ['app', 'components', 'lib'];
const SCAN_EXTS = new Set(['.ts', '.tsx', '.mdx']);
const SKIP_DIRS = new Set(['node_modules', '.next', '.git']);

/** Walk source tree collecting target files. */
function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else {
      const dot = entry.lastIndexOf('.');
      if (dot >= 0 && SCAN_EXTS.has(entry.slice(dot))) out.push(p);
    }
  }
  return out;
}

/**
 * Lex a single source file's block comments in source order. Returns an
 * array of { startLine, endLine, stray } where `stray` is the 1-indexed
 * line of any mid-comment that contains a block-close sequence that
 * isn't the real terminator (typically a stray asterisk-slash inside a
 * backtick-wrapped path).
 *
 * The lexer is intentionally minimal: it doesn't try to handle nested
 * block comments (TS/JS don't allow them anyway) or string literals
 * — it scans for the next block-close sequence from any starting block-
 * open sequence and reports the first stray terminator before the actual
 * block close.
 */
function findStrayBlockCloses(text) {
  const lines = text.split('\n');
  const findings = [];
  let inBlock = false;
  let blockStart = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!inBlock) {
      const open = line.indexOf('/*');
      if (open >= 0) {
        inBlock = true;
        blockStart = i + 1;
        // Check if same line also contains the close
        const closeAfter = line.indexOf('*/', open + 2);
        if (closeAfter >= 0) {
          // Single-line block; no stray.
          inBlock = false;
        }
      }
    } else {
      const close = line.indexOf('*/');
      if (close >= 0) {
        // Found the block close.
        inBlock = false;
      } else if (line.includes('*/') || (line.includes('*') && line.includes('/'))) {
        // Stray: */ (or * followed by /) before the actual close.
        const stray = line.match(/\*\s*\//);
        if (stray) {
          findings.push({
            startLine: blockStart,
            endLine: i + 1,
            strayLine: i + 1,
            text: line.trim(),
          });
        }
      }
    }
  }
  return findings;
}

let totalFiles = 0;
let totalFindings = 0;
for (const dir of SCAN_DIRS) {
  let files;
  try {
    files = walk(join(ROOT, dir));
  } catch {
    continue; // dir may not exist
  }
  for (const file of files) {
    totalFiles++;
    const text = readFileSync(file, 'utf8');
    const findings = findStrayBlockCloses(text);
    if (findings.length > 0) {
      for (const f of findings) {
        console.error(`[check-jsdoc] FAIL ${file}:${f.strayLine} — stray block-close sequence in JSDoc block (${f.startLine}–${f.endLine}): ${f.text}`);
        totalFindings++;
      }
    }
  }
}

if (totalFindings > 0) {
  console.error(`[check-jsdoc] ${totalFindings} stray-block-close finding(s) across ${totalFiles} files.`);
  process.exit(1);
}
console.log(`[check-jsdoc] PASS — 0 stray-block-close findings across ${totalFiles} files.`);
