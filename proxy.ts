import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { legacyRedirectPath } from "@/lib/seo/legacyRoutes";
import { isBlockedCrawler } from "@/lib/seo/botPolicy";
import { slugify } from "@/lib/utils/slugify";

/**
 * Normalizes non-canonical city/category slugs with a 301.
 * Scoped via `config.matcher` to those two trees so static pages and APIs do
 * not pay middleware cost on every request.
 */
export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Enforce the crawler allowlist on the paths this proxy already covers, so
  // blocked bots cost a redirect check instead of a page render. Only a few
  // hundred bytes are returned, and the 403 is never cacheable.
  // Broader coverage belongs at Cloudflare (see docs/CLOUDFLARE_TURNSTILE_SETUP.md)
  // because widening this matcher adds an edge invocation per request.
  if (isBlockedCrawler(request.headers.get("user-agent"))) {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "private, no-store, max-age=0",
        // next.config.ts advertises shared caching for these paths, and CDN
        // headers win over Cache-Control at Netlify/Cloudflare. Without these
        // two lines a bot's 403 could be cached and served to real visitors.
        "Netlify-CDN-Cache-Control": "no-store",
        "CDN-Cache-Control": "no-store",
        Vary: "User-Agent",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  const legacyPath = legacyRedirectPath(pathname, request.nextUrl.searchParams);
  if (legacyPath) {
    return NextResponse.redirect(new URL(legacyPath, request.url), 301);
  }

  const categoryMatch = pathname.match(/^\/category\/([^/]+)(\/page\/\d+)?$/);
  if (categoryMatch) {
    const [, raw, suffix = ""] = categoryMatch;
    const normalized = slugify(decodeURIComponent(raw));
    if (raw !== normalized) {
      return NextResponse.redirect(
        new URL(`/category/${normalized}${suffix}${search}`, request.url),
        301
      );
    }
  }

  const cityMatch = pathname.match(/^\/city\/([^/]+)(\/page\/\d+)?$/);
  if (cityMatch) {
    const [, raw, suffix = ""] = cityMatch;
    const normalized = slugify(decodeURIComponent(raw));
    if (raw !== normalized) {
      return NextResponse.redirect(
        new URL(`/city/${normalized}${suffix}${search}`, request.url),
        301
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/city/:path*",
    "/category/:path*",
    { source: "/artists", has: [{ type: "query", key: "page" }] },
    { source: "/artists", has: [{ type: "query", key: "category" }] },
    { source: "/artists", has: [{ type: "query", key: "city" }] },
    { source: "/blog", has: [{ type: "query", key: "page" }] },
    { source: "/events", has: [{ type: "query", key: "status" }] },
  ],
};
