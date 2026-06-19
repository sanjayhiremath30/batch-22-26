// src/scripts/verifyMigration.ts
import { getDb } from '@/lib/mongodb';
import { config } from 'dotenv';

config(); // Load env variables

async function verify() {
  try {
    const db = await getDb();
    const student = await db.collection('students').findOne();
    if (!student) {
      console.log('⚠️ No student found in the collection.');
      return;
    }
    console.log('👤 Sample student:', JSON.stringify({ _id: student._id, name: student.name }));
    console.log('📷 photoUrl:', student.photoUrl);
    const isUrl = typeof student.photoUrl === 'string' && student.photoUrl.startsWith('http');
    console.log(isUrl ? '✅ photoUrl is a Cloudinary URL' : '❌ photoUrl is still Base64');
  } catch (err) {
    console.error('❌ Verification error:', err);
  } finally {
    process.exit();
  }
}

if (require.main === module) {
  verify();
}
