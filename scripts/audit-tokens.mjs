#!/usr/bin/env node
/**
 * scripts/audit-tokens.mjs — AD-18 inline-hex lint.
 *
 * Walks every `.tsx` / `.mdx` / `.ts` file matching AUDIT_TOKEN_GLOBS
 * (single source of truth in scripts/audit-routes.shared.mjs) and fails
 * the build if any inline `#XXXXXX` / `#XXXXXXXX` hex token or `rgb()` /
 * `rgba()` value appears that is NOT in the closed allowlist (ALLOWED_HEX
 * / ALLOWED_RGBA).
 *
 * The audit walks `lib/design-tokens.ts` on purpose — the closed allowlist
 * IS the exemption (see spec-1-5 AC #5, amended 2026-09-24-1). If a future
 * contributor hardcodes a hex inside that file to "document the value",
 * this audit will fail with `BANNED_HEX: lib/design-tokens.ts:<line>  <hex>`
 * — that's the regression the audit is designed to catch.
 *
 * Exit codes:
 *   0 — clean; no inline hex outside the closed set
 *   1 — at least one banned hex / rgba value matched
 *
 * CI integration: the `.github/workflows/ci.yml` `gate` job runs
 * `pnpm audit:tokens` AFTER `pnpm audit:routes` (per spec-1-4's
 * sequential gate order + the 5b.3 amendment).
 */
import {
  AUDIT_TOKEN_GLOBS,
  ALLOWED_HEX,
  ALLOWED_RGBA,
} from './audit-routes.shared.mjs';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const PROJECT_ROOT = process.cwd();
const ALLOWED_HEX_SET = new Set(ALLOWED_HEX.map((s) => s.toLowerCase()));
const ALLOWED_RGBA_SET = new Set(ALLOWED_RGBA.map((s) => s.replace(/\s+/g, '').toLowerCase()));

// Convert a glob like "app/**/*.tsx" to a regex.
// Supports ** (any depth including zero) and * (one segment, no /).
function globToRegex(glob) {
  const parts = glob.split('/');
  const re = parts
    .map((p) => {
      if (p === '**') return '.*';
      if (p === '*') return '[^/]*';
      return p.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  return new RegExp('^' + re + '$');
}

const GLOB_REGEXES = AUDIT_TOKEN_GLOBS.map((g) => ({
  glob: g,
  regex: globToRegex(g),
}));

function shouldWalk(relPath) {
  const normalized = relPath.split(sep).join('/');
  return GLOB_REGEXES.some(({ regex }) => regex.test(normalized));
}

function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    console.error(`audit:tokens: cannot read directory ${dir}: ${e.message}`);
    return out;
  }
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

const HEX_RE = /#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?\b/g;
const RGB_RE = /rgba?\([^)]+\)/g;

function isAllowed(match) {
  if (match.kind === 'hex') {
    return ALLOWED_HEX_SET.has(match.value.toLowerCase());
  }
  // rgb / rgba — strip all whitespace before comparison so formatting
  // variants (`rgba(0, 0, 0, 0.30)` vs `rgba(0,0,0,0.30)`) match.
  return ALLOWED_RGBA_SET.has(match.value.replace(/\s+/g, '').toLowerCase());
}

function findLineForOffset(content, offset) {
  let line = 1;
  for (let i = 0; i < offset && i < content.length; i++) {
    if (content[i] === '\n') line++;
  }
  return line;
}

let violations = 0;

// Walk top-level directories implied by the glob prefixes.
// Today AUDIT_TOKEN_GLOBS prefixes are `app/`, `components/`, `lib/`.
// Strip `**` and the file portion to get the top-level dir.
const TOP_LEVEL_DIRS = Array.from(
  new Set(
    AUDIT_TOKEN_GLOBS.map((g) => g.split('/')[0]).filter((p) => !p.includes('*'))
  )
);

for (const top of TOP_LEVEL_DIRS) {
  const absTop = join(PROJECT_ROOT, top);
  const stat = statSync(absTop, { throwIfNoEntry: false });
  if (!stat) {
    console.warn(`audit:tokens: glob prefix '${top}' does not exist — skipping (possible AUDIT_TOKEN_GLOBS typo)`);
    continue;
  }
  for (const file of walk(absTop)) {
    const rel = relative(PROJECT_ROOT, file).split(sep).join('/');
    if (!shouldWalk(rel)) continue;
    let content;
    try {
      content = readFileSync(file, 'utf8');
    } catch (e) {
      console.error(`audit:tokens: cannot read file ${rel}: ${e.message}`);
      continue;
    }
    let m;
    HEX_RE.lastIndex = 0;
    while ((m = HEX_RE.exec(content)) !== null) {
      const match = { kind: 'hex', value: m[0] };
      if (isAllowed(match)) continue;
      const line = findLineForOffset(content, m.index);
      console.error(`BANNED_HEX: ${rel}:${line}  ${match.value}`);
      violations++;
    }
    RGB_RE.lastIndex = 0;
    while ((m = RGB_RE.exec(content)) !== null) {
      const match = { kind: 'rgb', value: m[0] };
      if (isAllowed(match)) continue;
      const line = findLineForOffset(content, m.index);
      console.error(`BANNED_HEX: ${rel}:${line}  ${match.value}`);
      violations++;
    }
  }
}

if (violations > 0) {
  console.error(`\naudit:tokens — ${violations} banned hex/rgba value(s) found.`);
  console.error('Use `var(--token-name)` or add the value to the closed allowlist in');
  console.error('scripts/audit-routes.shared.mjs (requires a spine amendment).');
  process.exit(1);
}

console.log('audit:tokens — clean (no inline hex outside the closed AD-18 set).');
process.exit(0);
