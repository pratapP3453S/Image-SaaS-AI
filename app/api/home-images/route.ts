// pages/api/images.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await imagekit.listFiles({
      path: "/photo", // Optional: folder name
      limit: 20, // Max: 1000
      sort: "ASC_CREATED"
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('ImageKit API Error:', error);
    res.status(500).json({ error: 'Failed to fetch images from ImageKit.' });
  }
}
