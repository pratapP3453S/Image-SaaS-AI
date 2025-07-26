// // app/api/home-images/download-images/route.ts
// import { NextResponse } from 'next/server';
// import { createWriteStream, mkdirSync } from "fs";
// import { promisify } from "util";
// import stream from "stream";
// import fetch from "node-fetch";
// import archiver from "archiver";
// import path from "path";
// import { auth } from "@clerk/nextjs/server";

// const pipeline = promisify(stream.pipeline);

// interface LikedImage {
//   _id: string;
//   imageUrl: string;
//   fileId: string;
//   source: "kit1" | "kit2";
//   createdAt: string;
//   userId: string;
// }

// export async function POST(request: Request) {
//   try {
//     // 1. Authenticate user
//     const { userId } = auth();
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // 2. Fetch liked images from your API
//     const baseUrl = new URL(request.url).origin;
//     const likedImagesUrl = `${baseUrl}/api/home-images/liked-images`;
    
//     const likedRes = await fetch(likedImagesUrl, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${userId}` // Forward auth context
//       }
//     });

//     // 3. Handle API response
//     if (!likedRes.ok) {
//       const errorData = await likedRes.json().catch(() => ({}));
//       console.error('Liked images API error:', {
//         status: likedRes.status,
//         error: errorData
//       });
//       throw new Error(`Failed to fetch liked images: ${likedRes.statusText}`);
//     }

//     const images: LikedImage[] = await likedRes.json();
    
//     if (!Array.isArray(images)) {
//       throw new Error("Invalid data format received from API");
//     }

//     // Filter images for the current user (additional security)
//     const userImages = images.filter(img => img.userId === userId);
//     if (userImages.length === 0) {
//       return NextResponse.json(
//         { error: "No liked images found for this user" },
//         { status: 404 }
//       );
//     }

//     // 4. Create temporary directory
//     const tempDir = path.join(process.cwd(), "temp", `liked-images-${userId}-${Date.now()}`);
//     mkdirSync(tempDir, { recursive: true });

//     // 5. Download images with error handling for each
//     const downloadResults = await Promise.allSettled(
//       userImages.map(async (img, index) => {
//         try {
//           const imageRes = await fetch(img.imageUrl);
//           if (!imageRes.ok) {
//             throw new Error(`Failed to download image: ${imageRes.status}`);
//           }
          
//           const ext = path.extname(new URL(img.imageUrl).pathname) || ".jpg";
//           const filename = path.join(tempDir, `image-${index}${ext}`);
          
//           if (!imageRes.body) {
//             throw new Error("No image data received");
//           }
          
//           await pipeline(imageRes.body, createWriteStream(filename));
//           return filename;
//         } catch (err) {
//           console.error(`Error downloading image ${img._id}:`, err);
//           throw err; // Will be caught by Promise.allSettled
//         }
//       })
//     );

//     // Check for failed downloads
//     const failedDownloads = downloadResults.filter(r => r.status === 'rejected');
//     if (failedDownloads.length > 0) {
//       console.error('Failed downloads:', failedDownloads);
//       if (failedDownloads.length === userImages.length) {
//         throw new Error("All image downloads failed");
//       }
//     }

//     // 6. Create zip archive
//     const archive = archiver("zip", { zlib: { level: 9 } });
//     const chunks: Uint8Array[] = [];
    
//     const archiveStream = new stream.Writable({
//       write(chunk: Uint8Array, _encoding, callback) {
//         chunks.push(chunk);
//         callback();
//       }
//     });

//     archive.pipe(archiveStream);
//     archive.directory(tempDir, false);
//     await archive.finalize();

//     // Wait for archive completion
//     await new Promise((resolve) => archiveStream.on('finish', resolve));
//     const zipBuffer = Buffer.concat(chunks);

//     // 7. Return the zip file
//     return new NextResponse(zipBuffer, {
//       headers: {
//         'Content-Type': 'application/zip',
//         'Content-Disposition': `attachment; filename=${userId}-liked-images.zip`
//       }
//     });

//   } catch (error) {
//     console.error('Download endpoint error:', error);
//     return NextResponse.json(
//       { 
//         error: "Failed to generate download",
//         details: error instanceof Error ? error.message : "Unknown error",
//         ...(process.env.NODE_ENV === 'development' && {
//           stack: error instanceof Error ? error.stack : undefined
//         })
//       },
//       { status: 500 }
//     );
//   }
// }