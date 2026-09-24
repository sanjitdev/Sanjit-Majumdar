import { MagneticCTA } from './client/MagneticCTA';
import { SignatureCanvas } from './client/SignatureCanvas';
import { ProofVectorCluster } from './ProofVectorCluster';

/**
 * <Hero> — AD-13 closed-set discipline: server component (no `"use client"`).
 * Composes three closed-set client islands:
 *   - `<MagneticCTA>` (AD-13 client component 3 of 9; pointermove gate)
 *   - `<SignatureCanvas mode="dual-ring">` (AD-13 client component 1 of 9;
 *     SMIL `sigFlow` gate)
 *   - `<ProofVectorCluster>` (server; gradient-text climax)
 *
 * Layout (2 columns at `xl+`, single-column below):
 *   - LEFT  — `<h1>` spine line (verbatim, U+2014 em-dash), positioning line,
 *             `<MagneticCTA>` climax, `<ProofVectorCluster />`
 *   - RIGHT — `<SignatureCanvas mode="dual-ring" />` mounted at `xl+` only
 *
 * The `canvasMounted?: boolean` prop (default `true`) is an explicit forward-
 * compat gate for 1-9's layout (which may want to disable the canvas on the
 * 404 page or specific routes — out of scope for 1-8 to decide).
 */
export function Hero({ canvasMounted = true }: { canvasMounted?: boolean }) {
  return (
    <section aria-label="Hero" className="relative isolate mx-auto w-full max-w-7xl px-6 py-24 md:py-32">
      <div className="grid grid-cols-1 items-start gap-16 xl:grid-cols-[1fr_auto]">
        <div>
          <h1 className="font-display [font-size:var(--text-display)] leading-[1.05] tracking-tight text-fg">
            <span className="block">This person builds serious software</span>{' '}
            <span className="bg-gradient-text bg-clip-text text-transparent">
              — and this website is proof.
            </span>
          </h1>
          <p className="mt-8 [font-size:var(--text-hero-spine)] font-medium text-fg-2">
            Senior software engineer. I build, ship, and run the gap.
          </p>
          <div className="mt-12">
            <MagneticCTA className="min-h-[44px] px-6 text-base">
              Read the case studies
            </MagneticCTA>
          </div>
          <div className="mt-16">
            <ProofVectorCluster />
          </div>
        </div>
        {canvasMounted ? (
          <div className="hidden xl:block">
            <SignatureCanvas mode="dual-ring" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
