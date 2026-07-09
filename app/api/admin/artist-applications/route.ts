import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { connectToDatabase } from "@/lib/db/connect";
import ArtistApplicant from "@/lib/models/ArtistApplicant";
import { apiSuccess, apiError } from "@/lib/utils/apiResponse";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return apiError("Unauthorized", 401);

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    if (status === "rejected") {
      filter.status = "rejected";
      filter.rejectedAt = { $gte: sevenDaysAgo };
    } else if (status === "pending" || status === "approved") {
      filter.status = status;
    } else {
      filter.$or = [
        { status: { $ne: "rejected" } },
        { rejectedAt: { $gte: sevenDaysAgo } },
      ];
    }

    const [applicants, total] = await Promise.all([
      ArtistApplicant.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ArtistApplicant.countDocuments(filter),
    ]);

    return apiSuccess({
      applicants,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch applicants", 500);
  }
}
