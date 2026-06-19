// src/app/api/students/route.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// Helper: promise that rejects after `ms` milliseconds
function timeoutPromise<T>(ms: number, message: string): Promise<T> {
  return new Promise<T>((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(message));
    }, ms);
  });
}

export async function GET() {
  console.log('🔍 STEP 1 – Starting GET /api/students');
  console.log('🔹 STEP 1 – About to obtain DB connection');

  try {
    // STEP 2 – after connection
    const db = await getDb();
    console.log('✅ STEP 2 – Connected to MongoDB database:', db.databaseName);

    const collection = db.collection('students');
    const collectionName = collection.collectionName;
    console.log('📂 STEP 2 – Using collection:', collectionName);

    // STEP 3 – count documents (debug)
    const count = await collection.countDocuments();
    console.log('📊 STEP 3 – Document count in collection:', count);

    // STEP 4 – fetch a single document for sanity check
    const firstStudentArray = await Promise.race([
      collection.find({}).limit(1).toArray(),
      timeoutPromise<any[]>(5000, 'MongoDB find operation timed out after 5s'),
    ]);
    const firstStudent = firstStudentArray[0] || null;
    console.log('🗂️ STEP 4 – First student document retrieved:', firstStudent);

    // STEP 4 – now fetch the full list (still with timeout protection)
    const students = await Promise.race([
      collection.find({}).toArray(),
      timeoutPromise<any[]>(10000, 'MongoDB full fetch timed out after 10s'),
    ]);
    console.log('📦 STEP 4 – Full student list fetched, length:', students.length);

    // STEP 5 – before returning response
    console.log('🚀 STEP 5 – Preparing JSON response');
    const responsePayload = {
      database: db.databaseName,
      collection: collectionName,
      count,
      students,
    };
    console.log('✅ STEP 5 – Response ready, sending back to client');
    return NextResponse.json(responsePayload);
  } catch (err) {
    console.error('❌ ERROR in /api/students GET handler:', err);
    return NextResponse.json(
      { error: 'Failed to fetch students', details: (err as Error).message },
      { status: 500 }
    );
  }
}
