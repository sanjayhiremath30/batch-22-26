// src/scripts/diagnoseStudents.ts
import { getDb } from '../lib/mongodb.ts';
import type { Document } from 'mongodb';

/**
 * Helper to safely run an async operation with a timeout.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

async function main() {
  console.log('🔧 Starting diagnostics for student collection');
  const db = await withTimeout(getDb(), 8000, 'DB connection timed out');

  const collection = db.collection('students');

  // 1️⃣ Total count
  const total = await withTimeout(collection.countDocuments(), 5000, 'countDocuments timed out');
  console.log('Total students:', total);

  // 2️⃣ Base64 count
  const base64Count = await withTimeout(
    collection.countDocuments({ photoUrl: { $regex: '^data:image' } }),
    5000,
    'Base64 count timed out'
  );
  console.log('Base64 photoUrl count:', base64Count);

  // 3️⃣ Cloudinary count
  const cloudCount = await withTimeout(
    collection.countDocuments({ photoUrl: { $regex: '^https://res\.cloudinary\.com/' } }),
    5000,
    'Cloudinary count timed out'
  );
  console.log('Cloudinary photoUrl count:', cloudCount);

  // 4️⃣ Names with Base64 images
  if (base64Count > 0) {
    const cursor = collection.find({ photoUrl: { $regex: '^data:image' } }, { projection: { name: 1, _id: 0 } });
const names = await withTimeout(cursor.toArray(), 5000, 'Fetching Base64 names timed out');
    const base64Names = names.map((doc: any) => doc.name ?? '(no name)');
    console.log('Names with Base64 images:');
    base64Names.forEach((n) => console.log('- ', n));
  } else {
    console.log('No Base64 images found.');
  }

  // 5️⃣ Largest documents by BSON size (top 5)
  const largest = await withTimeout(
    collection
      .aggregate([
        { $project: { size: { $bsonSize: '$$ROOT' }, doc: '$$ROOT' } },
        { $sort: { size: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, size: 1, doc: 1 } },
      ])
      .toArray(),
    8000,
    'Aggregating largest documents timed out'
  );
  console.log('Top 5 largest student documents (size in bytes):');
  largest.forEach((entry, i) => {
    console.log(`${i + 1}. size: ${entry.size}`);
    // Optionally print a brief identifier
    if (entry.doc && entry.doc.name) console.log(`   name: ${entry.doc.name}`);
  });

  console.log('✅ Diagnostics completed');
}

// Execute script
main().catch((err) => {
  console.error('❌ Diagnostic script failed:', err);
  process.exit(1);
});
