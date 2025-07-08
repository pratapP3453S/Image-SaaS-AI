// app/api/like-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import Like from "@/lib/database/models/like.model";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { imageUrl, fileId, source } = await req.json();

    await connectToDatabase();
    await Like.create({ userId, imageUrl, fileId, source });

    return NextResponse.json({ message: "Image liked." }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to like image" }, { status: 500 });
  }
}
