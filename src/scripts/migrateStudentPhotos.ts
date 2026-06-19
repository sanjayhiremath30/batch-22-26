// src/scripts/migrateStudentPhotos.ts
/**
 * Migration script that converts all Base64-encoded `photoUrl` values in the
 * `students` collection to Cloudinary URLs.
 *
 * Requirements fulfilled:
 *  • Uses a relative import for `getDb` (../lib/mongodb).
 *  • Counts Base64 documents via `countDocuments` (no deprecated cursor.count()).
 *  • Uploads each Base64 image to Cloudinary (folder: "students").
 *  • Updates **only** the `photoUrl` field.
 * Run with: npm run migrate
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
console.log('MONGODB_URI loaded:', !!process.env.MONGODB_URI);
import { getDb } from '../lib/mongodb';
import { Db, Document } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';
// ---------------------------------------------------------------------
// Cloudinary configuration – read from environment variables.
// ---------------------------------------------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  api_key: process.env.CLOUDINARY_API_KEY ?? '',
  api_secret: process.env.CLOUDINARY_API_SECRET ?? '',
  secure: true,
});

interface StudentDoc extends Document {
  _id: any;
  name: string;
  photoUrl: string;
  // other fields are allowed but not typed – we never modify them.
}

/** Helper – determines whether a URL is a Base64 data URI. */
function isBase64(url: string): boolean {
  return /^data:image/.test(url);
}

/** Upload a Base64 data‑uri to Cloudinary and return the secure URL. */
async function uploadToCloudinary(base64: string): Promise<string> {
  const result = await cloudinary.uploader.upload(base64, {
    folder: 'students',
    resource_type: 'image',
  });
  return result.secure_url;
}

/** Main migration routine */
async function migrate(): Promise<void> {
  console.log('🚀 Starting student‑photo migration');

  const db: Db = await getDb();
  const coll = db.collection<StudentDoc>('students');

  // ---------------------------------------------------------------
  // 1️⃣ Count how many documents still have Base64 images.
  // ---------------------------------------------------------------
  const totalBase64 = await coll.countDocuments({ photoUrl: { $regex: '^data:image' } });
  console.log(`🔎 Base64 photos found: ${totalBase64}`);

  if (totalBase64 === 0) {
    console.log('✅ No Base64 images to migrate. Exiting.');
    return;
  }

  // Helper to add a timeout to a promise
  function withTimeout<T>(promise: Promise<T>, ms: number, taskName: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${ms}ms in ${taskName}`)), ms)
      ),
    ]) as Promise<T>;
  }

  // ---------------------------------------------------------------
  // 2️⃣ Process each document – we use a cursor to stream results.
  // ---------------------------------------------------------------
  console.log('📂 Creating cursor...');
  const cursor = coll.find(
    { photoUrl: { $regex: '^data:image' } },
    { projection: { _id: 1, name: 1, photoUrl: 1 } }
  );
  console.log('✅ Cursor created');

  let processed = 0;
  let migrated = 0;
  const failedIds: any[] = [];

  while (true) {
    console.log('➡️ Checking hasNext...');
    const hasNext = await cursor.hasNext();
    console.log(`✅ hasNext = ${hasNext}`);
    if (!hasNext) break;

    console.log('📄 Fetching next document...');
    const doc = await cursor.next();
    if (!doc) break;

    processed += 1;
    const { _id, name, photoUrl } = doc;
    console.log(`📄 Loaded document: ${name} (id: ${_id})`);

    try {
      console.log('☁️ Starting Cloudinary upload...');
      const secureUrl = await withTimeout(uploadToCloudinary(photoUrl), 30000, 'Cloudinary upload');
      console.log('✅ Cloudinary upload completed');

      console.log('💾 Updating MongoDB...');
      await withTimeout(coll.updateOne({ _id }, { $set: { photoUrl: secureUrl } }), 30000, 'MongoDB update');
      console.log('✅ MongoDB update completed');

      migrated += 1;
      console.log(`[${processed}/${totalBase64}] Migrated ${name}`);
    } catch (e) {
      console.error(`[${processed}/${totalBase64}] ❌ Failed ${name}`);
      console.error(e instanceof Error ? e.stack : e);
      failedIds.push(_id);
    }
  }

  // ---------------------------------------------------------------
  // 3️⃣ Summary
  // ---------------------------------------------------------------
  console.log('\n=== Migration Summary ===');
  console.log(`Total students in collection : ${await coll.estimatedDocumentCount()}`);
  console.log(`Base64 images discovered    : ${totalBase64}`);
  console.log(`Successfully migrated       : ${migrated}`);
  console.log(`Failed migrations           : ${failedIds.length}`);
  if (failedIds.length) {
    console.log('Failed student IDs:', failedIds);
  }

  // ---------------------------------------------------------------
  // 4️⃣ Verification – ensure no Base64 images remain.
  // ---------------------------------------------------------------
  const remaining = await coll.countDocuments({ photoUrl: { $regex: '^data:image' } });
  console.log(`\nRemaining Base64 images: ${remaining}`);
  if (remaining === 0) {
    console.log('🎉 Migration complete – all students now use Cloudinary URLs.');
  } else {
    console.warn('⚠️ Some Base64 images remain. Re‑run the script or investigate failures.');
  }
}

// Execute when run directly via `node -r ts-node/register …`
migrate().catch((err) => {
  console.error('🚨 Unexpected error during migration:', err);
  process.exit(1);
});
