import { getRandomArtists } from "@/lib/services/artistService";
import { getDistinctCategories, getCategoryCounts } from "@/lib/services/searchService";
import { getCache, setCache } from "@/lib/db/redis";
import { cacheConfig } from "@/lib/config/cache";

/** @deprecated Use cacheConfig.homeData.redisKey */
export const HOME_CACHE_KEY = cacheConfig.homeData.redisKey;

/**
 * Five artists drive every homepage image slot: the hero carousel card, the
 * bento grid (sliced to 6) and the mouse-trail pool. Fetching ten meant up to
 * ten extra image URLs for slots that were never rendered.
 */
export const HOME_ARTIST_COUNT = 5;

export type HomePageData = {
  randomArtists: Awaited<ReturnType<typeof getRandomArtists>>;
  categories: string[];
  counts: Record<string, number>;
};

export async function getHomePageData(): Promise<HomePageData> {
  // v3: homepage payload trimmed from 10 to 5 artists (hero card + bento grid
  // + mouse-trail pool). Bump again whenever this shape changes.
  const cacheKey = `${cacheConfig.homeData.redisKey}:v3`;
  const cached = await getCache<HomePageData>(cacheKey);
  if (cached) return cached;

  const [randomArtists, categories, counts] = await Promise.all([
    getRandomArtists(HOME_ARTIST_COUNT),
    getDistinctCategories(),
    getCategoryCounts(),
  ]);

  const freshData: HomePageData = { randomArtists, categories, counts };
  await setCache(cacheKey, freshData, cacheConfig.homeData.ttlSeconds);
  return freshData;
}
