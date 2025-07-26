// // app/api/like-image/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/database/mongoose";
// import Like from "@/lib/database/models/like.model";
// import { auth } from "@clerk/nextjs/server";

// export async function POST(req: NextRequest) {
//   try {
//     const { userId } = auth();
//     if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { imageUrl, fileId, source } = await req.json();

//     await connectToDatabase();
//     await Like.create({ userId, imageUrl, fileId, source });

//     return NextResponse.json({ message: "Image liked." }, { status: 201 });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Failed to like image" }, { status: 500 });
//   }
// }



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

    // ✅ Extract file name without extension
    const extractFilenameFromUrl = (url: string): string => {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      const filename = lastPart.split('?')[0];
      return filename.replace(/\.[^/.]+$/, ""); // e.g., "NDP00675"
    };

    const fileName = extractFilenameFromUrl(imageUrl);

    await connectToDatabase();
    await Like.create({ userId, imageUrl, fileName, fileId, source });

    return NextResponse.json({ message: "Image liked." }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to like image" }, { status: 500 });
  }
}
