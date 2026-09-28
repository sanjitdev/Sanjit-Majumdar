import type { Metadata } from 'next';

import { Footer } from '../../../components/Footer';
import { Hero } from '../../../components/Hero';

// B5 — keep preview URLs out of production search indices. CI harness, not
// a user-facing page; indexing would surface an unfinished internal page in
// search results. (See spec-1-6 review diff for the B5 origin.)
//
// `alternates.canonical` is a defense-in-depth SEO hint: this preview page
// duplicates the `/` composition (1-12-foundation-closeout fix #8). If the
// preview gate (app/preview/layout.tsx) ever regresses and a search engine
// does index it, the canonical points crawlers at the real homepage so the
// duplicate doesn't split ranking signals.
export const metadata: Metadata = {
  title: 'Homepage preview',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://sanjit.dev/' },
};

/**
 * Preview harness for the homepage surface (story 1-11).
 *
 * Server component (no `"use client"` at the top). Renders
 * `<Hero />` + `<Footer />` inside `<main id="main">` so a local CI run
 * can hit `/preview/homepage` and verify the homepage composition
 * contract before `app/page.tsx` ships:
 *   - `<Hero />` mounts with `<SignatureCanvas mode="dual-ring">` at xl+
 *     and the spine-line verbatim with U+2014 em-dash
 *   - the four closed proof-number tokens render as standalone tokens
 *   - `<Footer />` mounts with the `For recruiters?` link +
 *     `min-h-[44px]` (AD-20) + return-path `<a href="/">` link
 *   - the rendered HTML carries the spine-line + ≥1 proof number +
 *     return-path invariant (amended AD-12)
 *
 * 1-12-foundation-closeout fix 4: `app/__preview/` → `app/preview/`. Now
 * PUBLIC (no underscore prefix) so `pnpm audit:routes` and pa11y-ci can
 * reach it. The B5 `robots: { index: false, follow: false }` metadata
 * remains the search-index gate (preview routes should not surface in
 * Google even though they're reachable).
 */
export default function HomepagePreviewPage() {
  return (
    <div className="min-h-screen bg-bg p-8 pt-[120px] text-fg">
      <Hero />
      <Footer />
      <div className="mx-auto mt-24 max-w-3xl">
        <h2 className="text-2xl font-semibold">Homepage preview</h2>
        <p className="mt-4 text-fg-2">
          Composition of <code className="rounded bg-bg-2 px-1">&lt;Hero /&gt;</code>{' '}
          (story 1-8) and{' '}
          <code className="rounded bg-bg-2 px-1">&lt;Footer /&gt;</code>{' '}
          (story 1-11). The spine line, four closed proof-number tokens, the
          dual-ring signature canvas (xl+), and the recruiter-route footer
          link all render together. Toggle reduced-motion at the OS level
          to confirm <code className="rounded bg-bg-2 px-1">&lt;MagneticCTA&gt;</code>{' '}
          falls back to a static button.
        </p>
      </div>
    </div>
  );
}
