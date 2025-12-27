import { cloudinary } from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL required" },
        { status: 400 }
      );
    }

    const upload = await cloudinary.uploader.upload(imageUrl, {
      folder: "forms",
    });

    return NextResponse.json({ url: upload.secure_url });
  } catch (err) {
    console.error("Cloudinary error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

