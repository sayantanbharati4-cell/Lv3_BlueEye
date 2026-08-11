import Artist from "@/lib/models/Artist";
import { connectToDatabase } from "@/lib/db/connect";

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  name_asc: { name: 1 },
  name_desc: { name: -1 },
  updated_desc: { updatedAt: -1 },
  updated_asc: { updatedAt: 1 },
  created_desc: { createdAt: -1 },
  created_asc: { createdAt: 1 },
};

export async function searchArtists(
  q: string,
  filters?: { category?: string; city?: string },
  pagination?: { page?: number; limit?: number; sort?: string }
) {
  await connectToDatabase();
  const query: any = { $text: { $search: q } };
  if (filters?.category) query["search.category_lower"] = filters.category.toLowerCase();
  if (filters?.city) query["search.city_lower"] = { $in: getCityVariants(filters.city) };
  
  const page = Math.max(1, pagination?.page || 1);
  const limit = Math.max(1, Math.min(100, pagination?.limit || 12));
  const skip = (page - 1) * limit;
  const sort = SORT_MAP[pagination?.sort || ""] || { score: { $meta: "textScore" } };

  const [artists, total] = await Promise.all([
    Artist.find(query, { score: { $meta: "textScore" } })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Artist.countDocuments(query)
  ]);

  return {
    artists: JSON.parse(JSON.stringify(artists)),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export type ArtistSuggestion = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  location?: { city?: string; state?: string };
  media?: { images?: string[] };
};

/** Fast prefix/keyword matching for live search dropdowns */
export async function suggestArtists(
  q: string,
  filters?: { category?: string; city?: string },
  limit = 8
): Promise<ArtistSuggestion[]> {
  await connectToDatabase();
  const trimmed = q.trim();
  if (!trimmed) return [];

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");

  const conditions: Record<string, unknown>[] = [
    {
      $or: [
        { name: regex },
        { category: regex },
        { "location.city": regex },
        { "search.name_lower": regex },
        { "performance.genres": regex },
      ],
    },
  ];

  if (filters?.category) {
    conditions.push({
      $or: [
        { "search.category_lower": filters.category.toLowerCase() },
        { category: { $regex: new RegExp(`^${filters.category}$`, "i") } },
      ],
    });
  }

  if (filters?.city) {
    conditions.push({
      $or: [
        { "search.city_lower": { $in: getCityVariants(filters.city) } },
        { "location.city": { $in: getCityVariants(filters.city).map((v) => new RegExp(`^${v}$`, "i")) } },
      ],
    });
  }

  const artists = await Artist.find({ $and: conditions })
    .select("name slug category location media.images")
    .sort({ featured: -1, name: 1 })
    .limit(Math.min(12, Math.max(1, limit)))
    .lean();

  return JSON.parse(JSON.stringify(artists)) as ArtistSuggestion[];
}

export async function getDistinctCategories() {
  await connectToDatabase();
  return Artist.distinct("category");
}

const CITY_ALIASES: Record<string, string> = {
  // Delhi cluster
  "new delhi": "Delhi",
  "new delhi ncr": "Delhi",
  "delhi ncr": "Delhi",
  "delhi": "Delhi",
  "newdelhi": "Delhi",
  "central delhi": "Delhi",
  "east delhi": "Delhi",
  "north delhi": "Delhi",
  "south delhi": "Delhi",
  "west delhi": "Delhi",
  "north east delhi": "Delhi",
  "north west delhi": "Delhi",
  "south west delhi": "Delhi",
  "connaught place": "Delhi",
  "saket": "Delhi",
  // Mumbai cluster
  "mumbai": "Mumbai",
  "mumbai, maharashtra": "Mumbai",
  "mumbai, maharshtra": "Mumbai",
  "mumbai, maharastra": "Mumbai",
  "bombay": "Mumbai",
  "r/n ward": "Mumbai",
  "navi mumbai panvel raigad": "Navi Mumbai",
  // Bangalore cluster
  "bangalore": "Bangalore",
  "bangalore hq": "Bangalore",
  "bengaluru": "Bangalore",
  "bengaluru, karnataka": "Bangalore",
  "mysore": "Mysore",
  "mysuru": "Mysore",
  // Kolkata cluster
  "kolkata": "Kolkata",
  "kolkata, west bengal": "Kolkata",
  "calcutta": "Kolkata",
  "south 24 parganas": "Kolkata",
  // Chennai cluster
  "chennai": "Chennai",
  "chennai, tamil nadu": "Chennai",
  // Hyderabad cluster
  "hyderabad": "Hyderabad",
  "hyderabad, telangana": "Hyderabad",
  "k.v.rangareddy": "Hyderabad",
  // Pune cluster
  "pune": "Pune",
  "pune ": "Pune",
  "pune, maharashtra": "Pune",
  // Ahmedabad cluster
  "ahmedabad": "Ahmedabad",
  "ahmadabad": "Ahmedabad",
  "ahmedabad hq": "Ahmedabad",
  "ahmedabad, gujarat": "Ahmedabad",
  "gandhi nagar": "Gandhinagar",
  // Jaipur cluster
  "jaipur": "Jaipur",
  "jaipur hq": "Jaipur",
  // Lucknow cluster
  "lucknow": "Lucknow",
  "lucknow hq": "Lucknow",
  "lucknow, uttar pradesh": "Lucknow",
  // Bhopal cluster
  "bhopal": "Bhopal",
  "bhopal hq": "Bhopal",
  "bhopal, madhya pradesh": "Bhopal",
  // Chandigarh cluster
  "chandigarh": "Chandigarh",
  "chandigarh hq": "Chandigarh",
  "chandigarh region": "Chandigarh",
  // Guwahati cluster
  "guwahati": "Guwahati",
  "guwahati hq": "Guwahati",
  "guwahati, assam": "Guwahati",
  "kamrup": "Guwahati",
  // Other known merges
  "shimla": "Shimla",
  "shimla hq": "Shimla",
  "srinagar": "Srinagar",
  "srinagar hq": "Srinagar",
  "patna": "Patna",
  "patna hq": "Patna",
  "ludhiana": "Ludhiana",
  "ludhiana, punjab": "Ludhiana",
  "jalandhar": "Jalandhar",
  "jalandhar, punjab": "Jalandhar",
  "mohali": "Mohali",
  "mohali, punjab": "Mohali",
  "hisar": "Hisar",
  "hisar, haryana": "Hisar",
  "kanpur": "Kanpur",
  "kanpur nagar": "Kanpur",
  "allahabad": "Prayagraj",
  "allahabad (prayagraj)": "Prayagraj",
  "vizag": "Visakhapatnam",
  "goa-panaji": "Panaji",
  "north goa": "Panaji",
  "gautam buddha nagar": "Noida",
  "ambala": "Ambala",
  "ambala  hq": "Ambala",
  "bilaspur(chhattisgarh)": "Bilaspur",
  "bilaspur(himachal)": "Bilaspur",
  "udhagamandalam": "Ooty",
};

const CITY_BLOCKLIST = new Set([
  // Pakistan
  "lahore", "karachi", "islamabad", "rawalpindi", "faisalabad",
  "abbotabad, khyber pakhtunkhwa", "lyari, karachi", "karachi, sindh", "gilgit",
  // Bangladesh
  "dhaka",
  // USA
  "orlando", "los angeles", "massachusetts", "minneapolis", "united states",
  "north miami beach", "dallas, texas",
  // UK
  "london", "london borough of islington", "essex, england",
  // Canada
  "toronto", "winnipeg, manitoba",
  // Australia
  "perth", "western australia",
  // France
  "paris",
  // Afghanistan
  "kabul",
  // Congo
  "bukavu, belgian congo",
  // UAE
  "dubai",
  // Garbage / non-city values
  "not known", "not known (lives in new delhi)", "",
  "india", "punjab", "telangana", "odisha", "bihar",
  "vemulawada mandal", "kalenahalli arsikere, hassan district",
  "siddartha nagar", "matigara block", "haveli subdistrict",
  "whitestone, devon", "moodbidri, mangalore",
]);

const CITY_ALIAS_REVERSE: Map<string, string[]> = (() => {
  const map = new Map<string, string[]>();
  for (const [raw, canonical] of Object.entries(CITY_ALIASES)) {
    const key = canonical.toLowerCase();
    const list = map.get(key) || [];
    if (!list.includes(raw)) list.push(raw);
    map.set(key, list);
  }
  return map;
})();

/** Returns every raw city value that should match a given canonical city (case-insensitive). */
export function getCityVariants(city: string): string[] {
  const lower = city.trim().toLowerCase();
  const raw = CITY_ALIASES[lower];
  const canonical = raw || titleCase(city.trim());
  const variants = CITY_ALIAS_REVERSE.get(canonical.toLowerCase()) || [];
  const set = new Set(variants.map((v) => v.trim().toLowerCase()));
  set.add(lower);
  set.add(canonical.toLowerCase());
  set.delete("");
  return Array.from(set);
}

function titleCase(s: string): string {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function normalizeCity(city: string): string {
  const trimmed = city.trim();
  const lower = trimmed.toLowerCase();
  if (CITY_BLOCKLIST.has(lower)) return "";
  const aliased = CITY_ALIASES[lower];
  if (aliased) return aliased;
  return titleCase(trimmed);
}

export async function getDistinctCities() {
  await connectToDatabase();
  const cities = await Artist.distinct("location.city", {
    $or: [
      { "location.country": "India" },
      { "location.country": { $exists: false } },
    ],
  });
  const normalized = [...new Set(cities.filter(Boolean).map(normalizeCity).filter(Boolean))];
  return normalized.sort();
}

export async function getCategoryCounts() {
  await connectToDatabase();
  const counts = await Artist.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);
  return counts.reduce((acc: any, cur) => {
    acc[cur._id] = cur.count;
    return acc;
  }, {});
}

export async function getLatestCategoryUpdates() {
  await connectToDatabase();
  const result = await Artist.aggregate([
    { $match: { category: { $exists: true, $ne: "" } } },
    { $sort: { updatedAt: -1 } },
    { $group: { _id: "$category", updatedAt: { $first: "$updatedAt" } } },
    { $project: { _id: 0, category: "$_id", updatedAt: 1 } },
  ]);
  return result as { category: string; updatedAt: Date }[];
}

export async function getLatestCityUpdates() {
  await connectToDatabase();
  const result = await Artist.aggregate([
    {
      $match: {
        "location.city": { $exists: true, $ne: "" },
        $or: [
          { "location.country": "India" },
          { "location.country": { $exists: false } },
        ],
      },
    },
    { $sort: { updatedAt: -1 } },
    { $group: { _id: "$location.city", updatedAt: { $first: "$updatedAt" } } },
    { $project: { _id: 0, city: "$_id", updatedAt: 1 } },
  ]);
  const normalized = new Map<string, Date>();
  for (const item of result as { city: string; updatedAt: Date }[]) {
    const canonical = normalizeCity(item.city);
    if (!canonical) continue;
    const existing = normalized.get(canonical);
    if (!existing || item.updatedAt > existing) {
      normalized.set(canonical, item.updatedAt);
    }
  }
  return Array.from(normalized.entries()).map(([city, updatedAt]) => ({ city, updatedAt }));
}
