"use client";
import { useEffect } from 'react';

/**
 * <ScrollProgress> — AD-13 closed-set client component (9 of 10).
 *
 * Renders a 1px-tall accent-colored bar fixed to the viewport bottom. The
 * bar's `transform: scaleX(var(--progress))` reflects the current scroll
 * progress through the document. `--progress` is written to `:root` via
 * a passive scroll listener and clamped to `[0, 1]`.
 *
 * Motion gate (AD-16 / AD-20 parity with `<MagneticCTA>` and
 * `<SignatureCanvas>`): under `prefers-reduced-motion: reduce`, the
 * listener no-ops and the bar is pinned at `scaleX(0)` (visually empty
 * but still rendered so the bottom-edge layout doesn't shift). The gate
 * is re-evaluated at runtime via `addEventListener('change', ...)` so a
 * user toggling reduced-motion at the OS level gets the correct behavior
 * without remounting the nav.
 *
 * Cleanup contract: the effect MUST remove both the scroll listener AND
 * the `change` listener AND call `root.style.removeProperty('--progress')`.
 * Without the `removeProperty` call, the global CSS-var persists across
 * page navigations (Next.js App Router soft-navigates; the previous nav's
 * scroll position would leak into the next page until the new listener
 * first fires).
 */
export function ScrollProgress() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const reducedMql = window.matchMedia('(prefers-reduced-motion: reduce)');

    let enabled = !reducedMql.matches;

    const update = () => {
      if (!enabled) return;
      const doc = document.documentElement;
      const scrollable = Math.max(1, doc.scrollHeight - window.innerHeight);
      const raw = window.scrollY / scrollable;
      const clamped = Math.max(0, Math.min(1, raw));
      root.style.setProperty('--progress', String(clamped));
    };

    const onReducedChange = (e: MediaQueryListEvent) => {
      const nextEnabled = !e.matches;
      if (nextEnabled === enabled) return;
      enabled = nextEnabled;
      if (!enabled) {
        // Pin at 0 so the bar disappears immediately on reduced-motion enable.
        root.style.setProperty('--progress', '0');
      } else {
        update();
      }
    };

    window.addEventListener('scroll', update, { passive: true });
    reducedMql.addEventListener('change', onReducedChange);

    // Initial write so the bar reflects scroll position on mount (e.g.,
    // when navigating to a deep-link with an existing scroll offset).
    update();

    return () => {
      window.removeEventListener('scroll', update);
      reducedMql.removeEventListener('change', onReducedChange);
      // CRITICAL: prevents the --progress CSS-var from leaking across
      // page navigations (next page's listener will set it on its first
      // scroll, but if the user doesn't scroll, the previous page's value
      // would persist).
      root.style.removeProperty('--progress');
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-30 h-px w-full origin-left bg-[var(--accent)] transition-transform duration-100"
      style={{ transform: 'scaleX(var(--progress, 0))' }}
    />
  );
}
