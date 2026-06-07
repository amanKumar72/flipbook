import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import fs from "fs";
import path from "path";

// Configure Cloudinary from server-side environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  let tempFilePath = "";
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

    // Create a temp directory and write file to it for chunked upload
    const tempDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    // Clean up filename to prevent path traversal issues
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    tempFilePath = path.join(tempDir, `upload_${Date.now()}_${safeName}`);
    fs.writeFileSync(tempFilePath, buffer);

    // 3. Upload to Cloudinary under UPLOAD_FOLDER using upload_large for chunking
    const uploadFolder = process.env.UPLOAD_FOLDER || "flipbook";
    
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_large(
        tempFilePath,
        {
          folder: uploadFolder,
          resource_type: "image",
          chunk_size: 6000000, // 6MB chunks to handle files up to 25MB+
        },
        (error, uploadResult) => {
          if (error) {
            reject(error);
          } else {
            resolve(uploadResult);
          }
        }
      );
    });

    console.log("Cloudinary upload_large result:", result);

    // 4. Return the secure URL
    return NextResponse.json({ url: result.secure_url });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: "Upload failed: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  } finally {
    // Always clean up temp files with a delay to ensure Cloudinary's internal stream has fully closed
    if (tempFilePath) {
      setTimeout(() => {
        try {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        } catch (err) {
          console.error("Failed to delete temp file:", err);
        }
      }, 15000); // 15 seconds delay
    }
  }
}
