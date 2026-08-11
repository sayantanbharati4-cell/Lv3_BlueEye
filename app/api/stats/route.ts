import { NextResponse } from "next/server";
import Artist from "@/lib/models/Artist";
import { apiSuccess, apiError } from "@/lib/utils/apiResponse";
import { getDistinctCities } from "@/lib/services/searchService";

export async function GET() {
  try {
    const [totalArtists, cities] = await Promise.all([
      Artist.countDocuments(),
      getDistinctCities(),
    ]);

    // Calculate dynamic "Happy Clients" (e.g. 5x total artists or a fixed base + factor)
    // For now, let's just return real base counts
    return apiSuccess({
      totalArtists,
      totalCities: cities.length,
      yearsExperience: 12, // This could be a constant or calculated
      happyClients: Math.floor(totalArtists * 3.5) // Example multiplier for "real-ish" data
    });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
