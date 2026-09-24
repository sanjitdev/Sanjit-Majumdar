/**
 * lib/canvas-modes.ts — AD-17 closed signature-canvas modes.
 *
 * Co-source with `lib/design-tokens.ts` (AD-17 + AD-18). The 9 modes enumerate
 * the closed signature-canvas visual vocabulary; each maps to one (or more)
 * routes and an accent color from the closed token set. Adding a 10th mode
 * is a spine amendment — AD-17 closes the list.
 *
 * `<SignatureCanvas>` (components/client/SignatureCanvas.tsx) imports the
 * `CanvasMode` type and the `CANVAS_MODES` tuple; the component's switch
 * defaults to `never` so any future addition triggers a TypeScript
 * compile error until the SVG variants catch up (CANVAS_MODE_RUNTIME_DRIFT).
 *
 * Order matches the AD-17 enumeration in `epic-1-context.md` line 29 and the
 * `ARCHITECTURE-SPINE.md` table at AD-17. Do not reorder — downstream
 * enumerations in `epics.md` lines 240-253 reference positions.
 */

/**
 * The 9 closed canvas-mode strings (AD-17). `as const` so TypeScript
 * narrows `CanvasMode` to the literal union and the component's exhaustive
 * switch can use `never` as the default to catch drift at build time.
 */
export const CANVAS_MODES = [
  'dual-ring',
  'filter-graph',
  'section-progress',
  'timeline',
  'decision-graph',
  'experiment-graph',
  'activity-feed',
  'layered-architecture',
  'condensed-4-node-status',
] as const;

export type CanvasMode = (typeof CANVAS_MODES)[number];

/**
 * Closed route → mode mapping per AD-17 (epic-1-context.md line 29 +
 * ARCHITECTURE-SPINE.md table). Routes that intentionally have no canvas
 * (`/now/feed.xml`, `/404`) are omitted.
 */
export const CANVAS_MODE_ROUTES: Readonly<Record<CanvasMode, readonly string[]>> = {
  'dual-ring': ['/'],
  'filter-graph': ['/work'],
  'section-progress': ['/work/[slug]'],
  timeline: ['/projects/[slug]', '/about'],
  'decision-graph': ['/patterns', '/patterns/[slug]'],
  'experiment-graph': ['/lab', '/lab/[slug]'],
  'activity-feed': ['/now'],
  'layered-architecture': ['/built'],
  'condensed-4-node-status': ['/recruiter'],
};

/**
 * Closed mode → accent-color mapping per AD-17. The values reference the
 * named constants in `lib/design-tokens.ts` (1-5) so a token rename is a
 * single-line edit there.
 *
 * `dual-ring` → `/` + `ACCENT`
 * `filter-graph` → `/work` + `ACCENT`
 * `section-progress` → `/work/[slug]` + `ACCENT`
 * `timeline` → `/projects/[slug]` + `ACCENT`
 * `decision-graph` → `/patterns` + `ACCENT`
 * `experiment-graph` → `/lab` + `ACCENT_3`
 * `activity-feed` → `/now` + `ACCENT`
 * `layered-architecture` → `/built` + `ACCENT_2`
 * `condensed-4-node-status` → `/recruiter` + `LIVE`
 */
export const CANVAS_MODE_ACCENT: Readonly<Record<CanvasMode, string>> = {
  'dual-ring': 'var(--accent)',
  'filter-graph': 'var(--accent)',
  'section-progress': 'var(--accent)',
  timeline: 'var(--accent)',
  'decision-graph': 'var(--accent)',
  'experiment-graph': 'var(--accent-3)',
  'activity-feed': 'var(--accent)',
  'layered-architecture': 'var(--accent-2)',
  'condensed-4-node-status': 'var(--live)',
};
