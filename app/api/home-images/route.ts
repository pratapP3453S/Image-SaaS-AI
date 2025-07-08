import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import { auth } from "@clerk/nextjs/server";

const kit1 = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!,
});

const kit2 = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_SECOND_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_SECOND_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_SECOND_URL_ENDPOINT!,
});

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '100');
    const source = searchParams.get('source') || 'kit1';

    // Fetch from both sources if 'all' is specified
    if (source === 'all') {
      const [files1, files2] = await Promise.all([
        kit1.listFiles({ path: "/photo", limit, skip, sort: "ASC_CREATED" }),
        kit2.listFiles({ path: "/photo2", limit, skip, sort: "ASC_CREATED" })
      ]);
      
      const combinedFiles = [...files1, ...files2];
      return NextResponse.json(combinedFiles, { status: 200 });
    }

    // Fetch from specific source
    const imagekit = source === 'kit2' ? kit2 : kit1;
    const files = await imagekit.listFiles({ 
      path: source === 'kit2' ? "/photo2" : "/photo", 
      limit, 
      skip, 
      sort: "ASC_CREATED" 
    });

    return NextResponse.json(files, { status: 200 });
  } catch (error: any) {
    console.error('ImageKit API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch images.' }, { status: 500 });
  }
}