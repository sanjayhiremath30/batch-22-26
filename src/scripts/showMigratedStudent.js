// src/scripts/showMigratedStudent.js
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

(async () => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const dbName = process.env.DB_NAME || client.db().databaseName;
  const db = client.db(dbName);
  const student = await db.collection('students').findOne({ photoUrl: { $regex: '^https://res\.cloudinary\.com' } });
  console.log('Migrated student document:', JSON.stringify({ _id: student._id, name: student.name, photoUrl: student.photoUrl }, null, 2));
  await client.close();
})();
