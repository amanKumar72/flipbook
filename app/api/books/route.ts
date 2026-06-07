import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Flipbook from "@/lib/models/Flipbook";

// Fetch all books for the authenticated user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const books = await Flipbook.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json(books);
  } catch (error: any) {
    console.error("GET /api/books error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch books" }, { status: 500 });
  }
}

// Create a new flipbook
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, spreads } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    await dbConnect();
    const newBook = new Flipbook({
      userId,
      title,
      description,
      spreads: spreads || [],
    });

    await newBook.save();
    return NextResponse.json(newBook);
  } catch (error: any) {
    console.error("POST /api/books error:", error);
    return NextResponse.json({ error: error.message || "Failed to create book" }, { status: 500 });
  }
}
