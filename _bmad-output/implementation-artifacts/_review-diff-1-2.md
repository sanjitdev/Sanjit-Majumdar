# Review payload — Story 1-2 strict CSP + SRI (diff vs. baseline 6a859a4)

Baseline: `6a859a4b6ca8f883b4037d7fa548c5d54c85c29c`
Scope of this story: 1 modified file (`next.config.mjs`). All other files in the repo are unchanged vs. baseline.

`git status` output for project root (excluding `_bmad-output/` workspace):

```
?? (only next.config.mjs touched — file was tracked, modified)
```

`git diff 6a859a4 -- next.config.mjs`:

```diff
--- a/next.config.mjs
+++ b/next.config.mjs
@@ -1,5 +1,40 @@
 /** @type {import('next').NextConfig} */
 const nextConfig = {
   reactStrictMode: true,
+  experimental: {
+    sri: {
+      algorithm: 'sha256',
+    },
+  },
 };
+
+const ContentSecurityPolicy = [
+  "default-src 'self'",
+  "script-src 'self' https://plausible.io",
+  "style-src 'self'",
+  "img-src 'self' data:",
+  "connect-src 'self' https://plausible.io https://api.resend.com",
+  "frame-src 'self' https://*.sanjit.dev",
+  "font-src 'self'",
+  "object-src 'none'",
+  "base-uri 'self'",
+  "form-action 'self'",
+  "frame-ancestors 'none'",
+].join('; ');
+
+/** @type {import('next').NextConfig['headers']} */
+const headers = async () => {
+  return [
+    {
+      source: '/:path*',
+      headers: [
+        {
+          key: 'Content-Security-Policy',
+          value: ContentSecurityPolicy,
+        },
+      ],
+    },
+  ];
+};
+
+export default { ...nextConfig, headers };
```

## Full content of `next.config.mjs` (current state on disk)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    sri: {
      algorithm: 'sha256',
    },
  },
};

const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' https://plausible.io",
  "style-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self' https://plausible.io https://api.resend.com",
  "frame-src 'self' https://*.sanjit.dev",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

/** @type {import('next').NextConfig['headers']} */
const headers = async () => {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: ContentSecurityPolicy,
        },
      ],
    },
  ];
};

export default { ...nextConfig, headers };
```

## Verified AC outcomes (re-run on 2026-09-24)

- `pnpm install --frozen-lockfile` → exit 0, lockfile unchanged
- `pnpm build` → exit 0, "✓ Compiled successfully", 3 static pages (`/`, `/_not-found`)
- `PORT=3002 pnpm start` (smoke) → `curl -sI http://localhost:3002/` returned:

  ```
  HTTP/1.1 200 OK
  Content-Security-Policy: default-src 'self'; script-src 'self' https://plausible.io; style-src 'self'; img-src 'self' data:; connect-src 'self' https://plausible.io https://api.resend.com; frame-src 'self' https://*.sanjit.dev; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
  x-nextjs-cache: HIT
  x-nextjs-prerender: 1
  x-nextjs-stale-time: 300
  Cache-Control: s-maxage=31536000
  ```
  Critically: `x-nextjs-cache: HIT` and `x-nextjs-prerender: 1` prove the page is STATIC — CSP is being emitted on the prerendered response (AD-13 static-first preserved).

- Forbidden-token grep (`grep -nE "nonce-|\bunsafe-inline\b|\bunsafe-eval\b" next.config.mjs`) → zero matches
- Wildcard-source grep (`grep -nE "'\*'|\"\*\"" next.config.mjs`) → zero matches (the `*` in `https://*.sanjit.dev` is a subdomain wildcard for `frame-src`, NOT the bare `*` source-allowlist)
- `proxy.ts` and `middleware.ts` → both absent (`ls` exits 2)
- SRI stamp grep across `.next/server/app/` → `index.html` contains `integrity="sha256-…"` attributes on JS `<script>` tags (5 matches). No `<link rel="stylesheet">` is emitted by the placeholder layout — that literal assertion transfers to E1.9 per Spec Change Log 2026-09-24-1.

## Known deviations / adjudications from the approved spec

1. **AC #5 ("CSS stylesheet SRI")** — directly unverifiable in this story because `app/layout.tsx` (the E1.1 placeholder) does not import `app/globals.css`, so no CSS link is emitted. Human adjudicated [Amend AC] — the literal CSS-link assertion is deferred to E1.9; the SRI mechanism itself is verified on JS scripts in this story. Spec Change Log 2026-09-24-1 documents this.
2. **`script-src 'self' https://plausible.io`** does NOT include `'nonce-<runtime>'` — this is an intentional deviation from the epics.md Story 1.2 example CSP. epics.md carries a spec error (nonce path is explicitly rejected by AGENTS.md AD-11 + pitfall #6 + AD-13 static-first). The deviation is flagged in the spec's Design Notes as a candidate for a future spine amendment.

These are logged here so reviewers do not re-flag them as new findings.
