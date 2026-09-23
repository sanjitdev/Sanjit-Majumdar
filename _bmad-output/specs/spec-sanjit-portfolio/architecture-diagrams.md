---
type: spec-companion
spec: SPEC-sanjit-portfolio
title: "Architecture Diagrams — Live System Map and Flow"
---

# Architecture Diagrams

The "How this site is built" page on the deployed site renders a live architecture diagram. This companion holds the canonical diagrams that the live component renders. Diagrams always live in a companion (Spec Law rule).

---

## 1. System Map (high level)

```
                    ┌──────────────────────────────┐
                    │   VERCEL (CDN + EDGE)        │
                    │                              │
   VISITORS ───────►│   ┌─────────────────────┐    │
   (recruiter,      │   │  Next.js 14         │    │
    engineer,       │   │  App Router         │    │
    curious)        │   │                     │    │
                    │   │  SSG + ISR routes   │    │
                    │   │  / /work /lab       │    │
                    │   │  /patterns /now     │    │
                    │   └──────────┬──────────┘    │
                    │              │               │
                    │   ┌──────────▼──────────┐    │
                    │   │  Serverless fns     │    │
                    │   │  /api/revalidate    │    │
                    │   │  /api/contact       │    │
                    │   │  /api/now           │    │
                    │   └──────────┬──────────┘    │
                    │              │               │
                    └──────────────┼───────────────┘
                                   │
                  ┌────────────────┼─────────────────┐
                  │                │                 │
            ┌─────▼─────┐    ┌─────▼─────┐    ┌──────▼──────┐
            │  Vercel   │    │  Vercel   │    │  Resend API │
            │  KV       │    │  KV       │    │  (email)    │
            │  (now     │    │  (contact │    │             │
            │   entries)│    │   queue)  │    │             │
            └───────────┘    └───────────┘    └─────────────┘
                  ▲
                  │
       ┌──────────┴─────────────────────────┐
       │   CONTENT REPO (separate)          │
       │   github.com/sanjit/portfolio-     │
       │   content                          │
       │                                    │
       │   /case-studies/*.mdx              │
       │   /projects/*.mdx                  │
       │   /lab/*.mdx                       │
       │   /patterns/*.mdx                  │
       │   /now/*.mdx                       │
       │   /cv.md                           │
       └──────────────┬─────────────────────┘
                      │
              push to main
                      │
       ┌──────────────▼─────────────────────┐
       │   GITHUB ACTION                    │
       │   repository_dispatch            │
       │   → POST /api/revalidate?tag=  │
       │   → affected route regen        │
       └──────────────────────────────────┘
```

The deployed page renders this diagram as a clickable SVG. Each box has hover state showing the implementation detail (file path, route, deployment URL). Recruiters pokes at it; engineers audit it; hiring managers see "this isn't a template."

---

## 2. Content Update Flow (webhook → ISR)

```
  AUTHOR                    GITHUB                       VERCEL
  ──────                    ──────                       ──────

  edit                       │
  /case-studies/             │
  wellbook.mdx               │
       │                     │
       ├──── git push ──────►│
       │                     │
       │              workflow:
       │              repository_dispatch
       │                     │
       │              ┌──────▼───────────────┐
       │              │  POST                │
       │              │  /api/revalidate     │
       │              │  ?tag=case-study    │
       │              │  &slug=wellbook     │
       │              └──────┬───────────────┘
       │                     │
       │                     │           ┌──────▼──────────────┐
       │                     │           │  revalidateTag()    │
       │                     │           │  in App Router      │
       │                     │           │                     │
       │                     │           │  next request to    │
       │                     │           │  /work/wellbook     │
       │                     │           │  returns fresh HTML │
       │                     │           └─────────────────────┘
       │                     │
       │              TTL fallback:
       │              revalidate: 300
       │              (5 min) covers
       │              webhook delivery failure

  end-to-end target: < 8 seconds from push to live route
```

This is the **CAP-5** flow. The integration test that proves CAP-5 (per SPEC.md) edits a content file, waits 5 seconds, and asserts the deployed route reflects the change.

---

## 3. Recruiter-Mode Flow

```
  VISITOR ARRIVES
       │
       ├── URL contains ?for=recruiter  ──► render in recruiter-mode
       │
       ├── localStorage.for_recruiter === true  ──► render in recruiter-mode
       │
       └── otherwise  ──────────────────► render in normal-mode
                                          │
                                          ▼
                              ┌──────────────────────┐
                              │  small persistent    │
                              │  toggle (top-right)  │
                              │  "For recruiters"   │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              flip localStorage flag
                              + update URL (replaceState)
                              + re-fetch spine components
```

The toggle is a **client component** — no server hit. The URL change makes recruiter-mode deep-linkable: a recruiter can paste `?for=recruiter` into a Slack DM and the recipient lands in recruiter-mode without needing to click the toggle.

The forward-to-hiring-manager button (CAP-2) generates either:
- A shareable URL: `https://sanjit.dev/?for=recruiter&forward=1&case=<slug>`
- A PDF: same content, rendered as a single-page PDF via the serverless function `/api/forward-pdf`

Open Question Q1 (SPEC.md) determines which of these ship.

---

## 4. Currently-Building Feed Flow

```
  AUTHOR PHONE / LAPTOP                  VERCEL KV
  ─────────────────────                  ─────────
       │
       │   POST /api/now
       │   { entry: { doing, next } }
       ├──────────────────────────────►  │
       │                                  │
       │                                  ▼
       │                            KV: write entry
       │                            with timestamp
       │
       │
  VISITOR ON HOMEPAGE                  VERCEL KV
  ─────────────────                    ─────────
       │
       │   GET /api/now
       ├──────────────────────────────►  │
       │                                  │
       │                                  ▼
       │                            read KV
       │                            if stale (>7 days):
       │                              fall back to last-good
       │                              snapshot from /content/now-snapshot.json
       │
       ◄── { entries: [...],
             fallback: false | true,
             last_updated: ISO }
       │
       ▼
   render feed with:
     - latest entries
     - "(last updated N days ago)" tag if fallback
     - never an empty state, never an error
```

The fallback is **CAP-6**. The last-good snapshot lives in the content repo at `/content/now-snapshot.json` so it ships with the build and is always available even if Vercel KV is unreachable.

---

## 6. CI Performance Enforcement (CAP-7)

```
  PR opened
       │
       ├── yarn install
       ├── yarn build (Next.js production build)
       ├── yarn test (unit tests, content schema validation)
       │
       ├── lighthouse-ci autorun
       │     throttling: Slow 4G mobile profile
       │     asserts:
       │       - homepage LCP < 2.0s (margin below 1.8s SPEC budget)
       │       - any route gzipped < budget (100KB homepage / 200KB other)
       │       - CLS < 0.05
       │       - Lighthouse Performance ≥ 95
       │
       ├── gzip-budget check
       │     curl each route
       │     assert transfer size
       │
       └── if any assertion fails → PR blocked
```

The CI rules live as code, not as documentation. A regression to the performance budget fails the build before merge.

---

## 7. Diagram Companion Notes

- All diagrams above are referenced from `architecture-diagrams.md`. The deployed "How this site is built" page reads this companion and renders an interactive version.
- When the architecture changes, this companion is updated; the deployed diagram updates via the same content-update flow that drives case studies and patterns.
- Diagrams always live in a companion, never in SPEC.md (Spec Law).