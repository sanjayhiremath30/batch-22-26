// src/app/api/students/route.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(req: Request) {
  console.log('🚀 API /api/students – handler start');

  // Connect to DB
  const db = await getDb();
  console.log('✅ MongoDB connected:', db.databaseName);

  const collection = db.collection('students');
  const projection = {
    name: 1,
    branch: 1,
    instagramId: 1,
    photoUrl: 1,
    favouriteMemory: 1,
    bestFriend: 1,
    _id: 1,
  };

  // Fetch up to 100 students
  const students = await collection
    .find({}, { projection })
    .limit(100)
    .toArray();
  console.log('📦 Students fetched:', students.length);

  const payload = {
    count: students.length,
    students,
  };
  console.log('✅ Response prepared – sending');
  return NextResponse.json(payload);
}
