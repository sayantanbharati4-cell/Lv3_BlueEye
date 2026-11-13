import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { updateArtist, deleteArtist } from "@/lib/services/artistService";
import { artistSchemaValidation } from "@/lib/utils/validators";
import { apiSuccess, apiError } from "@/lib/utils/apiResponse";
import { revalidateArtist } from "@/lib/cache/revalidate";

export async function PUT(request: any, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
    const session = await getServerSession(authOptions);
    if (!session) return apiError("Unauthorized", 401);

    const body = await request.json();
    const result = artistSchemaValidation.safeParse(body);
    if (!result.success) {
      return apiError(result.error.issues[0].message, 400, result.error.issues);
    }
    
    const artist = await updateArtist(id, result.data);
    revalidateArtist(artist.slug);
    return apiSuccess(artist, "Artist updated successfully");
  } catch (error: any) {
    return apiError(error.message || "Failed to update artist", 500);
  }
}

export async function DELETE(request: any, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
    const session = await getServerSession(authOptions);
    if (!session) return apiError("Unauthorized", 401);

    const result = await deleteArtist(id);
    if (!result) return apiError("Artist not found", 404);

    revalidateArtist(result.slug);
    return apiSuccess(null, "Artist deleted successfully");
  } catch (error: any) {
    return apiError(error.message || "Failed to delete artist", 500);
  }
}
