---
work_item_id: wi-3-clone-sanjit-content-at-build-time
intent: close-out-epic-2
story_ref: epic-2 / story-2-4
title: Next.js shallow-clone of sanjit-content at build time
status: pending
complexity: medium
mode: confirm
autonomy_bias_applied: balanced
depends_on: [wi-2-content-reader]
binds:
  ad: [AD-1, AD-9]
  fr: [FR-12]
source_spec: _bmad-output/implementation-artifacts/spec-2-4-implement-nextjs-shallow-clone-of-sanjit-content-at-build-time.md
current_state: review (sprint-status.yaml 2026-09-28)
created: 2026-10-08T18:30:00Z
---

# Work item — Next.js shallow-clone of sanjit-content at build time

## What ships

A build-time shallow-clone of `sanjit-content` into `content/`:
- `scripts/clone-content.mts` — TS script using `git clone --depth 1`
  (auth via `GIT_TOKEN` env var) into `content/`, then invokes
  `readContent({ contentRoot: 'content' })` from WI-2.
- `package.json` adds `prebuild` and `predev` lifecycle hooks that
  call `tsx scripts/clone-content.mts`. The hooks exit non-zero on
  any reader diagnostic for `status: published` entries.
- The `content/` directory is **gitignored** (already is). The
  clone lives only inside the build container / local checkout,
  not in the repo.

## Acceptance criteria

1. `scripts/clone-content.mts` shallow-clones `sanjit-content`
   into `./content/`, then runs the reader; exits 0 on
   `published` success, exits 1 on any `published` diagnostic.
2. `package.json` `prebuild` and `predev` call the script. Both
   are wired and idempotent (a second `pnpm dev` does not
   re-clone when `content/` is fresh).
3. The clone uses a `GIT_TOKEN` env var for `https://x-access-token:$GIT_TOKEN@github.com/.../sanjit-content.git`-style
   auth. The token is a fine-grained PAT scoped read-only to the
   `sanjit-content` repo. The repo is **read only** at build time.
4. `scripts/smoke-2-4.mts` exercises the script end-to-end against
   a fixture content directory (does not require network access
   for the CI smoke). The script honors `GIT_TOKEN` only when the
   real remote is reachable.
5. `pnpm build` and `pnpm dev` both succeed end-to-end when a real
   `sanjit-content` repo is configured; fail with the right exit
   code when the repo is missing or the PAT is bad.

## Verification

- `pnpm typecheck`
- `pnpm smoke:2-4`
- `pnpm lint`
- `pnpm build` (cold clone path)
- `pnpm dev` (cold clone path)

## Notes

- Already at step-05 (review) per sprint-status.yaml. Resume from
  step-06.
- The clone lives **only** at build time. The deployed bundle
  reads from `content/` after the clone, not via runtime HTTP
  (AD-1 forbids that).
- WI-5 (sanjit-content repo + workflow) depends on this, so the
  end-to-end "edit → webhook → revalidate" loop closes after
  WI-5 lands.
