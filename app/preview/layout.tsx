import { notFound } from 'next/navigation';

/**
 * Preview-route gate (1-12-foundation-closeout fix #7).
 *
 * The 5 routes under `app/preview/*` are CI harnesses for component-level
 * contracts (e.g., `<Hero>`, `<Nav>`, `<FilterChipGroup>`). They MUST NOT
 * be reachable from the public internet — preview surfaces are unfinished
 * internal pages, not user-facing product. B5's `robots: { index: false,
 * follow: false }` per-page metadata is the search-index gate; THIS gate
 * is the reachability gate. Without it, anyone who knew the URL could
 * visit `/preview/hero` on the deployed site and see an unfinished
 * internal page (and worse, the homepage preview duplicates the entire
 * `<Hero>` + `<Footer>` composition meant for `/`).
 *
 * Activation: set the `PREVIEW=1` env var in the process that runs
 * `next start` for the CI build (`pnpm audit:routes` invokes
 * `next start -p $PORT` after exporting `PREVIEW=1`). On Vercel
 * (production deploys), `PREVIEW` is NOT set, so any request to
 * `/preview/*` returns Next.js' standard 404 page — the routes are
 * simply absent.
 *
 * Defense-in-depth: this is `app/preview/layout.tsx`, which wraps every
 * `app/preview/*/page.tsx` automatically. We don't need to repeat the
 * check in each page file.
 */
export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  if (process.env.PREVIEW !== '1') {
    notFound();
  }
  return <>{children}</>;
}
