import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

// Configure Cloudinary from server-side environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "Unknown error";
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Authentication using Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse form data file buffer
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read the file as a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Upload to Cloudinary under UPLOAD_FOLDER without writing to the deployment filesystem
    const uploadFolder = process.env.UPLOAD_FOLDER || "flipbook";

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: uploadFolder,
          resource_type: "image",
        },
        (error, uploadResult) => {
          if (error) {
            reject(error);
          } else if (!uploadResult) {
            reject(new Error("Cloudinary upload completed without a result."));
          } else {
            resolve(uploadResult);
          }
        }
      );

      uploadStream.on("error", reject);
      uploadStream.end(buffer);
    });

    console.log("Cloudinary upload result:", result);

    // 4. Return the secure URL
    return NextResponse.json({ url: result.secure_url });
  } catch (error: unknown) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: "Upload failed: " + getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// Extract public_id from Cloudinary URL
function getPublicIdFromUrl(url: string): string | null {
  if (!url || !url.startsWith("https://res.cloudinary.com/")) return null;
  
  const parts = url.split("/image/upload/");
  if (parts.length < 2) return null;
  
  const subParts = parts[1].split("/");
  
  // Skip version string (e.g. v1720822618)
  if (subParts[0].match(/^v\d+$/)) {
    subParts.shift();
  }
  
  const remaining = subParts.join("/");
  
  const lastDotIdx = remaining.lastIndexOf(".");
  if (lastDotIdx !== -1) {
    return remaining.substring(0, lastDotIdx);
  }
  
  return remaining;
}

// DELETE asset from Cloudinary
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
    }

    const publicId = getPublicIdFromUrl(imageUrl);
    if (!publicId) {
      return NextResponse.json({ error: "Invalid Cloudinary URL" }, { status: 400 });
    }

    console.log("Deleting Cloudinary asset with public_id:", publicId);

    const result = await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    console.error("Cloudinary delete error:", error);
    return NextResponse.json(
      { error: "Delete failed: " + getErrorMessage(error) },
      { status: 500 }
    );
  }
}
