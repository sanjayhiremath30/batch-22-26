// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Please define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image file to Cloudinary.
 * @param fileBuffer Buffer containing the image data.
 * @param publicId Optional public ID for the asset.
 * @returns URL of the uploaded image.
 */
export async function uploadImage(fileBuffer: Buffer, publicId?: string): Promise<string> {
  const result = await cloudinary.uploader.upload_stream({ resource_type: 'image', public_id: publicId }, (error, result) => {
    if (error) throw error;
    return result;
  }).end(fileBuffer);
  // The above pattern is not directly async; using a Promise wrapper:
  return new Promise<string>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream({ resource_type: 'image', public_id: publicId }, (error, result) => {
      if (error) return reject(error);
      resolve(result?.secure_url ?? result?.url ?? '');
    });
    upload.end(fileBuffer);
  });
}

/**
 * Upload a video file to Cloudinary.
 * @param fileBuffer Buffer containing the video data.
 * @param publicId Optional public ID for the asset.
 * @returns URL of the uploaded video.
 */
export async function uploadVideo(fileBuffer: Buffer, publicId?: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream({ resource_type: 'video', public_id: publicId }, (error, result) => {
      if (error) return reject(error);
      resolve(result?.secure_url ?? result?.url ?? '');
    });
    upload.end(fileBuffer);
  });
}
