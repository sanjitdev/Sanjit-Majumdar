import { NextResponse, type NextRequest } from 'next/server';

// Next 16 proxy (formerly `middleware`):
//   1. Injects `x-pathname: <nextUrl.pathname>` as a request header on every
//      intercepted request so the server-component root layout
//      (`app/layout.tsx`, spec-1-9) can read it via `next/headers` and derive
//      `currentPath` for `<Nav aria-current>` derivation. The request header
//      is forwarded to the layout via `NextResponse.next({ request: ... })`.
//   2. Canonical-share-form enforcement: stale bookmarks `/?for=recruiter*`
//      are 308'd to `/recruiter*` so the canonical share form
//      (AD-8, amended AD-12) survives forever. The 308 redirect response
//      does NOT carry the `x-pathname` header (response headers ≠ request
//      headers; the destination layout reads a fresh `x-pathname` set by
//      the proxy's pass-through branch on the redirected request).
// CSP lives in `next.config.mjs`; this proxy touches no other headers.
export default async function proxy(request: NextRequest): Promise<NextResponse> {
  const { nextUrl } = request;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', nextUrl.pathname);

  if (nextUrl.pathname !== '/' || nextUrl.searchParams.get('for') !== 'recruiter') {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const target = new URL('/recruiter', request.url);

  // Rebuild searchParams preserving insertion order and multi-value keys;
  // drop only `for` since it has been consumed by the matcher.
  const remaining = new URLSearchParams(nextUrl.searchParams);
  remaining.delete('for');
  const qs = remaining.toString();
  target.search = qs;

  // NOTE: do NOT attach `headers: requestHeaders` here — the second-arg
  // `headers` on `NextResponse.redirect` are RESPONSE headers, which would
  // leak the internal `x-pathname` to the browser. The destination layout
  // will read a fresh `x-pathname` set by the proxy's pass-through branch
  // on the redirected request to `/recruiter`.
  return NextResponse.redirect(target, { status: 308 });
}

// Matcher covers every public route so the `x-pathname` header reaches the
// layout on every navigation (required for `<Nav aria-current>` derivation).
// The 308 redirect logic above still only fires on `/?for=recruiter*` — the
// matcher is broader than the redirect trigger, not the other way around.
export const config = {
  matcher: ['/:path*'],
};

