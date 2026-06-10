// src/app/api/students/[id]/route.ts
import { NextResponse } from 'next/server';
import { getDb, connectToDatabase } from '@/lib/mongodb';
import { verifySecretKey } from '@/lib/secretKeyAuth';
import { ObjectId } from 'mongodb';

function isObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/** Update a student */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  console.log('UPDATE ID:', id);
  const secretKey = request.headers.get('x-secret-key') || undefined;

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
    result = await db.collection('students').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: now } }
    );
  } else {
    result = await db.collection('students').updateOne(
      { id },
      { $set: { ...updates, updatedAt: now } }
    );
  }

  return NextResponse.json({
    success: result.modifiedCount > 0,
  });
}

/** Delete a student */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  console.log('DELETE ID:', id);
  const secretKey = request.headers.get('x-secret-key') || undefined;

  await connectToDatabase();

  try {
    await verifySecretKey(secretKey);
  } catch {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const db = getDb();
  let result;

  if (isObjectId(id)) {
    result = await db.collection('students').deleteOne({
      _id: new ObjectId(id),
    });
  } else {
    result = await db.collection('students').deleteOne({
      id,
    });
  }

  return NextResponse.json({
    success: result.deletedCount > 0,
  });
}