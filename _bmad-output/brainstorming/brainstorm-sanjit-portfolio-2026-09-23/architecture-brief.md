# Architecture Brief — Sanjit Portfolio

## 1. Architecture Summary

A static-first Next.js 14 (App Router) site hosted on Vercel, with all portfolio content living as typed Markdown files inside the repo and surfaced through Vercel ISR via on-demand revalidation. Serverless functions are reserved for two dynamic surfaces — the "currently building" feed and contact forwarding — and both fall back to a last-good snapshot if their upstream is cold. A client-only recruiter-mode toggle, a pre-rendered live architecture diagram, and a pattern library complete the surface area. No always-on database, no runtime CMS dashboard, no client framework weight past what is needed to render the lab and case studies.

## 2. Hard Constraints

| Constraint | Consequence |
|---|---|
| Hosted on Vercel (frontend + serverless functions) | Build, deploy, ISR, edge and regional functions all live on one platform. No external DB, no external queue. |
| Content editable without redeployment | All content is data (MDX/JSON). Edits trigger a `POST /api/revalidate` webhook from the content repo → only the affected route regenerates. Build pipeline never runs on content change. |
| Static-first rendering | Every public route is SSG or ISR. Client components are island-loaded; no global SPA hydration. |
| Additive content schema | Frontmatter is parsed by Zod with `.partial()` and `.passthrough()`; every field except `title` is optional; unknown keys are preserved. Old entries never break. |
| No always-on database | State that must persist across deploys (live now-list, contact submissions) lives in Vercel KV (free tier, serverless) — not a Postgres instance. |
| Homepage under 100 KB transferred | Gzipped HTML + CSS + above-the-fold JS ≤ 100 KB on first paint. Hero is text + a single SVG architecture diagram. |
| Functional on 2G (Bangladesh mobile) | Total page weight ≤ 200 KB, no blocking third-party JS on first paint, system font stack + one subset webfont, all images `loading="lazy"` + AVIF/WebP. |
| Lighthouse Performance ≥ 95 | Mobile profile, slow 4G throttling, no CLS, LCP < 1.8 s. Enforced by CI Lighthouse assertion in GitHub Actions. |

## 3. Recommended Stack

- **SSG / framework: Next.js 14 App Router.** Reason: native ISR + on-demand revalidation + RSC + edge functions in one toolchain; `revalidateTag` makes the content-update flow a one-liner.
- **Content source: a typed Markdown/JSON folder in a separate `sanjit-content` repo.** Reason: zero vendor lock-in, git-versioned CV, additive schema enforced by the Zod parser, webhook to Vercel is a single `repository_dispatch` event. A CMS dashboard is overkill for a single-author site; Sanity/Notion would re-introduce a runtime dependency the constraint set explicitly forbids.
- **ISR pattern: on-demand revalidation via webhook.** Content edits land on `main` in the content repo → GitHub Action `repository_dispatch` → `POST /api/revalidate?tag=<tag>` on Vercel → only the affected segment regenerates within 1–3 s. TTL fallback of `revalidate: 300` covers webhook delivery failure.

Content stays in MDX so React components (the live architecture diagram, lab tool cards, pattern callouts) can be composed inline without a plugin layer.

## 4. Content Schema (Additive)

Frontmatter shape. **Every key except `title` is optional.** Unknown keys pass through and are exposed via `entry.meta` for new components.

```ts
// shared.ts — the base every entry inherits
{
  title: string;                       // required
  slug?: string;                       // derived from filename if absent
  status?: 'draft' | 'published' | 'archived';
  tags?: string[];
  created?: string;                    // ISO
  updated?: string;                    // ISO, drives ordering on /now
  summary?: string;                    // <= 200 chars, used in cards + meta description
  proof?: string[];                    // bullet-shaped proof numbers ("10K+ users", "35% faster")
  links?: { label: string; href: string }[];
}
```

**Case study (Work)** — extends shared + adds the Problem → Constraints → Architecture → Decisions → Implementation → Challenges → Results shape used on the homepage featured-work slot.

```ts
{ ...shared,
  client?: string;
  vector?: 'scale' | 'delivery' | 'performance' | 'leadership';
  stack?: string[];
  period?: { start: string; end?: string };
  scale?: { users?: number; requests?: string; data?: string };
  metrics?: { label: string; value: string; context?: string }[];
  problem?: string;                   // markdown body
  architecture?: string;
  decisions?: string;
  challenges?: string;
  results?: string;
  patterns?: string[];                // filenames in /content/patterns
  quote?: { text: string; attribution?: string };
}
```

**Project** — simpler: what is being built, why, current state, where to try it.

```ts
{ ...shared,
  tagline?: string;
  stage?: 'concept' | 'building' | 'live' | 'paused';
  repo?: string;
  demo?: string;
  domain?: string;
  for_bd?: boolean;                   // marker for "Building things for Bangladesh"
}
```

**Lab tool** — Production / Experiment / Personal category is a field, not a folder.

```ts
{ ...shared,
  category: 'production' | 'experiment' | 'personal';
  what_it_is?: string;
  built_with?: string[];
  status_label?: string;              // free text shown as a badge
  why_it_exists?: string;
  interesting_part?: string;          // the signature line for this tool
  interactive?: boolean;              // if true, embed an iframe demo
  demo_src?: string;
}
```

**Pattern** — the 5 named openings live here as their own content type. See §7.

```ts
{ ...shared,
  opening_number: 1 | 2 | 3 | 4 | 5;
  one_line?: string;                  // the spine sentence, shown large
  setup?: string;                     // the situation
  moves?: { name: string; description: string }[];   // 2–5 named moves
  counter_moves?: string;             // when NOT to play this opening
  example_link?: string;              // slug of a case study that played it
}
```

**Currently-building entry** — short, append-only, drives /now.

```ts
{ ...shared,
  started?: string;
  doing?: string;                     // one-line current action
  next?: string;                      // one-line next milestone
  link?: string;
}
```

**CV / About** — a single file, `cv.md`, whose frontmatter holds contact + numbers and whose body renders the prose bio. Recruiter-mode toggle swaps in the lead-7 / ship-35% highlighted callout.

```ts
{ name: string;
  role: string;
  location?: string;
  contact: { email: string; phone?: string; links?: { label: string; href: string }[] };
  numbers?: { label: string; value: string }[];
  philosophy?: string[];              // the 4 principles
}
```

## 5. Dynamic Surfaces

| Surface | Mechanism | Fallback |
|---|---|---|
| `/now` Currently-building feed | Server Component reads from Vercel KV via a thin `getNow()` serverless function | Last-good snapshot JSON committed to repo; KV miss → snapshot |
| Contact / "Forward to hiring manager" | `POST /api/contact` serverless function → Resend API (transactional email) | `mailto:` link rendered if Resend key missing; client never silently fails |
| Recruiter-mode toggle | Client component, `localStorage` flag, URL param `?for=recruiter`, no server hit | n/a — purely client |
| Live architecture diagram | Client component, pre-rendered SVG, hydrates interactions only on hover/click | Static SVG fallback if JS disabled |
| Case studies, patterns, lab, about, writing | Pure SSG with ISR + on-demand revalidate | n/a |
| Analytics | Plausible (self-hostable) loaded async on `requestIdleCallback` | If blocked, page works — no analytics is non-critical |

## 6. Performance Budget

- **Total JS budget per route**: ≤ 50 KB gzipped on first load (homepage), ≤ 80 KB on case-study pages (they hydrate the interactive decision trail). Lab tool iframes are lazy-imported only on card click.
- **Images**: AVIF first, WebP fallback, `<picture>` with `srcset`. Hero illustration is inline SVG. All raster images pass through `next/image` with explicit width/height to kill CLS. Maximum raster weight per page: 150 KB.
- **Fonts**: one variable subset webfont (Inter or similar, latin + bangla glyph subset), `font-display: swap`, preloaded. System-ui stack as the immediate fallback. No icon fonts — SVGs only.
- **Third-party JS rule**: none on first paint. Analytics, embeds, anything iframe-based loads via `next/script` with `strategy="lazyOnload"`.
- **LCP target**: < 1.5 s on Slow 4G throttled mobile. LCP element is the hero headline text — no images in LCP path.
- **TTI target**: < 2.5 s on Slow 4G.
- **CLS**: < 0.05 site-wide.
- **2G budget**: total transferred for the homepage ≤ 100 KB; for any other route ≤ 200 KB. Enforced by a CI check that builds the site, hits each route, and asserts the gzipped weight.

## 7. The Pattern Library as Content Type

The five openings — **Canonical Model**, **Syncfusion Data-Grid**, **nopCommerce Plugin**, **Ship-Faster Pushback**, **Friday Architecture Review** — are themselves content, not components. Each lives as `/content/patterns/<slug>.mdx` with the Pattern frontmatter above. They render at `/patterns` (an index of the five openings, each as a card with `one_line`) and at `/patterns/<slug>` (the full opening book page: setup → moves → counter-moves → real example).

Case studies cite patterns by filename through the `patterns?: string[]` field. The case-study page renders each cited pattern as a deep-link card with `→ Read the full opening` going to `/patterns/<slug>#move-<n>`. This makes patterns deep-linkable for the "hiring manager's second-look" return path the brainstorm identified.

The Architecture Review opening is the leadership anchor — its `moves[0]` carries the verbatim "we cannot ship a weak and faulty product" quote so the signature proof line lives on a stable URL that a recruiter can forward verbatim.

## 8. Open Architectural Questions (5)

1. **MDX component scope**: which interactive components (architecture diagram, lab tool iframe wrapper, pattern callout, recruiter-mode forward button) ship as inline MDX components vs. as separate routes embedded via iframe? Decision affects the ISR cache shape.
2. **Content repo split**: separate `sanjit-content` repo with webhook, vs. monorepo with content under `/content` and revalidation on push to `main/content/**`. Trade-off is operational simplicity vs. author isolation.
3. **Currently-building source of truth**: Vercel KV (serverless, free tier), or a `now.mdx` file in the content repo with a `/now` route that revalidates on push? File source is simpler; KV lets the feed update without a git push from a phone.
4. **Pluggable Lab demos**: ship lab tools as fully independent Next.js apps under `/lab/<slug>` (separate route bundles per demo, fully isolated JS), or as iframe embeds to a single `lab.sanjit.dev` host? Isolation aids perf budget but multiplies deploy targets.
5. **Recruiter-mode analytics**: do we measure how often the forward-to-hiring-manager button is clicked (Plausible custom event), or treat it as a trust surface and leave no signal? The brainstorm treated forwarding as the highest-leverage state-change; the build has to decide whether to measure it or keep it quiet.
