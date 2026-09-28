/**
 * <Footer> — AD-13 closed-set discipline: server component (no `"use client"`).
 * Populates the empty `<footer role="contentinfo">` landmark rendered by
 * `app/layout.tsx` (1-9). The landmark WRAPPER lives on the layout; this
 * component renders the landmark's BODY content so a future story
 * (e.g., 5a.6 "homepage currently-building summary", or 4.7 "wire the
 * recruiter footer link on every public page") can add siblings inside the
 * landmark without restructuring it.
 *
 * Contents (closed per epic-1-context.md line 40 + amended AD-12):
 *   - heading "For recruiters?" + supporting copy
 *   - the closed `For recruiters?` link to `/recruiter` (plain <a>, NOT
 *     <MagneticCTA> — the persistent <Nav> right-region is the only
 *     magnetic CTA per UX-DR3; the footer link is the static recurrence
 *     affordance for organic visitors who scan past the hero)
 *   - return-path `<a href="/">← Back to sanjit.dev</a>` link so the
 *     homepage's HTML carries `href="/"` (return-path invariant per
 *     amended AD-12; the <Nav> brand-mark at components/Nav.tsx:53 also
 *     emits it — defense-in-depth)
 *   - the AD-20 `min-h-[44px]` tap-target floor on every actionable link
 *     so mobile visitors can land on them with a thumb
 *
 * Token discipline (AD-18): the only colors referenced inline are the
 * closed `--border-strong`, `--glass`, `--glass-strong`, `--fg`, `--fg-2`,
 * `--fg-3` Tailwind utilities, all of which resolve to `var(--*)`
 * declarations in `app/globals.css`. No hex / rgba outside
 * `scripts/audit-routes.shared.mjs ALLOWED_HEX` / `ALLOWED_RGBA`.
 */

export function Footer() {
  return (
    <div className="mx-auto w-full max-w-7xl border-t border-border-strong px-6 py-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-fg">
            For recruiters?
          </h2>
          <p className="mt-2 max-w-prose text-sm text-fg-2">
            Recruiter-ready forward flow: spine line + four proof numbers +
            status strip + role-fit cards. One canonical route, one
            canonical share form.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <a
            href="/recruiter"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-border-strong bg-glass px-4 text-sm text-fg hover:bg-glass-strong"
          >
            <span>For recruiters?</span>
            <span className="ml-1 text-fg-3" aria-hidden="true">
              →
            </span>
          </a>
          <a
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md px-4 text-sm text-fg-3 hover:text-fg"
          >
            <span aria-hidden="true">←</span>
            <span className="ml-1">Back to sanjit.dev</span>
          </a>
        </div>
      </div>
    </div>
  );
}
