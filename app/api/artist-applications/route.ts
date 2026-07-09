import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { connectToDatabase } from "@/lib/db/connect";
import ArtistApplicant from "@/lib/models/ArtistApplicant";
import { artistApplicantSchemaValidation } from "@/lib/utils/validators";
import { apiSuccess, apiError } from "@/lib/utils/apiResponse";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const body = await request.json();

    const result = artistApplicantSchemaValidation.safeParse(body);
    if (!result.success) {
      return apiError(result.error.issues[0].message, 400, result.error.issues);
    }

    await connectToDatabase();

    const applicantData: Record<string, unknown> = { ...result.data };
    if (userId) {
      applicantData.userId = userId;
    }

    const applicant = await ArtistApplicant.create(applicantData);

    return apiSuccess(
      { id: applicant._id },
      "Your application has been submitted successfully. We will review it and get back to you soon.",
      201
    );
  } catch (error: any) {
    if (error?.code === 11000) {
      return apiError("You already have a pending application. Please wait for our response.", 409);
    }
    return apiError(error.message || "Failed to submit application", 500);
  }
}
