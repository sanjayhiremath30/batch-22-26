// src/scripts/migrateStudentPhotos.js
/*
  Migration script for student photos.
  Steps:
  1. Connect to MongoDB.
  2. Create/refresh a backup collection `students_backup`.
  3. Process documents in batches (default 20, can be overridden with BATCH_SIZE env var).
  4. For each document, if `photoUrl` already looks like a URL, skip.
  5. Otherwise upload the Base64 data URL to Cloudinary (folder "students").
  6. On success, replace `photoUrl` with the returned `secure_url`.
  7. Log successes, skips, and failures.
  8. Exit with code 0 on success, 1 on unexpected error.
*/

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const cloudinary = require('cloudinary').v2;

// ---- Config ----
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ MONGODB_URI not set in environment');
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE, 10) || 20;

(async () => {
  let client;
  try {
    client = new MongoClient(mongoUri);
    await client.connect();
    const dbName = process.env.DB_NAME || client.db().databaseName;
    const db = client.db(dbName);
    console.log('✅ Connected to MongoDB database:', dbName);

    // ---- Backup ----
    const backupName = 'students_backup';
    const backupExists = await db.listCollections({ name: backupName }).hasNext();
    if (backupExists) {
      console.log('⚠️ Backup collection exists – dropping it first');
      await db.collection(backupName).drop();
    }
    console.log('🔁 Creating backup of `students` collection...');
    await db.collection('students').aggregate([{ $match: {} }, { $out: backupName }]).toArray();
    console.log('✅ Backup created as collection', backupName);

    // ---- Migration ----
    const studentsCol = db.collection('students');
    const cursor = studentsCol.find({}).limit(BATCH_SIZE);
    let processed = 0, succeeded = 0, skipped = 0, failed = 0;

    while (await cursor.hasNext()) {
      const student = await cursor.next();
      if (!student) break;
      processed++;
      const { _id, photoUrl } = student;
      if (typeof photoUrl === 'string' && photoUrl.startsWith('http')) {
        console.log(`⚡️ Student ${_id?.toString()} already migrated – skipping`);
        skipped++;
        continue;
      }
      try {
        const uploadResult = await cloudinary.uploader.upload(photoUrl, { folder: 'students', resource_type: 'image' });
        await studentsCol.updateOne({ _id }, { $set: { photoUrl: uploadResult.secure_url } });
        console.log(`✅ Migrated student ${_id?.toString()}`);
        succeeded++;
      } catch (err) {
        console.error(`❌ Failed to migrate student ${_id?.toString()}:`, err);
        failed++;
        // keep original Base64 unchanged
      }
    }

    console.log('\n--- Migration batch summary ---');
    console.log(`Processed: ${processed}`);
    console.log(`Migrated: ${succeeded}`);
    console.log(`Skipped (already URLs): ${skipped}`);
    console.log(`Failed: ${failed}`);

    process.exit(0);
  } catch (e) {
    console.error('❌ Unexpected error during migration:', e);
    process.exit(1);
  } finally {
    if (client) await client.close();
  }
})();
