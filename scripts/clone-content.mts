#!/usr/bin/env node
// scripts/clone-content.mts — Story 2-4 build pipeline.
//
// AD-1 read path: shallow-clone `sanjit-content` into `<project-root>/content/`
// at build time (and at `next dev` startup), then call the story 2-3 reader
// to validate every published entry. AD-5 build-fail contract: any diagnostic
// from `readContent()` exits non-zero.
//
// AD-9: this script runs as part of the CODE-REPO build (via package.json
// `prebuild` + `predev` lifecycle hooks). It is NOT a content-repo webhook
// handler — that is story 2-5's territory.
//
// Auth strategy: env var `GIT_TOKEN` (a GitHub fine-grained PAT with `contents:read`
// on `sanjit-content`). When absent, falls back to the public HTTPS URL (assumes
// the repo will be made public, or that the local user has a git credential helper
// configured for github.com). Override the source URL with `CONTENT_REPO_URL` if
// the deploy target uses a fork or a different org.
//
// Local-dev shortcut: `SKIP_CLONE=1` skips the clone (useful for offline work or
// when `content/` is already populated by `cp -r sanjit-content/content/* content/`).
// The reader still runs and AD-5 still binds.
//
// Single-line JSON log on success (spine convention):
//   {"event":"content.clone","ok":true,"duration_ms":NNNN,"source":"<url>","dest":"<path>","branch":"<sha-short>"}
// On failure:
//   {"event":"content.clone","ok":false,"error":"<message>","source":"<url>","dest":"<path>"}
// On SKIP_CLONE=1:
//   {"event":"content.clone","ok":true,"skipped":true,"reason":"SKIP_CLONE=1","dest":"<path>"}
//
// Invocation:
//   npx tsx scripts/clone-content.mts                  # clone + reader gate
//   SKIP_CLONE=1 npx tsx scripts/clone-content.mts    # skip clone, still reader-gate
//   GIT_TOKEN=ghp_xxx npx tsx scripts/clone-content.mts  # authenticated clone
//
// Wired into package.json `prebuild` + `predev` lifecycle hooks so
// `pnpm build` / `pnpm dev` always see a fresh `content/`.

import { spawnSync } from 'node:child_process';
import {
  existsSync,
  rmSync,
  statSync,
} from 'node:fs';
import { resolve } from 'node:path';

import { readContent } from '../lib/content/index';

// ---------------------------------------------------------------------------
// Resolve project root. We deliberately resolve from this script's own location
// (`scripts/clone-content.mts`) rather than `process.cwd()` because the script
// may be invoked from a different CWD (e.g., Vercel's build wrapper).
// ---------------------------------------------------------------------------

const SCRIPT_DIR = decodeURIComponent(new URL('.', import.meta.url).pathname).replace(
  /^\/([A-Za-z]:)/,
  '$1',
);
const PROJECT_ROOT = resolve(SCRIPT_DIR, '..');
const DEST_DIR = resolve(PROJECT_ROOT, 'content');

// ---------------------------------------------------------------------------
// Configuration (env-var driven, with safe defaults).
// ---------------------------------------------------------------------------

const CONTENT_REPO_URL =
  process.env.CONTENT_REPO_URL ?? 'https://github.com/sanjit-majumdar/sanjit-content.git';
const GIT_TOKEN = process.env.GIT_TOKEN ?? '';
const SKIP_CLONE = process.env.SKIP_CLONE === '1';

// ---------------------------------------------------------------------------
// Structured logging helpers (single-line JSON per spine convention).
// ---------------------------------------------------------------------------

function logJson(payload: Record<string, unknown>): void {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload));
}

function nowMs(): number {
  return Date.now();
}

// ---------------------------------------------------------------------------
// Step 1: SKIP_CLONE short-circuit (still runs the reader for AD-5 enforcement
// IF a `content/` directory already exists — the dev-time "I pre-populated
// it manually" path). If SKIP_CLONE and no `content/`, exit 0 silently so
// `pnpm dev` works offline against an empty repo.
// ---------------------------------------------------------------------------

if (SKIP_CLONE) {
  if (!existsSync(DEST_DIR)) {
    logJson({
      event: 'content.clone',
      ok: true,
      skipped: true,
      reason: 'SKIP_CLONE=1 (no pre-populated content/)',
      dest: DEST_DIR,
    });
    process.exit(0);
  }
  logJson({
    event: 'content.clone',
    ok: true,
    skipped: true,
    reason: 'SKIP_CLONE=1',
    dest: DEST_DIR,
  });
  runReaderAndGate();
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Step 2: Pre-flight — git must be on PATH.
// ---------------------------------------------------------------------------

if (!gitOnPath()) {
  logJson({
    event: 'content.clone',
    ok: false,
    error: 'git not found on PATH',
    source: CONTENT_REPO_URL,
    dest: DEST_DIR,
  });
  // eslint-disable-next-line no-console
  console.error(
    '\n[content.clone] FAIL -- git is not on PATH.\n' +
      '  Remediation: install git (https://git-scm.com) or run on a host with git available.\n',
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Step 3: Idempotent cleanup of any stale `content/` directory. Scoped to
// the project root — never touches `sanjit-content/` (the local dev fixture).
// ---------------------------------------------------------------------------

if (existsSync(DEST_DIR)) {
  try {
    rmSync(DEST_DIR, { recursive: true, force: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logJson({
      event: 'content.clone',
      ok: false,
      error: `failed to remove stale content/: ${message}`,
      source: CONTENT_REPO_URL,
      dest: DEST_DIR,
    });
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Step 4: Compose the authenticated URL (GIT_TOKEN injection) and spawn git.
// ---------------------------------------------------------------------------

const cloneUrl = composeCloneUrl(CONTENT_REPO_URL, GIT_TOKEN);
const startMs = nowMs();
const result = spawnSync(
  'git',
  ['clone', '--depth', '1', cloneUrl, DEST_DIR],
  {
    cwd: PROJECT_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    shell: false,
    windowsHide: true,
  },
);
const durationMs = nowMs() - startMs;

if (result.error) {
  const message = result.error.message;
  logJson({
    event: 'content.clone',
    ok: false,
    error: message,
    source: redactToken(cloneUrl),
    dest: DEST_DIR,
    duration_ms: durationMs,
  });
  process.exit(1);
}

if (result.status !== 0) {
  const stderrBuf = result.stderr;
  const stderr = stderrBuf ? stderrBuf.toString().trim() : '';
  const lastLine =
    stderr.split(/\r?\n/).filter(Boolean).pop() ?? `git exited ${String(result.status)}`;
  logJson({
    event: 'content.clone',
    ok: false,
    error: lastLine,
    source: redactToken(cloneUrl),
    dest: DEST_DIR,
    duration_ms: durationMs,
  });
  // eslint-disable-next-line no-console
  console.error(
    `\n[content.clone] FAIL -- git clone failed.\n` +
      `  Source: ${redactToken(cloneUrl)}\n` +
      `  Dest:   ${DEST_DIR}\n` +
      `  Last stderr line: ${lastLine}\n` +
      `  Remediation: verify GIT_TOKEN has contents:read on the content repo, OR set CONTENT_REPO_URL to a public clone.\n`,
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Step 5: Resolve the head SHA for the structured log.
// ---------------------------------------------------------------------------

const branch = resolveHeadShortSha(DEST_DIR);
logJson({
  event: 'content.clone',
  ok: true,
  duration_ms: durationMs,
  source: redactToken(cloneUrl),
  dest: DEST_DIR,
  branch,
});

// ---------------------------------------------------------------------------
// Step 6: Run the reader for AD-5 enforcement.
// ---------------------------------------------------------------------------

runReaderAndGate();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function gitOnPath(): boolean {
  const probe = spawnSync('git', ['--version'], {
    cwd: PROJECT_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
    windowsHide: true,
  });
  return probe.status === 0;
}

/**
 * Compose an authenticated clone URL. When GIT_TOKEN is set, inject it as the
 * `x-access-token` user (GitHub's documented form for fine-grained PATs). When
 * GIT_TOKEN is empty, return the original URL unchanged (works for public repos
 * with a configured git credential helper).
 *
 * SAFETY: only inject the token when the URL is an `https://github.com/...`
 * form. Any other scheme (SSH, non-GitHub HTTPS, malformed) returns the URL
 * unchanged — better to fail with an auth error from git than to leak the
 * token to an unknown host.
 */
function composeCloneUrl(url: string, token: string): string {
  if (!token) return url;
  if (!url.startsWith('https://github.com/')) {
    return url;
  }
  const at = url.indexOf('//');
  if (at < 0) return url;
  return `https://x-access-token:${token}@${url.slice(at + 2)}`;
}

/** Strip the injected token from a URL for logging. */
function redactToken(url: string): string {
  return url.replace(/x-access-token:[^@]+@/, 'x-access-token:<redacted>@');
}

function resolveHeadShortSha(repoDir: string): string | null {
  const head = spawnSync('git', ['-C', repoDir, 'rev-parse', '--short', 'HEAD'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
    windowsHide: true,
  });
  if (head.status !== 0) return null;
  const out = head.stdout ? head.stdout.toString().trim() : '';
  return out || null;
}

/**
 * Run the reader against the cloned `content/`. AD-5 enforcement:
 *   - diagnostics.length > 0 → exit 1, print every line.
 *   - otherwise → log summary + exit 0.
 */
function runReaderAndGate(): void {
  let result;
  try {
    result = readContent({ contentRoot: DEST_DIR });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logJson({
      event: 'content.read',
      ok: false,
      error: message,
      content_root: DEST_DIR,
    });
    process.exit(1);
  }

  if (result.diagnostics.length > 0) {
    // AD-5: per-file diagnostic lines, then exit 1. Print to stderr so the
    // Vercel build log surfaces them prominently.
    // eslint-disable-next-line no-console
    console.error(
      `\n[content.read] FAIL -- ${String(result.diagnostics.length)} diagnostic(s):\n` +
        result.diagnostics.map((d, i) => `  ${String(i + 1)}. ${d}`).join('\n') +
        '\n',
    );
    logJson({
      event: 'content.read',
      ok: false,
      diagnostics_count: result.diagnostics.length,
      content_root: DEST_DIR,
    });
    process.exit(1);
  }

  logJson({
    event: 'content.read',
    ok: true,
    content_root: DEST_DIR,
    published_count: result.published.length,
    drafts_count: result.drafts.length,
    cv_present: result.cv !== null,
    now_snapshot_present: result.nowSnapshot !== null,
    is_directory: safeIsDirectory(DEST_DIR),
  });
}

function safeIsDirectory(p: string): boolean {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}
