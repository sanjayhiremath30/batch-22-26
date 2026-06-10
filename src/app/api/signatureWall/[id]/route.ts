// src/app/api/signatureWall/[id]/route.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifySecretKey } from '@/lib/secretKeyAuth';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const secretKey = request.headers.get('x-secret-key');
  try {
    await verifySecretKey(secretKey);
  } catch {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const updates = await request.json();
  const db = getDb();
  const now = new Date();
  await db.collection('signatureWall').updateOne(
    { _id: new ObjectId(params.id) },
    { $set: { ...updates, updatedAt: now } }
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const secretKey = request.headers.get('x-secret-key');
  try {
    await verifySecretKey(secretKey);
  } catch {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const db = getDb();
  await db.collection('signatureWall').deleteOne({ _id: new ObjectId(params.id) });
  return NextResponse.json({ success: true });
}
