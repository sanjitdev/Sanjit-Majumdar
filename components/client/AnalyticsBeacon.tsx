"use client";
import Script from 'next/script';

/**
 * <AnalyticsBeacon> — AD-13 closed-set client component (6 of 10).
 *
 * Renders `<Script src="https://plausible.io/js/script.js" data-domain="sanjit.dev" strategy="lazyOnload" />`
 * per AD-11 (analytics). Emits 4 typed event-name constants as TypeScript
 * `as const` exports.
 *
 * Event names match the contract in `ARCHITECTURE-SPINE.md` + epic-1-context
 * AD-13: `forward_button_click`, `recruiter_mode_toggle`,
 * `pattern_deep_link_visit`, `case_study_forward_open`.
 */

export const ANALYTICS_EVENTS = {
  FORWARD_BUTTON_CLICK: 'forward_button_click',
  RECRUITER_MODE_TOGGLE: 'recruiter_mode_toggle',
  PATTERN_DEEP_LINK_VISIT: 'pattern_deep_link_visit',
  CASE_STUDY_FORWARD_OPEN: 'case_study_forward_open',
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** Type-safe `plausible()` call wrapper for downstream consumers. */
export function track(event: AnalyticsEventName, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const w = window as unknown as {
    plausible?: (e: string, o?: { props: Record<string, unknown> }) => void;
  };
  if (typeof w.plausible !== 'function') return;
  // Omit the second arg entirely when no props — keeps Plausible's call
  // signature canonical (`plausible(event)` for prop-less events).
  if (!props || Object.keys(props).length === 0) {
    w.plausible(event);
  } else {
    w.plausible(event, { props });
  }
}

export function AnalyticsBeacon() {
  return (
    <Script
      src="https://plausible.io/js/script.js"
      data-domain="sanjit.dev"
      strategy="lazyOnload"
    />
  );
}
