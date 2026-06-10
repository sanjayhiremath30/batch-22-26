// src/app/api/students/route.ts
import { NextResponse } from 'next/server';
import { getDb, connectToDatabase } from '@/lib/mongodb';
import { verifySecretKey } from '@/lib/secretKeyAuth';

export async function GET() {
  await connectToDatabase();
  const db = getDb();
  const students = await db.collection('students').find({}).toArray();
  return NextResponse.json(students);
}

export async function POST(request: Request) {
  const secretKey = request.headers.get('x-secret-key');
  try {
    await verifySecretKey(secretKey);
  } catch (e) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const body = await request.json();
  await connectToDatabase();
  const db = getDb();
  const now = new Date();
  const result = await db.collection('students').insertOne({ ...body, createdAt: now, updatedAt: now });
  return NextResponse.json({ insertedId: result.insertedId });
}
