# Deferred Work

Append-only. New entries are appended by step-04 of the bmad-build workflow when a review
finding is classified as `defer` (a pre-existing issue surfaced incidentally, not caused by
the current story). Each entry's `source_spec` is the story that surfaced it.

<!-- Append new entries below this line. Do not modify existing entries. -->

- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-apply-strict-csp-via-nextconfigjs-and-experimentalsri.md`
  summary: Automated regression tests for CSP header presence, directive completeness, SRI mechanism on emitted HTML, and absence of proxy.ts/middleware.ts belong in CI, not in this platform-config story.
  evidence: Verification Gap Reviewer surfaced 4 findings — none of them are implementation gaps in story 1-2, but all are real and unverified by automation. The CI gate work is owned by story 1-4 per sprint-status.yaml ("set up github actions ci with lighthouse + gzip-budget + route-invariant + pa11y-ci gates"). Story 1-2 establishes the platform-level configuration; story 1-4 will assert it does not regress on every PR.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-apply-strict-csp-via-nextconfigjs-and-experimentalsri.md`
  summary: `style-src 'self'` will break any future inline-style usage (e.g., shadcn dialog overlay opacity, signature-canvas dynamic SVG fill colors); the spec needs `style-src-elem` and `style-src-attr` directives — or a documented deferral to E1.5.
  evidence: Blind Hunter finding flagged that the current CSP conflates stylesheet links (`<link rel="stylesheet">`) with inline `<style>` blocks and `style="…"` attributes. With Tailwind v4 + `experimental.sri`, the stylesheet path is handled by SRI, but if any future client component sets an inline style (common for shadcn overlays), the browser will block it. Story 1-5 ("set up app/globals.css with the closed 57-token @theme block") is the natural owner of this decision; the CSP must be re-stated when the real layout first mounts inline styles.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-apply-strict-csp-via-nextconfigjs-and-experimentalsri.md`
  summary: `Cache-Control: s-maxage=31536000` on prerendered responses means a CSP change takes up to a year to propagate to cached edges — `Cache-Control: no-store` for the CSP header itself, or a revalidation hook on CSP changes, needs to be designed.
  evidence: Blind Hunter finding flagged that the static-first invariant (AD-13) produces `s-maxage=31536000` on every prerendered response, including the headers. If a future CSP amendment is needed (e.g., adding a new analytics endpoint), the change will not propagate to users hitting cached edges for up to a year. This is a deployment/CI concern, not a story 1-2 concern; it should be addressed by the E1.4 CI + cache-invalidation workflow or a dedicated header-cache story.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-apply-strict-csp-via-nextconfigjs-and-experimentalsri.md`
  summary: The future `connect-src 'self' https://plausible.io https://api.resend.com` allowlist must be re-validated against actual outbound calls in E4 (forward-to-hiring-manager endpoint) and E5a (subscribe form); missing endpoint at runtime = silent failure of analytics or form submission.
  evidence: Blind Hunter finding flagged that the CSP `connect-src` allowlist in this story is *forward-looking* — neither Plausible nor Resend are wired in story 1-2. If a later story adds an outbound endpoint not on this list (e.g., a different email provider, a CMS, an error reporter), the browser will silently block the call. This is correctly designed to be future-proof, but the runtime assertion must live in the story that first makes the call (4-3 for Resend, 5a-7 for the subscribe form).

- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-apply-strict-csp-via-nextconfigjs-and-experimentalsri.md`
  summary: `frame-src 'self' https://*.sanjit.dev` subdomain wildcard needs to be enumerated as a closed list before E4.5 (recruiter-route OG metadata); if E4.5 adds a new subdomain (e.g., `pdf.sanjit.dev`) the wildcard still allows it, but the closed-list discipline says "every subdomain must be named".
  evidence: Blind Hunter finding flagged that the wildcard is currently intentional (the OG image endpoint and PDF preview will live on `*.sanjit.dev`), but AD-12 closed-list discipline demands the list be enumerated at the moment of first use. E4.5 is the natural owner (it builds the OG image at `og.sanjit.dev` or similar); when that story ships, the wildcard should be replaced with the explicit subdomain list.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-wire-proxyts-at-project-root-next-16-convention-not-middlewarets.md`
  summary: Automated regression tests for the `proxy.ts` 308 redirect (status code, `Location:` header shape, `for`-deletion, pass-through behavior, file-tree invariant) belong in CI, not in this proxy story.
  evidence: Verification Gap Reviewer flagged that the spec's Verification section is entirely manual (`pnpm install` + `pnpm build` + 4 manual `curl -sI` checks + file-tree `ls`). No automated test will catch a regression to 307 instead of 308, a wrong path rewrite (`/recruiter/` trailing slash), an accidental `for`-reintroduction, or a future re-creation of `middleware.ts`. Story 1-4 ("set up GitHub Actions CI with Lighthouse, gzip-budget, route-invariant, and pa11y-ci gates") is the natural owner — its `route-invariant` check could grow a sub-assertion for the proxy's 308 behavior. Story 1-3 establishes the platform-level proxy; story 1-4 will assert it does not regress on every PR.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-wire-proxyts-at-project-root-next-16-convention-not-middlewarets.md`
  summary: A CI-side scan (lint rule, pre-commit hook, or CI grep) that fails the build if `proxy.ts` or `middleware.ts` ever reintroduces a nonce/`'unsafe-inline'`-based CSP injection should live alongside the other AD-11 boundaries.
  evidence: Adversarial Blind Hunter finding flagged that AC #7 ("no `nonce-` or `'unsafe-inline'` in `proxy.ts`") is a negative assertion with no runner — only a human `grep` exercises it today. The same boundary holds for `middleware.ts` (must not exist) and `next.config.mjs` (already owned by E1.2). A single shared lint or CI check that fails on `nonce-` in any proxy/middleware-shaped file would protect the AD-11 contract across future edits. Story 1-4 (CI gates) is the natural home for this assertion.
