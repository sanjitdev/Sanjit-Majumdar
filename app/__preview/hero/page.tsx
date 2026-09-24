import { Hero } from '../../../components/Hero';

// B5 — keep preview URLs out of production search indices. CI harness, not a
// user-facing page; indexing would surface an unfinished internal page in
// search results.
export const metadata = {
  title: 'Hero preview',
  robots: { index: false, follow: false },
};

/**
 * Preview harness for `<Hero>` (story 1-8).
 *
 * Server component (no `"use client"` at the top). Renders `<Hero />` inside
 * `<main id="main">` so CI can hit `/__preview/hero` and verify the layout /
 * typography contracts before 1-11 mounts them on `app/page.tsx`:
 *   - two-column layout at `xl+` (spine + cluster left, dual-ring canvas right)
 *   - single-column below `xl` (canvas hidden via `hidden xl:block`)
 *   - spine line rendered verbatim with U+2014 em-dash
 *   - gradient-text climax on the second sentence (--gradient-text, 90deg, 2 stops)
 *   - four closed proof-number tokens rendered as standalone tokens in text content
 *   - MagneticCTA climax copy `Read the case studies` (NOT `Hire me`, which is the
 *     persistent <Nav> right-region climax in 1-7)
 *
 * The `__preview/` (double underscore) folder avoids Next.js's `_components`
 * private-folder convention, matching the 1-6 / 1-7 preview routes.
 */
export default function HeroPreviewPage() {
  return (
    <main id="main" className="min-h-screen bg-bg p-8 pt-[120px] text-fg">
      <Hero />
      <div className="mx-auto mt-24 max-w-3xl">
        <h2 className="text-2xl font-semibold">Hero preview</h2>
        <p className="mt-4 text-fg-2">
          Two-column layout at xl+; single-column below. The signature canvas
          mounts at viewport-right only at xl and above. Scroll to verify the
          gradient-text climax renders in --gradient-text (violet → cyan).
        </p>
      </div>
    </main>
  );
}
