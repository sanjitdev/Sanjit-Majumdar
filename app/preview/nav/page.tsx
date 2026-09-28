import { Nav } from '../../../components/Nav';

// B5 — keep preview URLs out of production search indices. This is a CI
// harness, not a user-facing page; indexing it would surface an unfinished
// internal page in search results.
export const metadata = {
  title: 'Nav preview',
  robots: { index: false, follow: false },
};

/**
 * Preview harness for `<Nav>` (story 1-7).
 *
 * Server component (no `"use client"` at the top). Renders
 * `<Nav currentPath="/preview/nav" />` inside `<main id="main">` with a
 * 200vh-tall `<div>` so:
 *
 *   - CI can hit `/preview/nav` and verify the sticky-nav contract:
 *       header is `sticky top-0 z-50 h-[76px]`
 *       <main id="main"> wraps content
 *       7 nav links render in order (Home, Work, About, Lab, Now, Built, Recruiter)
 *       brand mark is 28×28 with Tailwind gradient utility (no inline gradient literal)
 *       <MagneticCTA> has min-h-[44px] (AD-20 tap target)
 *       cmdk trigger carries aria-disabled="true" + title attr
 *   - The 200vh scroll body gives `<ScrollProgress>` measurable scroll
 *     distance so the bar's `scaleX` can be visually verified.
 *
 * 1-12-foundation-closeout fix 4: `app/__preview/` → `app/preview/`.
 */
export default function NavPreviewPage() {
  return (
    <div className="min-h-screen bg-bg p-8 pt-[120px] text-fg">
      <Nav currentPath="/preview/nav" />
      <h1 className="font-display text-2xl">Nav preview</h1>
      <p className="mt-2 text-fg-3">
        CI harness for the AD-13 Nav contract. Sticky nav at top, 7 nav links
        in closed-set order, brand mark + wordmark on the left, magnetic CTA
        + cmdk trigger on the right (all breakpoints). Scroll the page to
        verify the bottom 1px accent bar tracks scroll position.
      </p>
      <p className="mt-4 text-fg-3">
        This scroll body is intentionally 200vh tall so the
        <code className="mx-1 rounded bg-bg-2 px-1">&lt;ScrollProgress&gt;</code>
        bar has measurable scroll distance. Toggle reduced-motion at the OS
        level and confirm the bar pins at 0.
      </p>
      <div aria-hidden="true" className="h-[200vh]" />
    </div>
  );
}
