// src/scripts/migrateStudentPhotos.ts
import { connectToDatabase, getDb } from '@/lib/mongodb';
import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';
import { Collection, Document, WithId } from 'mongodb';

// Load environment variables (for Cloudinary credentials)
config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

interface Student extends Document {
  photoUrl: string;
  [key: string]: any;
}

/**
 * Creates a backup of the `students` collection into `students_backup`.
 * If the backup already exists, it will be dropped and recreated to ensure
 * a fresh snapshot before any migration runs.
 */
async function backupStudents(db: any): Promise<void> {
  const backupName = 'students_backup';
  const existing = await db.listCollections({ name: backupName }).hasNext();
  if (existing) {
    console.log('⚠️ Backup collection exists. Dropping it first...');
    await db.collection(backupName).drop();
  }
  console.log('🔁 Creating backup of `students` collection...');
  // Use aggregation $out to copy all docs
  await db
    .collection('students')
    .aggregate([{ $match: {} }, { $out: backupName }])
    .toArray();
  console.log('✅ Backup completed as collection `students_backup`.');
}

/**
 * Upload a Base64 image string to Cloudinary.
 * Returns the secure URL on success, otherwise throws.
 */
async function uploadBase64(imageBase64: string): Promise<string> {
  // Cloudinary can accept a data URI directly
  const result = await cloudinary.uploader.upload(imageBase64, {
    folder: 'students',
    resource_type: 'image',
  });
  return result.secure_url;
}

/**
 * Process a batch of student records.
 * `batchSize` controls how many records are handled in one run.
 * Set to a small number for testing (e.g., 5) and increase for full migration.
 */
async function migrateBatch(db: any, batchSize = 20): Promise<void> {
  const studentsCol: Collection<Student> = db.collection('students');

  const cursor = studentsCol.find({}).limit(batchSize);
  let processed = 0;
  let succeeded = 0;
  let skipped = 0;
  let failed = 0;

  while (await cursor.hasNext()) {
    const student = await cursor.next();
    if (!student) break;
    processed++;
    const { _id, photoUrl } = student;
    // Skip if already a Cloudinary URL (simple heuristic)
    if (photoUrl && photoUrl.startsWith('http')) {
      console.log(`⚡️ Student ${_id?.toString()} already migrated, skipping.`);
      skipped++;
      continue;
    }
    try {
      const secureUrl = await uploadBase64(photoUrl);
      await studentsCol.updateOne({ _id }, { $set: { photoUrl: secureUrl } });
      console.log(`✅ Migrated student ${_id?.toString()}`);
      succeeded++;
    } catch (err) {
      console.error(`❌ Failed to migrate student ${_id?.toString()}:`, err);
      failed++;
      // Keep original Base64 unchanged – nothing to do.
    }
  }

  console.log('\n--- Migration batch summary ---');
  console.log(`Processed: ${processed}`);
  console.log(`Migrated: ${succeeded}`);
  console.log(`Skipped (already URLs): ${skipped}`);
  console.log(`Failed: ${failed}`);
}

/**
 * Main entry point. Executes backup then migrates in batches.
 * Adjust `BATCH_SIZE` env var for test vs full run.
 */
async function main() {
  try {
    await connectToDatabase();
    const db = await getDb();
    // Step 1: backup
    await backupStudents(db);
    // Step 2: migrate in batches
    const batchSize = Number(process.env.BATCH_SIZE) || 20; // default 20 docs per run
    await migrateBatch(db, batchSize);
    console.log('🎉 Migration script finished.');
  } catch (e) {
    console.error('❗️ Unexpected error in migration script:', e);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
