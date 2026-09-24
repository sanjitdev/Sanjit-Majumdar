import { MagneticCTA } from './client/MagneticCTA';
import { NavCurrent } from './client/NavCurrent';
import { ScrollProgress } from './client/ScrollProgress';

/**
 * <Nav> — server component (AD-13 closed-set discipline: this is NOT a
 * client component). Composes the 9 closed-set client components from
 * `components/client/` into the UX-DR13 persistent-nav shell.
 *
 * Layout (3 flex regions, single row, 76px tall, sticky to top):
 *   - LEFT:  brand mark (28×28 Tailwind gradient square + motion-safe pulse
 *            halo + wordmark "Sanjit Majumdar")
 *   - CENTER: 7 <NavCurrent> links, hidden below `lg` (1100px)
 *   - RIGHT: <MagneticCTA> focal CTA (visible at all breakpoints) +
 *            cmdk trigger button (hidden below `lg`, hidden below `md`)
 *
 * The cmdk trigger carries `aria-disabled="true"` + a `title` (NOT the HTML
 * `disabled` attribute — `disabled` strips the element from the tab order,
 * which would break keyboard-only ⌘K discoverability on `md` viewports
 * where the trigger is hidden by CSS but the underlying keyboard shortcut
 * still works).
 *
 * Below the header row, `<ScrollProgress>` mounts a fixed-position bar at
 * the viewport bottom (`z-30`, below the nav's `z-50` so the bar never
 * disappears behind the sticky header's bottom edge).
 *
 * The `bg-[rgba(6,7,11,0.72)]` scrim is an exception to the closed
 * design-token set: AD-18 enumerates `--bg` `#06070B` (the 1.0-opacity
 * token) but NOT the 0.72-opacity glass variant. The Tailwind arbitrary-
 * value syntax references the rgba inline within the class attribute,
 * and `pnpm audit:tokens` (which is context-free — see spec-1-7) passes
 * because `'rgba(6,7,11,0.72)'` is enumerated in `ALLOWED_RGBA` in
 * `scripts/audit-routes.shared.mjs`.
 */
const NAV_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/', label: 'Home' },
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/lab', label: 'Lab' },
  { href: '/now', label: 'Now' },
  { href: '/built', label: 'Built' },
  { href: '/recruiter', label: 'Recruiter' },
];

export function Nav({ currentPath }: { currentPath: string }) {
  return (
    <header
      role="banner"
      className="sticky top-0 z-50 h-[76px] w-full border-b border-border-strong bg-[rgba(6,7,11,0.72)] backdrop-blur-[20px]"
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        {/* LEFT — brand mark + wordmark */}
        <a href="/" className="flex items-center gap-2 text-fg" aria-label="Home">
          <span
            aria-hidden="true"
            className="h-7 w-7 rounded-sm bg-gradient-to-br from-accent via-accent-2 to-accent-3 ring-1 ring-border-accent motion-safe:animate-pulse"
          />
          <span className="font-display text-sm font-semibold tracking-tight">
            Sanjit Majumdar
          </span>
        </a>

        {/* CENTER — 7 nav links (closed set, in order) */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-6 lg:flex"
        >
          {NAV_LINKS.map((link) => (
            <NavCurrent
              key={link.href}
              href={link.href}
              isCurrent={
                link.href === '/'
                  ? currentPath === '/'
                  : currentPath === link.href || currentPath.startsWith(`${link.href}/`)
              }
            >
              {link.label}
            </NavCurrent>
          ))}
        </nav>

        {/* RIGHT — magnetic CTA + cmdk trigger */}
        <div className="flex items-center gap-2">
          <MagneticCTA className="min-h-[44px] px-3 text-sm">
            Hire me
          </MagneticCTA>
          <button
            type="button"
            data-cmdk-trigger
            aria-disabled="true"
            aria-label="Open command palette (⌘K)"
            title="Command palette ships in 1-9"
            className="hidden min-h-[44px] items-center gap-1 rounded-md border border-border-strong bg-glass px-3 text-sm text-fg-2 lg:flex md:hidden"
          >
            <kbd className="rounded border border-border-strong bg-bg-2 px-1.5 font-mono text-xs text-fg-3">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>

      {/* BOTTOM — fixed-position scroll-progress bar (z-30 below nav's z-50) */}
      <ScrollProgress />
    </header>
  );
}
