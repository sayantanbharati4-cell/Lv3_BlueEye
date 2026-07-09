import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { success: false, error: "ImageKit private key not configured" },
        { status: 500 }
      );
    }

    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 1800;
    const signature = crypto
      .createHmac("sha1", privateKey)
      .update(token + expire)
      .digest("hex");

    return NextResponse.json({
      success: true,
      data: {
        token,
        expire,
        signature,
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
