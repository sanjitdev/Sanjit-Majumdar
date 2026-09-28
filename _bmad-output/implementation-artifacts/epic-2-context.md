# Epic 2 Context: Content Schema, Two-Repo Read Path, and a Move-Tagged Pattern Stub

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Wire the additive Zod 4 content schema, the `sanjit-content` shallow-clone read path, the `POST /api/revalidate` edge handler, the 5-minute TTL fallback on every ISR route, and a weekly content-audit workflow. Pre-publish a move-tagged pattern stub into `sanjit-content` so E3's case-study citations have a real target. Audit the Vercel plan tier's memory budget so E4's Puppeteer route doesn't surprise-deploy on Hobby. By E2's done, Sanjit can edit any `status: published` content file, push to `sanjit-content`, and see the change live in under 30s without rebuilding the code repo.

## Stories

- Story 2-1: Set up `sanjit-content` repo with content directory layout and GitHub Actions workflow listening to push / delete / force-push
- Story 2-2: Implement additive Zod 4 schemas for case-study, pattern, lab, project, currently-building entry, cv
- Story 2-3: Implement content reader at `lib/content/reader.ts` walking only `status === 'published'`
- Story 2-4: Implement Next.js shallow-clone of `sanjit-content` at build time (DONE)
- Story 2-5: Implement `POST /api/revalidate` edge handler with `revalidateTag(tag, 'max')` (Next 16 signature)
- Story 2-6: Apply `revalidate: 300` (5-minute TTL) fallback on every ISR route
- Story 2-7: Pre-publish a move-tagged pattern stub in `sanjit-content` (`/patterns/canonical-model`)
- Story 2-8: Audit Vercel plan tier for `POST /api/forward-pdf` memory budget (≥ 1769 MB)
- Story 2-9: Implement weekly content-audit workflow

## Requirements & Constraints

- **Single read path (AD-1):** content lives in `sanjit-content` git repo; the Next.js build shallow-clones it into `content/`; routes read from the clone; no runtime GitHub HTTP API call for content. The `sanjit-content` GitHub Action listens to push/delete/force-push and calls `POST /api/revalidate?tag=<tag>[&slug=<slug>][&sha=<sha>]`.
- **Closed serverless endpoint set (AD-3):** exactly three endpoints — `GET /api/now` (edge), `POST /api/forward-pdf` (Node.js, ≥ 1769 MB, maxDuration = 60), `POST /api/revalidate` (edge). Adding any endpoint requires a spine amendment.
- **No build on content edits (AD-9):** content edits trigger only `revalidateTag()` via webhook — never a code-repo build. Enforced by separate workflows on the two repos, no Vercel hook on `sanjit-content`, and a weekly CI audit (story 2-9).
- **TTL fallback (FR-14):** every ISR route carries `revalidate: 300` so that a missed webhook still regenerates within 5 minutes.
- **Build-fail contract (AD-5):** malformed `status: published` frontmatter fails the build with a per-file diagnostic (`ZodError.issues`). Drafts are tolerated.
- **Closed tag enumeration (AD-1):** bare tags `now`, `cv`; typed tags `<type>:<slug>` where `<type>` ∈ {`case-study`, `pattern`, `lab`, `project`}. Adding a new tag type requires a spine amendment.
- **Next 16 signature:** `revalidateTag(tag, 'max')` only — single-arg form is deprecated (AGENTS.md pitfall #3).

## Technical Decisions

- **Architecture:** Next.js 16.3.6 (App Router, Turbopack default, `revalidateTag(tag, 'max')`), React 19.2, Tailwind v4, MDX via `@next/mdx`. Strict CSP via `experimental.sri` (no `'unsafe-inline'`).
- **Routing:** `proxy.ts` at project root (Next 16 convention; `middleware.ts` deprecated). Server-side only — never touches CSP / nonce.
- **Build pipeline (story 2-4 DONE):** `package.json` `prebuild` + `predev` scripts call `tsx scripts/clone-content.mts`, which shallow-clones `sanjit-content` into `content/` (auth via `GIT_TOKEN`), then runs `readContent({ contentRoot: 'content' })` from `lib/content/reader.ts` and exits 1 on any diagnostic.
- **Content reader (story 2-3 DONE):** `lib/content/reader.ts` exports `readContent({ contentRoot })` returning `{ published, drafts, diagnostics }`. Walks only `status: published`; drafts are tolerated.
- **Zod 4 schemas (story 2-2 DONE):** `lib/content/*.ts` — one shared base + six per-type schemas, all `.partial({ title: true }) + .passthrough()`.
- **The handler (story 2-5, THIS):** `app/api/revalidate/route.ts` — `runtime = 'edge'`, accepts `POST /api/revalidate?tag=<tag>[&slug=<slug>][&sha=<sha>]`. Auth via `Authorization: Bearer <REVALIDATE_SECRET>` (already sent by 2-1's workflow). Constructs the full tag (`<type>:<slug>` or bare `<tag>`), enforces the AD-1 closed set, calls `revalidateTag(finalTag, 'max')`, returns structured JSON. Single-arg `revalidateTag(tag)` is forbidden.
- **The TTL (story 2-6, deferred):** lives on each ISR route as `export const revalidate = 300` — NOT in this handler. This handler is just the webhook receiver.
- **Story 2-5 scope guard:** no TTL on routes, no canonical-model stub publication, no Vercel plan audit, no audit workflow.

## UX & Interaction Patterns

(No new UX-DRs in this epic — the epic is plumbing. UX surfaces land in E3+ when content routes render.)

## Cross-Story Dependencies

- **2-5 depends on 2-1:** the workflow in `sanjit-content/.github/workflows/revalidate.yml` already POSTs `?tag=<tag>&slug=<slug>&sha=<sha>` with `Authorization: Bearer <REVALIDATE_SECRET>`. The handler must accept this exact shape (plus auth).
- **2-5 precedes 2-6:** the TTL fallback on routes assumes the handler exists. Story 2-6 is independent of the handler's internals but requires the endpoint URL to be live.
- **2-5 precedes E3:** all content routes in E3 (patterns index, case studies, lab) rely on `revalidateTag()` working on their typed tags.
- **2-7 stub is a hard prerequisite for 3.3 + 3.4:** the citation walker requires a published `canonical-model` to deep-link to; 2-7 ships that.
- **Deferred spine amendments (do NOT silently adopt):** AGENTS.md #14 (AD-4 move-id validation — partial mitigation in 3.3), #15 (AD-6 + AD-12 7-layer drift — partial mitigation in 5b.3), #16 (AD-7 + AD-14 mobile-touch fallback — partial mitigation in 4.4). Each amendment requires the spine-amendment process, not a build-time override.
