export const PRIVATE_PATHS = [
  "/admin/",
  "/api/",
  "/login",
  "/register",
  "/profile",
  "/reset-password",
  "/switch-account",
  "/my-ticket/",
  "/search",
] as const;

/**
 * Tracking parameters create endlessly duplicated crawl URLs. They never deserve
 * an index entry, so crawlers are told not to spend budget on them.
 */
export const DISALLOWED_QUERY_PATTERNS = [
  "/*?utm_",
  "/*?fbclid=",
  "/*?gclid=",
  "/*?gbraid=",
  "/*?wbraid=",
  "/*?msclkid=",
  "/*?ref=",
] as const;

/**
 * Search engines and link-preview fetchers remain implicitly allowed through
 * the wildcard group. They are listed here so tests can guard against a future
 * change that accidentally blocks them.
 */
export const ALLOWED_BOTS = [
  "Googlebot",
  "Googlebot-Image",
  "Google-InspectionTool",
  "Storebot-Google",
  "AdsBot-Google",
  "bingbot",
  "BingPreview",
  "adidxbot",
  "Applebot",
  "DuckDuckBot",
  "facebookexternalhit",
  "Twitterbot",
  "LinkedInBot",
  "WhatsApp",
  "Slackbot",
  "Discordbot",
  "TelegramBot",
  "Pinterestbot",
  "redditbot",
  // ChatGPT fetchers that bring citations/referrals. GPTBot (training) stays
  // blocked below, so the site is not used as AI training data.
  "OAI-SearchBot",
  "ChatGPT-User",
] as const;

/**
 * AI training crawlers, AI agents, and high-volume SEO/data scrapers.
 * robots.txt is policy only; Cloudflare must enforce it for non-compliant bots.
 */
export const BLOCKED_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Claude-Web",
  "anthropic-ai",
  "Google-Extended",
  "GoogleOther",
  "Google-CloudVertexBot",
  "Google-GeminiNotebook",
  "Google-NotebookLM",
  "Google-Agent",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "Amzn-SearchBot",
  "meta-externalagent",
  "meta-externalfetcher",
  "PerplexityBot",
  "Perplexity-User",
  "Applebot-Extended",
  "PetalBot",
  "Diffbot",
  "omgili",
  "cohere-ai",
  "MistralAI-Training",
  "MistralAI-User",
  "KimiBot",
  "Kimi-User",
  "Firecrawl",
  "FirecrawlAgent",
  "DotBot",
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DataForSeoBot",
  "BLEXBot",
  "Barkrowler",
  "SerpstatBot",
  "MegaIndex",
  "SeznamBot",
  "AwarioSmartBot",
  "AwarioRssBot",
  "QualifiedBot",
  "Cotoyogi",
  "ICC-Crawler",
  "atlassian-bot",
  "FishBot",
  "BorderxBot",
  "NavuBot",
  "WARDBot",
  "magpie-crawler",
  "CitibotSiteCrawler",
  "ChathiveCrawler",
  "Retool",
  "Instapaper",
  "AI2Bot",
  "Ai2Bot-Dolma",
  "ImagesiftBot",
  "img2dataset",
  "FriendlyCrawler",
  "PanguBot",
  "Timpibot",
  "VelenPublicWebCrawler",
  "Webzio-Extended",
  "YouBot",
  "iaskspider",
  "cohere-training-data-crawler",
  "Screaming Frog SEO Spider",
  "SeekportBot",
  "linkfluence",
  "netEstate NE Crawler",
  "SiteAuditBot",
  "Xenu Link Sleuth",
] as const;

export type RobotsRule = {
  userAgent: string;
  allow?: string;
  disallow?: string | string[];
};

export function buildRobotsRules(): RobotsRule[] {
  return [
    {
      userAgent: "*",
      allow: "/",
      disallow: [...PRIVATE_PATHS, ...DISALLOWED_QUERY_PATTERNS],
    },
    ...BLOCKED_BOTS.map((userAgent) => ({
      userAgent,
      disallow: "/",
    })),
  ];
}
