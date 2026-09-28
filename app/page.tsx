import type { Metadata, Viewport } from 'next';

import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';

/**
 * Homepage (`/`) — server component (no `"use client"` at line 1; AD-13
 * closed-set discipline). Composes the 1-8 `<Hero>` (spine line +
 * `<MagneticCTA>` climax + `<ProofVectorCluster>` + `<SignatureCanvas
 * mode="dual-ring">` at `xl+`) and the 1-11 `<Footer>` (closed
 * `For recruiters?` link + return-path link + heading + supporting copy).
 *
 * The `<main id="main">` landmark is owned by `app/layout.tsx` (1-9); this
 * route renders only the route's own content. The `<footer>` landmark is
 * also owned by the layout — `<Footer>` populates its body content (see
 * `components/Footer.tsx` design notes for the rationale).
 *
 * Route-level `metadata` overrides the layout default so the rendered
 * `<title>` is the bare canonical-share string (no `'%s | Sanjit
 * Majumdar'` template suffix). Route-level `viewport` (Next.js 16) emits
 * the viewport meta + theme-color: `#06070B` (the closed `--bg` token,
 * matches `scripts/audit-routes.shared.mjs:39` `ALLOWED_HEX[0]`).
 *
 * AD-20 + amended AD-12 satisfied at first paint:
 *   - spine-line verbatim (from `<Hero>`): "This person builds serious
 *     software — and this website is proof." (U+2014 em-dash)
 *   - four closed proof-number tokens (from `<ProofVectorCluster>`):
 *     `1.2M`, `−68%`, `22h`, `7-person`
 *   - return-path `href="/"` (from `<Nav>` brand-mark AND from
 *     `<Footer>` return-path link — defense-in-depth)
 *   - `href="/recruiter"` (from `<Footer>` `For recruiters?` link)
 */
export const metadata: Metadata = {
  title: 'Sanjit Majumdar — Senior Software Engineer',
  description: 'Senior software engineer. I build, ship, and run the gap.',
  openGraph: {
    title: 'Sanjit Majumdar — Senior Software Engineer',
    description: 'Senior software engineer. I build, ship, and run the gap.',
    url: 'https://sanjit.dev',
    siteName: 'Sanjit Majumdar',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#06070B',
  width: 'device-width',
  initialScale: 1,
};

export default function Home() {
  return (
    <>
      <Hero />
      <Footer />
    </>
  );
}
