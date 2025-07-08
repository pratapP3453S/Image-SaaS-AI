// app/api/liked-images/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import Like from "@/lib/database/models/like.model";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const likes = await Like.find({ userId });

    return NextResponse.json(likes, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch liked images" }, { status: 500 });
  }
}
