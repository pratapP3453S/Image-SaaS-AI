import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import { auth } from "@clerk/nextjs/server";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!,
});

// GET /api/home-images?skip=0&limit=20
export async function GET(req: NextRequest) {
  try {
    // Auth
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Validate range
    const finalLimit = Math.min(Math.max(limit, 1), 1000); // min 1, max 1000
    const finalSkip = Math.max(skip, 0);

    // Fetch files from ImageKit
    const result = await imagekit.listFiles({
      path: "/photo",  // change to your folder if needed
      limit: finalLimit,
      skip: finalSkip,
      sort: "ASC_CREATED",
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('ImageKit API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images from ImageKit.' },
      { status: 500 }
    );
  }
}
