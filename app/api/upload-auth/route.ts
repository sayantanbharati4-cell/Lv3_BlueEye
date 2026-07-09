import { NextResponse } from "next/server";
import ImageKit from "@imagekit/nodejs";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
});

export async function GET() {
  try {
    const authParams = imagekit.helper.getAuthenticationParameters();
    return NextResponse.json({
      success: true,
      data: {
        ...authParams,
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate upload auth" },
      { status: 500 }
    );
  }
}
