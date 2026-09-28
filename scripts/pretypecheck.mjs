// scripts/pretypecheck.mjs — pretypecheck guard (1-12-foundation-closeout fix #10).
//
// `tsc --noEmit` requires Next.js's generated route types (`.next/dev/types/routes.d.ts`
// during dev, `.next/types/...` after build). The original CI ordering was:
//
//     pnpm install → pnpm build → pnpm typecheck → pnpm lint
//
// which silently succeeds if the previous step was skipped (e.g., a local
// `pnpm typecheck` run before `pnpm build` would fail with a confusing
// "cannot find module 'next/types'" error). This guard makes the dependency
// explicit: typecheck MUST run after build, and the build output MUST
// contain the route types file. If it doesn't, fail with the remediation
// step instead of letting tsc produce a 50-line module-resolution trace.
//
// The check is deliberately cheap (single fs.statSync) and runs in <10ms.

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROUTES_DTS = resolve(process.cwd(), '.next/dev/types/routes.d.ts');
const TYPES_DIR = resolve(process.cwd(), '.next/types');

if (!existsSync(ROUTES_DTS) && !existsSync(TYPES_DIR)) {
  console.error(
    `[pretypecheck] FAIL -- Next.js route types not found.\n` +
      `  Expected one of:\n` +
      `    ${ROUTES_DTS}  (dev)\n` +
      `    ${TYPES_DIR}   (build)\n` +
      `  Remediation: run 'pnpm build' (or 'pnpm dev' once) before 'pnpm typecheck'.\n` +
      `  See .github/workflows/ci.yml for the canonical ordering.`,
  );
  process.exit(1);
}
console.log('[pretypecheck] OK -- Next.js route types present, proceeding to typecheck');