"use client";
import Script from 'next/script';

/**
 * <ErrorBeacon> — AD-13 closed-set client component (7 of 10).
 *
 * Renders a `<Script strategy="lazyOnload">` placeholder for Sentry.
 * No-op Sentry init stub for 1-6 — real Sentry wiring is owned by a later
 * story. The `<Script>` with `strategy="lazyOnload"` is the contract;
 * mounting it on a route establishes the deferred-loading pattern.
 */
export function ErrorBeacon() {
  return (
    <Script
      id="sentry-stub"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{ __html: '/* Sentry.init deferred — real wiring lives in a later story. */' }}
    />
  );
}
