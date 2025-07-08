// app/api/unlike-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import Like from "@/lib/database/models/like.model";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { imageUrl } = await req.json();

    await connectToDatabase();
    await Like.deleteOne({ userId, imageUrl });

    return NextResponse.json({ message: "Image unliked." }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to unlike image" }, { status: 500 });
  }
}
