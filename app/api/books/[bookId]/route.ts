import { NextRequest, NextResponse } from "next/server";
import { auth, createClerkClient } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Flipbook from "@/lib/models/Flipbook";

// GET single album by ID (Public, for guest viewers)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
    await dbConnect();

    const book = await Flipbook.findById(bookId);
    if (!book) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    // Fetch creator's phone number from Clerk
    let creatorPhone = "";
    try {
      if (process.env.CLERK_SECRET_KEY) {
        const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const clerkUser = await clerkClient.users.getUser(book.userId);
        if (clerkUser && clerkUser.phoneNumbers) {
          const primaryPhone = clerkUser.phoneNumbers.find(
            (p: any) => p.id === clerkUser.primaryPhoneNumberId
          );
          creatorPhone = primaryPhone?.phoneNumber || clerkUser.phoneNumbers[0]?.phoneNumber || "";
        }
      }
    } catch (clerkError) {
      console.error("Clerk fetch user error in GET /api/books/[bookId]:", clerkError);
    }

    const bookData = book.toObject() as any;
    bookData.creatorPhone = creatorPhone;

    return NextResponse.json(bookData);
  } catch (error: any) {
    console.error("GET single book error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch album" },
      { status: 500 }
    );
  }
}

// Helper to extract public_id from Cloudinary URL
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

// DELETE album by ID (Protected, owner only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId } = await params;
    await dbConnect();

    const book = await Flipbook.findById(bookId);
    if (!book) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    // Verify ownership
    if (book.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 1. Gather all associated Cloudinary images to clean up
    const publicIds: string[] = [];
    const addUrl = (url: string) => {
      const publicId = getPublicIdFromUrl(url);
      if (publicId) publicIds.push(publicId);
    };

    if (book.coverFrontImage) addUrl(book.coverFrontImage);
    if (book.coverBackImage) addUrl(book.coverBackImage);
    if (book.spreads && Array.isArray(book.spreads)) {
      book.spreads.forEach((spread: any) => {
        if (spread.leftImage) addUrl(spread.leftImage);
        if (spread.rightImage) addUrl(spread.rightImage);
      });
    }

    // 2. Perform parallel asset destruction in Cloudinary
    if (publicIds.length > 0) {
      try {
        const { v2: cloudinary } = require("cloudinary");
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        console.log(`Deleting ${publicIds.length} Cloudinary assets for album: ${bookId}`);
        await Promise.all(
          publicIds.map((publicId) =>
            cloudinary.uploader.destroy(publicId).catch((err: any) => {
              console.error(`Failed to delete Cloudinary asset ${publicId}:`, err);
            })
          )
        );
      } catch (cloudinaryErr) {
        console.error("Failed to connect/authenticate with Cloudinary on album delete:", cloudinaryErr);
      }
    }

    await Flipbook.findByIdAndDelete(bookId);
    return NextResponse.json({ success: true, message: "Album and all associated photos deleted successfully" });
  } catch (error: any) {
    console.error("DELETE single book error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete album" },
      { status: 500 }
    );
  }
}

// PUT album by ID (Protected, owner only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId } = await params;
    await dbConnect();

    const book = await Flipbook.findById(bookId);
    if (!book) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    // Verify ownership
    if (book.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, coverFrontImage, coverBackImage, audioUrl, weddingDate, spreads } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Update fields
    book.title = title;
    book.description = description || "";
    book.coverFrontImage = coverFrontImage || "";
    book.coverBackImage = coverBackImage || "";
    book.audioUrl = audioUrl || "";
    book.weddingDate = weddingDate || "";
    book.spreads = spreads || [];

    await book.save();
    return NextResponse.json(book);
  } catch (error: any) {
    console.error("PUT single book error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update album" },
      { status: 500 }
    );
  }
}

