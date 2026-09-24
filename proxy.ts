import { NextResponse, type NextRequest } from 'next/server';

// Next 16 proxy (formerly `middleware`): canonical-share-form enforcement.
// Stale bookmarks `/?for=recruiter*` are 308'd to `/recruiter*` so the
// canonical share form (AD-8, amended AD-12) survives forever.
// CSP lives in `next.config.mjs`; this proxy touches no headers.
export default async function proxy(request: NextRequest): Promise<NextResponse> {
  const { nextUrl } = request;

  if (nextUrl.pathname !== '/' || nextUrl.searchParams.get('for') !== 'recruiter') {
    return NextResponse.next();
  }

  const target = new URL('/recruiter', request.url);

  // Rebuild searchParams preserving insertion order and multi-value keys;
  // drop only `for` since it has been consumed by the matcher.
  const remaining = new URLSearchParams(nextUrl.searchParams);
  remaining.delete('for');
  const qs = remaining.toString();
  target.search = qs;

  return NextResponse.redirect(target, { status: 308 });
}

// Narrow matcher: only the homepage path is in scope for the canonical-share
// redirect; matcher is the exact form `/` (NOT `/:path*`) so asset, API,
// and static-file requests stay outside the edge runtime's intercept.
export const config = {
  matcher: ['/'],
};
