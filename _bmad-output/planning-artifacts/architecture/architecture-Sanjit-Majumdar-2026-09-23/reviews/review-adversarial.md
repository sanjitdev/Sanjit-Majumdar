# Adversarial Two-Units-Attack Review — Architecture Spine v5

**Target:** `ARCHITECTURE-SPINE.md` v5 (Sanjit Majumdar engineering portfolio, 2026-09-23)
**Method:** Two builder units constructed at the layer below the spine. **Unit A — "AppBuilder"** reads the spine and builds the Next.js app (`app/`, `components/`, `lib/content/*`, the three serverless endpoints). **Unit B — "ContentBuilder"** reads the spine and builds the content pipeline (`sanjit-content` repo: `now-snapshot.json`, the GitHub Action, `cv.md`, the case-study/pattern MDX frontmatter). Both units trust every AD literally; neither is permitted to "fix" a hole by inferring unstated intent. Where their literal readings produce user-visible breakage on ship, that's a finding.

**Scope:** v5-introduced findings only. The v1 review (this file's predecessor) closed AD-2 entry shape, AD-2 CV ownership, and AD-10 snapshot write-path; those are not re-litigated here. Findings are ordered by impact (most user-visible first).

---

## Finding 1 — Stale `?for=recruiter` bookmark + Puppeteer URL contract split between AD-7 and amended AD-8/14

**ADs involved:** AD-7 (Puppeteer renders `/?for=recruiter&forward=1&case=<slug>` — *carryover text unchanged*), amended AD-8 (recruiter-mode is a route at `app/recruiter/page.tsx`; `?for=recruiter` semantics gone), amended AD-14 (canonical share URL is `https://sanjit.dev/recruiter?forward=1&case=<slug>` — *no `?for=recruiter`*).

**Unit A reads AD-7 and amended AD-8 literally.** Unit A deletes the `?for=recruiter` query handling from the homepage (amended AD-8 says "removed entirely"). Unit A also deletes the `?for=recruiter` branch from the homepage render path. Unit A's `app/recruiter/page.tsx` reads `searchParams` for `forward=1` and `case=<slug>` only. Unit A's PDF endpoint reads case from `searchParams`, no `for` param.

**Unit B reads AD-7 literally.** Unit B's content-repo README / share-link docs (or Sanjit's hand-shared URL) still embed `https://sanjit.dev/?for=recruiter&forward=1&case=<slug>` because AD-7 carries that exact string verbatim and was never amended in v5. Unit B also doesn't ship any URL normalizer.

**Divergence.** (a) A recipient with a stale v1-era bookmark to `/?for=recruiter` lands on the homepage with `searchParams.for === "recruiter"`; Unit A's homepage reads `?for=recruiter` as nothing — there is no branch. The recipient sees the homepage hero with no recruiter surface, no status strip, no 2×2 grid. (b) If Sanjit (or anyone) copy-pastes AD-7's text into a recruiter-facing share artifact, the Puppeteer endpoint receives `?for=recruiter&forward=1&case=<slug>`, renders `app/page.tsx` (homepage), not `app/recruiter/page.tsx`. The PDF artifact shows the homepage hero, not the recruiter-route hero — silently violating AD-12's `recruiter-route closing CTA` spine-line variant and AD-14's "the canonical share form" claim. (c) The v5 Consistency Conventions table row "Data — recruiter-route URL shape" was correctly updated to `/recruiter?forward=1&case=<slug>` but AD-7's body text was not. The spine carries two contradicting definitions of the same URL.

**Fix (proposed AD-7 amendment).** Replace the Puppeteer render target in AD-7's rule body: `The function renders /recruiter?forward=1&case=<slug> (per amended AD-14)`. Also add a one-line rule in amended AD-8: "A request to `/?for=recruiter*` is treated as a 308 redirect to `/recruiter?{rest of query string}`, preserving `forward` and `case`; this normalizes legacy v1 bookmarks and any share link that still embeds the old shape." Without either fix, two literal readers produce a broken PDF for any share that still embeds the v1 URL.

---

## Finding 2 — AD-12 `layered-architecture` mode-id assertion contract is unanchored

**ADs involved:** AD-12(d) (CI asserts the literal `layered-architecture` mode id is present in `/built`'s HTML), AD-17 (mode table assigns `layered-architecture` to `/built`), AD-6 (architecture diagrams co-source from `architecture-diagrams.md` AND `DESIGN.md.components.sig-canvas.modes`).

**Unit A reads AD-12(d) literally** and renders the signature canvas on `/built` with the mode id as an HTML attribute. Unit A picks one of three reasonable conventions:
- `data-mode="layered-architecture"` on the `<SignatureCanvas>` wrapper,
- `data-sig-canvas-mode="layered-architecture"` on the hero big-version diagram,
- or `class="layered-architecture"` on the SVG.

All three pass a naive `grep "layered-architecture"` CI check.

**Unit B reads AD-12(d) literally** and writes the GitHub Action / CI workflow as: `grep -F "layered-architecture" .next/server/app/built.html`. Unit B's CI passes against any of Unit A's three conventions above.

But **Unit B's CI also passes falsely** because the literal string `layered-architecture` will appear in any of:
- the prose copy "The canonical layered architecture diagram …" (a sentence Unit A writes into the hero body to satisfy the spec),
- the 7-layer enumeration text where each layer name happens to be a kebab-case id,
- the page's `<title>` if Unit A includes the mode id in the title for SEO.

Conversely, **Unit A could ship a build where the assertion passes via the prose** and the SignatureCanvas is mounted with the wrong mode id (e.g., `layered-architecture-v2`, or a typo'd `layerd-architecture`). The CI is silent on this because the grep is on the entire HTML, not on the SignatureCanvas's mode attribute specifically.

**Divergence.** AD-12(d) prevents the v4 drift bug (hero big diagram ↔ canvas small diagram) only if the assertion is anchored to the canvas's mode attribute, not to the page's prose. Today, the assertion is a string-in-HTML check; it cannot fail when the canvas's mode id is wrong but the page contains the string elsewhere.

**Fix (proposed AD-12 amendment).** Replace AD-12(d) with: "The `/built` page must contain a single element with the attribute `data-sig-canvas-mode="layered-architecture"`. The CI assertion is `grep -F 'data-sig-canvas-mode="layered-architecture"' .next/server/app/built.html | wc -l` equals exactly 1 (the small-version canvas; the big-version diagram is a separate `ArchitectureDiagram` component, not a signature-canvas mount, and is not asserted here)." Also: add to AD-17 a rule that "every `<SignatureCanvas>` mount emits `data-sig-canvas-mode="<mode-id>"` on its wrapper; the attribute name is binding."

---

## Finding 3 — AD-17 mode table omits five routes the spine itself enumerates

**ADs involved:** AD-17 (closed list of 9 modes, "each route renders exactly one mode"), AD-13 (`<SignatureCanvas>` "Mounts on: every route (≥1280px viewport); selects one of 9 enumerated modes per AD-17"), the structural seed in the spine.

**Unit A reads AD-17's table** (9 rows) and AD-13's table cell "Mounts on: every route." Unit A has to pick a behavior for routes not in the 9-row table:
- `/patterns` (index page — listed in the structural seed: `app/patterns/page.tsx`, "signature-canvas mode: decision-graph, shared"),
- `/projects/[slug]` (listed in structural seed, no canvas mode assigned),
- `/lab/[slug]` (listed in structural seed, only `/lab` index has a row),
- `/now/feed.xml/route.ts` (RSS — listed in structural seed),
- `/not-found.tsx` (404 — added by amended AD-12).

**Unit B reads the structural seed's inline comment** that says `/patterns` shares the `decision-graph` mode and writes its MDX accordingly (every pattern-index entry's frontmatter assumes a canvas is rendered). Unit B also writes `/lab/[slug]` MDX expecting an `experiment-graph` canvas, matching the index.

**Divergence.** The spine's AD-17 table does not list `/patterns` (index), `/projects/[slug]`, `/lab/[slug]`, `/now/feed.xml`, or `/not-found.tsx`, but the structural-seed prose assigns modes to some of them. AD-13's component-table cell says "every route." Three reasonable literal Unit A behaviors diverge:
- (a) Render the canvas with no mode prop / an "unset" state — but AD-17 says "the 9 modes are enumerated and closed," so an unset state is undefined; CSS will break or render empty.
- (b) Hide the canvas on unlisted routes — but AD-13 says "every route," and the structural seed for `/patterns` says the canvas mounts there.
- (c) Reuse the index page's mode (`decision-graph` on `/patterns`, `experiment-graph` on `/lab/[slug]`) — but AD-17 says each of the 9 rows maps to one specific route.

The most user-visible break: `/lab/[slug]` (a real Lab tool page) renders without a signature canvas because AD-17 has no row for it, contradicting the structural-seed assignment and breaking the "Lab = pink (`--accent-3`)" brand promise on every actual Lab tool page.

**Fix (proposed AD-17 amendment).** Extend the table to enumerate every public route (including the index pages, the project routes, the 404, the RSS feed): add rows for `/patterns` → `decision-graph`, `/projects/[slug]` → `dual-ring` (or a new closed-set `project-grid` mode), `/lab/[slug]` → `experiment-graph`, `/now/feed.xml` → "canvas hidden (non-HTML surface)", `/not-found` → "canvas hidden (404 surface; spine-line + proof-number + return-path per AD-12(e))". Or, alternatively, amend AD-17 to explicitly state: "Routes not enumerated in the table do not mount `<SignatureCanvas>`; the slot is omitted from layout for those routes." Pick one and bind it — today the spine is silent on these five routes.

---

## Finding 4 — AD-18 closed design-token set has wrong counts, missing categories, and one ambiguity on `--accent-2/3` scope

**ADs involved:** AD-18 (closed token list, AD-18 rule "Adding a token requires a spine amendment"), AD-17 (mode-to-accent mapping), AD-13 (motion gates rely on transition-duration values), AD-19 (breakpoint slot visibility), AD-20 (a11y focus styles use `--shadow-glow`).

**Unit A reads the rule headings** "Colors (16)," "Typography (11)," "Spacing (8)" and ships an `@theme` block with exactly those counts. **Unit B reads the parenthetical enumerations** (which list 21 colors, 13 typography tokens, 9 spacing tokens) and ships all of them. Both are equally literal. **Divergence:** two `@theme` blocks, one shorter than the other; the spine itself is internally inconsistent.

**Missing categories that a builder needs but the spine doesn't enumerate:**
- **Animation / motion tokens** — AD-16's "8 motion surfaces" all need a `transition-duration` and an `animation-duration` to collapse to 0.01ms per AD-20. There is no `--motion-fast`, `--motion-base`, `--motion-slow` token in the closed list. Unit A writes inline `0.01ms` in every motion surface's CSS; Unit B (an AD-16 reviewer) flags every inline duration as "raw value outside the closed token set" per AD-18's prohibition on inline values.
- **Z-index tokens** — `<CommandPalette>` (modal), `<SignatureCanvas>` (top-right slot), `<ScrollProgress>` (nav bar), and the recruiter-route "Copy URL" CTA's print stylesheet all layer on top of each other. There is no `--z-canvas`, `--z-nav`, `--z-modal`, `--z-tooltip` token; Unit A picks four arbitrary integers, Unit B picks four others, and a modal ends up behind the canvas or a tooltip under the modal.
- **Opacity tokens** — `--glass` and `--glass-strong` exist but their alpha is baked into the color value, leaving no opacity scale for hover states (e.g., `--hover-overlay`).
- **`prefers-reduced-motion` duration token** — AD-20 says "all `animation-duration` and `transition-duration` collapse to 0.01ms"; AD-18 doesn't expose a token for that value.

**`--accent-2` (Built) vs `--accent-3` (Lab) ambiguity.** AD-18 says "`--accent-2` (Built page only)" and "`--accent-3` (Lab page only)." The route split per AD-17 is `/built` (mode `layered-architecture`, `--accent-2`) and `/lab` (mode `experiment-graph`, `--accent-3`). What about `/lab/[slug]` (Finding 3's gap)? If Unit A decides "Lab page only" means the index only and ships `--accent` on `/lab/[slug]`, the brand promise "Lab = pink" is broken on the actual Lab tool pages. AD-18 needs to bind "Lab route tree" not "Lab page."

**Fix (proposed AD-18 amendment).**
1. Fix the counts: Colors 21, Typography 13, Spacing 9 (mirror the enumerations), or rebind the counts to the rule headings and trim the lists. Pick one.
2. Add the missing categories to the closed set: Motion (e.g., `--motion-fast: 150ms`, `--motion-base: 250ms`, `--motion-reduce: 0.01ms`), Z-index (`--z-canvas: 10`, `--z-nav: 20`, `--z-modal: 50`, `--z-tooltip: 60`), Opacity (`--glass-alpha: 0.6`, `--hover-overlay: 0.08`).
3. Bind the accent scope by route tree, not page: "`--accent-2` is used only inside the `/built` route subtree (which is just `/built`); `--accent-3` is used only inside the `/lab` route subtree (which includes `/lab` index and `/lab/[slug]` per AD-17's mode assignment once that gap is closed)."

---

## Finding 5 — Motion-discipline gate omissions: the "8 motion surfaces" claim covers 6, not 8, and the missing 2 are general-CSS hovers with no gate

**ADs involved:** amended AD-16 (enumerates "8 distinct motion surfaces" that all must honor `prefers-reduced-motion`), AD-13 (component-table motion-gate column for 5 surfaces), AD-20 (a11y floor's reduced-motion rules for 5 surfaces).

**Unit A reads amended AD-16** and writes a `prefers-reduced-motion` media query in `app/globals.css` that targets every `*` and collapses all `animation-duration` / `transition-duration` to 0.01ms. The CSS handles all surfaces by brute force — the spine's gate list is satisfied because the global rule catches everything.

**Unit B (the content side) reads amended AD-16** and writes MDX prose for the case-study `card hover lift` and `ticker-row hover` motion surfaces — but these are general-CSS hover effects, not a component. Unit B's MDX ships inline `transition: transform 200ms ease` on a card class. The global CSS rule catches it on `prefers-reduced-motion`, but on `pointer:fine` (touch device with reduced-motion off), the hover transition fires anyway. AD-16 doesn't gate `card hover lift` and `ticker-row hover` on `pointer:fine` because they are not pointer-dependent.

**Divergence.** The amended AD-16 text says "8 distinct motion surfaces that did not exist before v4" and lists them in prose: "magnetic CTA displacement (`<MagneticCTA>`), signature-canvas `sigFlow` dash-offset (`<SignatureCanvas>`), scroll-progress bar transform (`<ScrollProgress>`), command-palette scrim fade (`<CommandPalette>`), layer-row hover-sync (`<LayerRowHover>`), filter-chip `aria-pressed` swap (`<FilterChipGroup>`), card hover lift (general CSS hover), ticker-row hover (general CSS hover)." That's 8. But AD-13's component-table motion-gate column covers only 5 (`SignatureCanvas`, `ScrollProgress`, `CommandPalette`, `MagneticCTA`, `LayerRowHover`). `<FilterChipGroup>` is marked "none" in the table. AD-20 enumerates 5: `MagneticCTA`, `LayerRowHover`, `ScrollProgress`, `SignatureCanvas`, `CommandPalette`. The other three — `<FilterChipGroup>` aria-pressed swap, card hover lift, ticker-row hover — are not explicitly gated in either table.

Two literal readings diverge:
- (a) Unit A trusts AD-13's "none" gate for FilterChipGroup and ships a CSS transition on the `aria-pressed` flip (because AD-13 says "none"). This contradicts AD-16's enumeration of FilterChipGroup as a motion surface that must honor reduced-motion.
- (b) Unit A trusts AD-16's "all 8 must honor prefers-reduced-motion" and ships a CSS transition only inside a `@media (prefers-reduced-motion: no-preference)` block. This contradicts AD-13's "none" entry.

**Fix (proposed AD-13 + AD-16 amendments).**
1. Amend AD-13's motion-gate column for `<FilterChipGroup>` from "none" to "`prefers-reduced-motion` collapses the aria-pressed visual swap to 0.01ms (no transition; instant flip)."
2. Amend amended AD-16 to enumerate which 2 of the 8 are gated only by the global CSS rule (general CSS hovers: card, ticker) and which 6 are gated by component-level code. The current enumeration is misleading: a reviewer reads "all 8 must honor prefers-reduced-motion" and assumes 8 component-level gates exist; the truth is 6 component gates + 2 global-CSS gates.
3. Add to AD-20: "The `prefers-reduced-motion: reduce` global rule in `app/globals.css` MUST cover `*` selector for `animation-duration` and `transition-duration` properties, collapsing all to 0.01ms. This is the gate for general-CSS hover surfaces (card hover lift, ticker-row hover) enumerated in amended AD-16."

---

## Finding 6 — Pattern page heading-ID contract is ambiguous: `move-N` vs `M-N`, and which headings get ids

**ADs involved:** amended AD-4 (pattern page renders `M1..Mn` numbered moves "each anchor-linkable via native HTML heading IDs, e.g. `/patterns/canonical-model#move-3`"), AD-4 carryover (`pattern_moves: { "canonical-model": 3 }` frontmatter override on the case-study side).

**Unit A reads the amendment** and renders the case-study page's "Patterns cited" section with a deep link `<a href="/patterns/canonical-model#move-3">` (per the literal example). Unit A's pattern page (`app/patterns/[slug]/page.tsx`) renders the four moves as `<h2 id="move-1">` through `<h2 id="move-4">`, and the counter-line block as `<h2 id="counter">` or similar (no `M`-prefix because the AD uses `move-`, not `M-`).

**Unit B reads the amendment** and writes MDX for patterns as numbered headings `## M1: ...`, `## M2: ...`, etc. Unit B's slugger emits `id="m1"`, `id="m2"` (or `id="M1"` if the slugger preserves case). Unit B also has `pattern_moves` overrides in case-study frontmatter that cite `"canonical-model": 3` — and Unit B interprets "3" as the move index (the third heading), but doesn't know whether Unit A's id is `move-3` or `m3` or `M3`.

**Divergence.** Three possible id conventions (`move-1`, `m1`, `M1`) × three possible selector behaviors (Unit A's case-study deep-link href) × one Unit B MDX writer. The AD's example uses `#move-3`, but the prose uses `M1..Mn`. Unit B's slugger may produce lowercase, drop the `move-` prefix, or preserve case.

Additionally: **which headings get `move-N` ids?** AD-4 says "M1..Mn numbered moves" — implying only the four move headings get ids. But the pattern MDX may have additional prose headings (intro, "When to use it," "When NOT to use it," references). If every `<h2>` gets a `move-N` id, the case-study's "Patterns cited" deep-link can collide with the intro heading (`#move-1` would point to the intro, not the first move). If only move headings get ids, Unit B's MDX needs a structural convention the spine doesn't bind (e.g., "headings inside a `<Moves>` MDX component" or "headings whose text starts with `M[number]:`").

**Fix (proposed AD-4 amendment).** Bind the heading-id contract exactly:
1. "On the pattern page, the four move headings carry ids `move-1`, `move-2`, `move-3`, `move-4` (zero-padded to `move-01`..`move-04` if move count > 9). The counter-line block carries id `counter`. The deep-link form is `/patterns/<slug>#move-N`. The `M1..Mn` notation in the prose is the visible label, not the id."
2. "Only the four move headings and the counter-line block carry these ids. Other prose headings on the pattern page (`<h2>` for intro, references, etc.) carry auto-generated slug ids from the MDX slugger, never `move-N`."
3. "Case-study `pattern_moves` frontmatter override `{"<slug>": N}` refers to the Nth move heading, anchored at `#move-N`. The walker resolves the override at build time and emits `<a href="/patterns/<slug>#move-N">`."

---

## Finding 7 — Command palette `aria-live` for fuzzy-filter results is implicit in AD-20; `recruiter ?case=` callout and ticker live region are also under-specified

**ADs involved:** AD-20 (a11y floor, "Adding any ARIA rule requires a spine amendment"), AD-13 (`<CommandPalette>` "live fuzzy filter" — *the prose says "live"*), AD-14 (recruiter-route `?case=<slug>` recommended-case-study callout — *carryover into v5 with no a11y note*).

**Unit A reads AD-13** and builds `<CommandPalette>` with a fuzzy filter that updates the visible result list as the user types. Unit A reads AD-20's enumerated rules and sees:
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby="cmdk-title"`,
- focus trap, Esc closes, scrim click closes,
- `aria-label` on the trigger,
- **no `aria-live` requirement for the filter result list**.

Unit A ships the result list without `aria-live`, on the rationale that live regions cause screen-reader chatter on every keystroke (a known perf concern).

**Unit B reads AD-13's "live fuzzy filter" prose** as an a11y requirement — "live" is a domain term meaning `aria-live`. Unit B's CI / pa11y audit (AD-20 says pa11y-ci asserts "every public route") runs the CommandPalette, types into the input, and flags the missing live region as an a11y violation.

**Divergence.** (a) The CommandPalette's filter-result list has no contract: either Unit A ships with `aria-live="polite"` (screen-reader announces each filter result set — chatty but accessible) or Unit A ships with `aria-live="off"` (silent — WCAG 4.1.3 status messages partially fails). The spine doesn't pick. (b) The recruiter-route's recommended-case-study callout (`?case=<slug>`) is a route-level content surface that changes based on URL — its a11y announcement behavior is not enumerated. (c) AD-20 says `aria-live="polite"` on the NOW ticker list — but the spine does not bind whether the *initial* load of the ticker is announced, whether each *new* entry is announced, or both. Unit A announces the initial set; Unit B announces each new entry.

**Fix (proposed AD-20 amendment).** Add to the closed a11y floor:
1. "`<CommandPalette>` result list: `aria-live="polite"` on the `<ul>` containing filter results, `aria-atomic="false"` so only the changed result count announces (not the full list). When the palette is closed, the live region is `aria-hidden="true"`."
2. "Recruiter-route `?case=<slug>` recommended-case-study callout: rendered with `role="region" aria-labelledby="recruiter-case-heading"` and `tabindex="-1"` so the callout is programmatically focusable on route load (the recipient's first paint must reach the callout for keyboard users)."
3. "NOW ticker list: `aria-live="polite"` on the list. On initial page load, the live region announces the count of currently-building entries (e.g., '3 currently-building entries'). On each new entry arrival, the new entry's title is announced. `aria-relevant="additions text"`."

---

## Finding 8 — Two-repo AGENTS.md mirror scope is undefined; Unit B may import rules it cannot honor

**ADs involved:** AD-1 (content repo separate, GitHub Action listens to push/delete/force-push, calls `POST /api/revalidate`), the two-repo topology in the spine (code repo + content repo), amended AD-13 (10 closed client components), AD-17 (9 signature-canvas modes), AD-18 (~30 design tokens).

**Unit A reads the spine** and ships a code-repo AGENTS.md that lists AD-13's closed client-component set, AD-17's 9 mode ids, AD-18's token list, AD-19's breakpoints, AD-20's a11y floor. The code repo's CI (pa11y-ci, AD-12 route invariants) enforces every AD.

**Unit B reads AD-1** and ships a content-repo AGENTS.md. The content repo does not run Next.js, does not render SignatureCanvas, does not import shadcn primitives. Unit B has to decide: which ADs mirror to the content repo, and which are code-repo-only?

**Divergence.** The spine's two-repo topology section does not enumerate the AGENTS.md mirror scope. If Unit B mirrors "the same managed block" literally (the spine's phrasing in AD-1 + the topology section implies a verbatim mirror), Unit B's AGENTS.md carries rules the content repo cannot honor:
- AD-13's closed client-component list (`<SignatureCanvas>`, `<CommandPalette>`, `<MagneticCTA>` etc.) — none of these mount in the content repo.
- AD-17's 9 mode ids — the content repo has no SVG mounts.
- AD-18's token list — the content repo's MDX references tokens via `var(--token-name)` but does not own the `@theme` block (that's `app/globals.css` in the code repo).
- AD-19's breakpoints, AD-20's a11y floor — the content repo doesn't render routes; AD-12's route invariants can't be run against it.

If Unit B instead mirrors only AD-1, AD-2 (entry shape), AD-5 (Zod schema), AD-9 (no content-triggered builds), AD-10 (snapshot shape), it has a content-only AGENTS.md. But the spine doesn't say which ADs are code-only, content-only, or both.

A literal-reading Unit B may copy AD-13's closed list into the content AGENTS.md; a future content contributor sees `<MagneticCTA>` and writes an MDX `interactive: true` block assuming the component exists in the content repo — it doesn't. The MDX ships; the build fails on render because the component isn't imported.

**Fix (proposed AD-1 amendment).** Add to AD-1: "The code-repo and content-repo AGENTS.md carry different managed blocks. The content-repo AGENTS.md mirrors the content-only subset: AD-1 (read path + webhook contract), AD-2 (KV namespace closed list, `now` and `contact` only; entry/snapshot shapes), AD-4 (citation walker walks published-set only), AD-5 (Zod 4 schema + .partial/.passthrough), AD-9 (no code builds on content edits; weekly audit), AD-10 (snapshot commit cadence; snapshot is KV-derived, never hand-edited). The code-repo AGENTS.md mirrors all 20 ADs. Cross-repo changes that touch both blocks (e.g., a new AD that adds a content-side concern) update both AGENTS.md files in the same PR."

---

## Net verdict

**PASS-WITH-NOTES.** The v5 amendments close all v1 findings and add eight new ones. The amendments are internally consistent on the headline claims (recruiter-mode is a route; 10 client components; 9 canvas modes; closed token list; 4 breakpoints; WCAG 2.1 AA floor) but each closed list has a gap that allows two literal builder units to ship incompatible surfaces on user-visible routes. None of the 8 findings require a redesign — each is fixable with a single AD amendment or a one-line rule addition. None block v5 adoption; all should land in a v5.1 spine amendment before the AppBuilder and ContentBuilder start writing code.

**Open v5-introduced findings: 8.** All are listed above. Most user-visible first: Finding 1 (broken bookmark / broken PDF), Finding 2 (silent CI pass on wrong canvas mode), Finding 3 (Lab tool pages render without canvas), Finding 4 (internally inconsistent token counts), Finding 5 (filter-chip motion gate missing), Finding 6 (pattern page deep-link collision), Finding 7 (CommandPalette filter live region), Finding 8 (content-repo AGENTS.md scope).
