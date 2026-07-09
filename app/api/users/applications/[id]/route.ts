import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { connectToDatabase } from "@/lib/db/connect";
import ArtistApplicant from "@/lib/models/ArtistApplicant";
import { artistApplicantSchemaValidation } from "@/lib/utils/validators";
import { apiSuccess, apiError } from "@/lib/utils/apiResponse";

async function verifyOwnership(id: string, userId: string, userEmail: string) {
  await connectToDatabase();
  const doc = await ArtistApplicant.findById(id);
  if (!doc) return { doc: null, error: apiError("Application not found", 404) };
  const owns =
    (doc.userId && doc.userId.toString() === userId) ||
    doc.applicantEmail?.toLowerCase() === userEmail?.toLowerCase();
  if (!owns) return { doc: null, error: apiError("Forbidden", 403) };
  return { doc, error: null };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) return apiError("Unauthorized", 401);

    const user = session.user as any;
    const { doc, error } = await verifyOwnership(id, user.id, user.email);
    if (error) return error;

    return apiSuccess(doc);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch application", 500);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) return apiError("Unauthorized", 401);

    const user = session.user as any;
    const { doc, error } = await verifyOwnership(id, user.id, user.email);
    if (error) return error;

    if (doc.status === "approved") {
      return apiError("Cannot edit an approved application. It has already been added to the artist database.", 400);
    }

    const body = await request.json();
    const result = artistApplicantSchemaValidation.safeParse(body);
    if (!result.success) {
      return apiError(result.error.issues[0].message, 400, result.error.issues);
    }

    const updateData: Record<string, unknown> = { ...result.data };
    if (doc.status === "rejected") {
      updateData.status = "pending";
      updateData.rejectedAt = undefined;
    }

    const updated = await ArtistApplicant.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    return apiSuccess(updated, "Application updated successfully");
  } catch (error: any) {
    return apiError(error.message || "Failed to update application", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) return apiError("Unauthorized", 401);

    const user = session.user as any;
    const { doc, error } = await verifyOwnership(id, user.id, user.email);
    if (error) return error;

    if (doc.status === "approved") {
      return apiError("Cannot delete an approved application. Contact admin for removal.", 400);
    }

    await ArtistApplicant.findByIdAndDelete(id);
    return apiSuccess(null, "Application deleted successfully");
  } catch (error: any) {
    return apiError(error.message || "Failed to delete application", 500);
  }
}
