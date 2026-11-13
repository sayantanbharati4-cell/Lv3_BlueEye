import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { createArtist } from "@/lib/services/artistService";
import { importArtistsFromJSON } from "@/lib/services/importService";
import { artistSchemaValidation } from "@/lib/utils/validators";
import { apiSuccess, apiError } from "@/lib/utils/apiResponse";
import { revalidateArtist } from "@/lib/cache/revalidate";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return apiError("Unauthorized", 401);

    const body = await request.json();

    // Check if bulk import (array)
    if (Array.isArray(body)) {
      const summary = await importArtistsFromJSON(body);
      revalidateArtist();
      return apiSuccess(summary, "Bulk import completed", 201);
    }

    // Single creation
    const result = artistSchemaValidation.safeParse(body);
    if (!result.success) {
      return apiError(result.error.issues[0].message, 400, result.error.issues);
    }
    
    const artist = await createArtist(result.data);
    revalidateArtist(artist.slug);
    return apiSuccess(artist, "Artist created successfully", 201);
  } catch (error: any) {
    return apiError(error.message || "Failed to create artist", 500);
  }
}
