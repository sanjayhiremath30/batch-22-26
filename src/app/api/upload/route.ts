// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { uploadImage, uploadVideo } from '@/lib/cloudinary';
import sharp from 'sharp';

type MediaType = 'image' | 'video';

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return new NextResponse('Unsupported Media Type', { status: 415 });
  }
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const type = (formData.get('type') as MediaType) ?? 'image';
  if (!file) return new NextResponse('No file provided', { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  let uploadResultUrl: string;
  if (type === 'image') {
    // Compress image to <=1MB using sharp
    const compressed = await sharp(buffer)
      .rotate()
      .jpeg({ quality: 80 })
      .toBuffer();
    // Ensure size limit
    if (compressed.length > 1_048_576) {
      return new NextResponse('Image exceeds 1MB after compression', { status: 400 });
    }
    uploadResultUrl = await uploadImage(compressed, file.name);
  } else {
    // For video, directly upload (no compression)
    uploadResultUrl = await uploadVideo(buffer, file.name);
  }
  // Return optimized Cloudinary URL (auto format)
  const optimizedUrl = `${uploadResultUrl}?f=auto&q=auto`;
  return NextResponse.json({ url: optimizedUrl });
}
