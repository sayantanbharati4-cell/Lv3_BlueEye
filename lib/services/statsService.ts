import Artist from "@/lib/models/Artist";
import Event from "@/lib/models/Event";
import { connectToDatabase } from "@/lib/db/connect";
import { getDistinctCities, getDistinctCategories } from "@/lib/services/searchService";

export type SiteStats = {
  artists: number;
  events: number;
  cities: number;
  categories: number;
};

/**
 * Single source of truth for site-wide stats.
 * Used by the homepage, About page, and any stats display to keep numbers consistent.
 */
export async function getRealStats(): Promise<SiteStats> {
  await connectToDatabase();
  const [artists, events, cities, categories] = await Promise.all([
    Artist.countDocuments().catch(() => 0),
    Event.countDocuments().catch(() => 0),
    getDistinctCities().then((c) => c.length).catch(() => 0),
    getDistinctCategories().then((c) => c.length).catch(() => 0),
  ]);
  return { artists, events, cities, categories };
}

export function formatCount(n: number): string {
  if (n >= 10000) {
    const k = n / 1000;
    return `${Math.round(k)}k+`;
  }
  return `${n.toLocaleString("en-IN")}+`;
}