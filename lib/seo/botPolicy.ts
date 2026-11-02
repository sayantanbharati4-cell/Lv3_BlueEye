import { ALLOWED_BOTS, BLOCKED_BOTS } from "./robotsPolicy.ts";

/**
 * Traffic that must never be rejected. Uptime monitors use crawler-shaped
 * product tokens (`UptimeRobot/2.0`), and a false 403 here pages someone at 3am.
 */
export const ALLOWED_SERVICE_AGENTS = [
  "UptimeRobot",
  "Pingdom",
  "StatusCake",
  "BetterUptime",
  "Uptime-Kuma",
  "Freshping",
  "Datadog",
  "check_http",
] as const;

/**
 * A crawler-shaped product token: `SomethingBot/1.0`, `some-crawler/2.1`,
 * `PageSpider/3`. Requiring the trailing version slash keeps phone models
 * (`CUBOT X19`) and browser engines (`AppleWebKit/537.36`) out of the match.
 *
 * This is the part that keeps working when a new bot nobody has listed yet
 * arrives: it blocks any client that declares itself a crawler.
 */
const CRAWLER_PRODUCT_TOKEN =
  /(?:^|[\s;(])(?:[a-z0-9_-]*bot|[a-z0-9_-]*crawler|[a-z0-9_-]*spider)\//i;

const DENIED_TOKENS = BLOCKED_BOTS.map((bot) => bot.toLowerCase());
const ALLOWED_TOKENS = [...ALLOWED_BOTS, ...ALLOWED_SERVICE_AGENTS].map((bot) =>
  bot.toLowerCase()
);

/**
 * Robots.txt cannot express "allow only these crawlers", so this is the
 * enforcing half of the policy: it is meant to run before page rendering.
 *
 * Order matters — explicit denials win over the allowlist (so a UA claiming
 * both `Googlebot` and a blocked crawler is rejected), and the crawler-shaped
 * fallback catches bots that do not exist in any list yet.
 *
 * A UA allowlist is spoofable by design; it stops honest-but-uninvited crawlers,
 * not attackers. Use Cloudflare Bot Fight Mode / rate limiting for those.
 */
export function isBlockedCrawler(userAgent: string | null | undefined): boolean {
  const ua = (userAgent || "").toLowerCase();
  if (!ua) return false;
  if (DENIED_TOKENS.some((token) => ua.includes(token))) return true;
  if (ALLOWED_TOKENS.some((token) => ua.includes(token))) return false;
  return CRAWLER_PRODUCT_TOKEN.test(ua);
}
