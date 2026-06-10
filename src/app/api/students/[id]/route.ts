// src/app/api/students/[id]/route.ts
import { NextResponse } from 'next/server';
import { getDb, connectToDatabase } from '@/lib/mongodb';
import { verifySecretKey } from '@/lib/secretKeyAuth';
import { ObjectId } from 'mongodb';

/** Helper to determine if a string is a valid MongoDB ObjectId (24 hex chars) */
function isObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/** Update a student */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  console.log('UPDATE ID:', id);
  const secretKey = request.headers.get('x-secret-key');

  await connectToDatabase();
  try {
    await verifySecretKey(secretKey);
  } catch {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const updates = await request.json();
  const db = getDb();
  const now = new Date();
  let result;

  if (isObjectId(id)) {
    // ObjectId path
    result = await db
      .collection('students')
      .updateOne({ _id: new ObjectId(id) }, { $set: { ...updates, updatedAt: now } });
  } else {
    // Custom string id path
    result = await db
      .collection('students')
      .updateOne({ id }, { $set: { ...updates, updatedAt: now } });
  }

  console.log('UPDATE RESULT:', result);
  if (result.matchedCount === 0) {
    console.error('No student found to update with id', id);
  }
  return NextResponse.json({ success: result.modifiedCount > 0 });
}

/** Delete a student */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  console.log('DELETE ID:', id);
  const secretKey = request.headers.get('x-secret-key');

  await connectToDatabase();
  try {
    await verifySecretKey(secretKey);
  } catch {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const db = getDb();
  let result;

  if (isObjectId(id)) {
    // ObjectId path
    result = await db.collection('students').deleteOne({ _id: new ObjectId(id) });
  } else {
    // Custom string id path
    result = await db.collection('students').deleteOne({ id });
  }

  console.log('DELETE RESULT:', result);
  return NextResponse.json({ success: result.deletedCount > 0 });
}
