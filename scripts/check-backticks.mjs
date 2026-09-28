// scripts/check-backticks.mjs — verify backtick (template literal) balance
// per source file. An odd number of backticks outside strings/comments
// indicates an unterminated template literal.
//
// Walks the project source tree, strips line comments + block comments +
// double/single-quoted strings, then counts remaining backticks.
// Run: node scripts/check-backticks.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SCAN_DIRS = ['app', 'components', 'lib'];
const SCAN_EXTS = new Set(['.ts', '.tsx', '.mdx']);
const SKIP_DIRS = new Set(['node_modules', '.next', '.git']);

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
 * Strip strings + comments from a source file's text so we can count
 * only the "structural" backticks (template literal openers/closers).
 *
 * Lexer is intentionally minimal: walks char-by-char, tracking comment
 * state and string state. Handles single-line comments, block comments
 * (including the JSDoc pitfall), single + double-quoted strings with
 * escape sequences, AND template literals (with ${} substitution
 * tracking so we don't get confused by ${} inside template literals).
 *
 * Returns the input with strings + comments replaced by spaces (so
 * column counts are preserved for error reporting).
 */
function stripStringsAndComments(text) {
  let out = '';
  let i = 0;
  const len = text.length;
  let templateDepth = 0;
  while (i < len) {
    const ch = text[i];
    const next = text[i + 1];
    // Line comment
    if (ch === '/' && next === '/' && templateDepth === 0) {
      while (i < len && text[i] !== '\n') {
        out += ' ';
        i++;
      }
      continue;
    }
    // Block comment
    if (ch === '/' && next === '*' && templateDepth === 0) {
      out += '  ';
      i += 2;
      while (i < len) {
        if (text[i] === '*' && text[i + 1] === '/') {
          out += '  ';
          i += 2;
          break;
        }
        out += text[i] === '\n' ? '\n' : ' ';
        i++;
      }
      continue;
    }
    // String literals
    if ((ch === '"' || ch === "'") && templateDepth === 0) {
      const q = ch;
      out += ' ';
      i++;
      while (i < len && text[i] !== q) {
        if (text[i] === '\\' && i + 1 < len) {
          out += '  ';
          i += 2;
        } else {
          out += text[i] === '\n' ? '\n' : ' ';
          i++;
        }
      }
      if (i < len) {
        out += ' ';
        i++;
      }
      continue;
    }
    // Template literal
    if (ch === '`') {
      templateDepth++;
      out += '`';
      i++;
      while (i < len && templateDepth > 0) {
        if (text[i] === '\\' && i + 1 < len) {
          out += '  ';
          i += 2;
          continue;
        }
        if (text[i] === '`') {
          templateDepth--;
          out += '`';
          i++;
          continue;
        }
        if (text[i] === '$' && text[i + 1] === '{') {
          // Nested template depth — push, then find matching }
          templateDepth++;
          out += '${';
          i += 2;
          // Walk to matching close brace (simple counter)
          let braceDepth = 1;
          while (i < len && braceDepth > 0) {
            if (text[i] === '{') braceDepth++;
            else if (text[i] === '}') braceDepth--;
            out += text[i] === '\n' ? '\n' : ' ';
            i++;
          }
          // When we close the brace, the inner templateDepth was 1, so
          // we're back to the outer template (depth decremented when
          // the substitution started).
          if (braceDepth === 0) templateDepth--;
          continue;
        }
        out += text[i] === '\n' ? '\n' : ' ';
        i++;
      }
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

let totalFiles = 0;
let badFiles = 0;
for (const dir of SCAN_DIRS) {
  let files;
  try {
    files = walk(join(ROOT, dir));
  } catch {
    continue;
  }
  for (const file of files) {
    totalFiles++;
    const text = readFileSync(file, 'utf8');
    const stripped = stripStringsAndComments(text);
    const lines = stripped.split('\n');
    let btCount = 0;
    const badLines = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const ch of line) {
        if (ch === '`') btCount++;
      }
    }
    if (btCount % 2 !== 0) {
      badFiles++;
      // Find the first odd line for diagnostics
      let cumulative = 0;
      for (let i = 0; i < lines.length; i++) {
        const before = cumulative;
        for (const ch of lines[i]) if (ch === '`') cumulative++;
        if ((cumulative % 2) !== (before % 2)) {
          badLines.push(i + 1);
          break;
        }
      }
      console.error(`[check-backticks] FAIL ${file} — odd backtick count (${btCount}) outside strings/comments; first odd line: ${badLines[0] ?? '?'}`);
    }
  }
}

if (badFiles > 0) {
  console.error(`[check-backticks] ${badFiles} file(s) with unbalanced backticks across ${totalFiles} scanned.`);
  process.exit(1);
}
console.log(`[check-backticks] PASS — all backticks balanced across ${totalFiles} files.`);