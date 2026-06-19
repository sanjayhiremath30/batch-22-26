// src/scripts/checkMigrationStats.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');
  const client = new MongoClient(uri);
  await client.connect();
  const dbName = process.env.DB_NAME || client.db().databaseName;
  const db = client.db(dbName);

  const backupCount = await db.collection('students_backup').countDocuments();
  const total = await db.collection('students').countDocuments();
  const migrated = await db.collection('students').countDocuments({ photoUrl: { $regex: '^https?' } });
  const skipped = total - migrated;

  console.log('=== Migration Summary ===');
  console.log('Total students:', total);
  console.log('Backup documents:', backupCount);
  console.log('Migrated (photoUrl as URL):', migrated);
  console.log('Skipped (still Base64):', skipped);
  await client.close();
}

if (require.main === module) {
  main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}
