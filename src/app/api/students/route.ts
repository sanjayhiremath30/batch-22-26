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
    birthday: 1,
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

export async function POST(req: Request) {
  try {
    const secretKey = req.headers.get('x-secret-key');
    const validKey = process.env.NEXT_PUBLIC_SECRET_KEY || process.env.SECRET_KEY || 'dev-secret';
    
    if (secretKey !== validKey) {
      return NextResponse.json({ error: 'Unauthorized: Invalid secret key' }, { status: 401 });
    }

    const body = await req.json();
    console.log("Submitting student:", body);

    const { id, name, branch, instagramId, photoUrl, birthday, favouriteMemory, bestFriend } = body;

    if (!id || !name || !branch || !instagramId || !photoUrl) {
      return NextResponse.json({ error: 'Bad Request: Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('students');
    
    const now = new Date().toISOString();
    const newStudent = {
      ...body,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(newStudent);
    
    console.log("API response:", result);

    return NextResponse.json({ success: true, insertedId: result.insertedId, student: newStudent }, { status: 201 });
  } catch (error: any) {
    console.error("Student creation failed:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
