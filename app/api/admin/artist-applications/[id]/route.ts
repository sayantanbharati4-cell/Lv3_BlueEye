import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { connectToDatabase } from "@/lib/db/connect";
import ArtistApplicant from "@/lib/models/ArtistApplicant";
import Artist from "@/lib/models/Artist";
import { createArtist } from "@/lib/services/artistService";
import { apiSuccess, apiError } from "@/lib/utils/apiResponse";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) return apiError("Unauthorized", 401);

    await connectToDatabase();
    const applicant = await ArtistApplicant.findById(id).lean();
    if (!applicant) return apiError("Applicant not found", 404);

    return apiSuccess(applicant);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch applicant", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) return apiError("Unauthorized", 401);

    await connectToDatabase();
    const { action } = await request.json();

    const applicant = await ArtistApplicant.findById(id);
    if (!applicant) return apiError("Applicant not found", 404);

    switch (action) {
      case "approve": {
        if (applicant.status === "approved") {
          return apiError("Applicant is already approved", 400);
        }
        if (applicant.status === "rejected") {
          return apiError("Cannot approve a rejected applicant. Use un-reject first.", 400);
        }

        const artistData: Record<string, unknown> = {
          name: applicant.name,
          category: applicant.category,
          category_tag: applicant.category_tag,
          location: applicant.location,
          performance: applicant.performance,
          booking_link: applicant.booking_link,
          about: applicant.about,
          faq: applicant.faq,
          media: applicant.media,
        };

        let slug = artistData.name
          ?.toString()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "artist";

        const existingSlug = await Artist.findOne({ slug });
        if (existingSlug) {
          const count = await Artist.countDocuments({ slug: new RegExp(`^${slug}-\\d+$`) });
          slug = `${slug}-${count + 1}`;
        }
        artistData.slug = slug;

        const newArtist = await createArtist(artistData);
        await ArtistApplicant.findByIdAndDelete(id);

        return apiSuccess(
          { artistId: newArtist._id, slug: newArtist.slug },
          "Applicant approved and moved to artist database",
          200
        );
      }

      case "reject": {
        if (applicant.status === "approved") {
          return apiError("Cannot reject an already approved applicant", 400);
        }
        if (applicant.status === "rejected") {
          return apiError("Applicant is already rejected", 400);
        }

        applicant.status = "rejected";
        applicant.rejectedAt = new Date();
        await applicant.save();

        return apiSuccess(null, "Applicant rejected. They will be auto-removed after 7 days.");
      }

      case "unreject": {
        if (applicant.status !== "rejected") {
          return apiError("Applicant is not in rejected status", 400);
        }

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (applicant.rejectedAt && applicant.rejectedAt < sevenDaysAgo) {
          return apiError("Cannot un-reject. The 7-day review period has expired.", 400);
        }

        applicant.status = "pending";
        applicant.rejectedAt = undefined;
        await applicant.save();

        return apiSuccess(null, "Applicant has been returned to pending status. You can now approve them.");
      }

      default:
        return apiError("Invalid action. Use 'approve', 'reject', or 'unreject'.", 400);
    }
  } catch (error: any) {
    return apiError(error.message || "Failed to process applicant", 500);
  }
}
