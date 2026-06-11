// src/app/api/students/route.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifySecretKey } from '@/lib/secretKeyAuth';

export async function GET() {
  try {
    const db = await getDb();
    const students = await db.collection('students').find({}).toArray();
    return NextResponse.json(students);
  } catch (err) {
    console.error('[students GET]', err);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const secretKey = request.headers.get('x-secret-key') || undefined;
  try {
    await verifySecretKey(secretKey);
  } catch {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  try {
    const body = await request.json();
    const db = await getDb();
    const now = new Date();
    const result = await db.collection('students').insertOne({ ...body, createdAt: now, updatedAt: now });
    return NextResponse.json({ insertedId: result.insertedId });
  } catch (err) {
    console.error('[students POST]', err);
    return NextResponse.json({ error: 'Failed to add student' }, { status: 500 });
  }
}
