import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
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

    return NextResponse.json(book);
  } catch (error: any) {
    console.error("GET single book error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch album" },
      { status: 500 }
    );
  }
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

    await Flipbook.findByIdAndDelete(bookId);
    return NextResponse.json({ success: true, message: "Album deleted successfully" });
  } catch (error: any) {
    console.error("DELETE single book error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete album" },
      { status: 500 }
    );
  }
}
