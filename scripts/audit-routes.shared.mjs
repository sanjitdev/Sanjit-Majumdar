// Single source of truth for the closed audit-route list (amended AD-12).
// Imported by scripts/audit-budget.mjs, scripts/audit-routes.mjs,
// and surfaced into .pa11yci.json at config-generation time.
// Adding a route is a one-line edit; do NOT duplicate this array elsewhere.
export const AUDIT_ROUTES = [
  '/',
  '/work',
  '/projects',
  '/lab',
  '/patterns',
  '/now',
  '/about',
  '/recruiter',
  '/built',
  '/404',
];
