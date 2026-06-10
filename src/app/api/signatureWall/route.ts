import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifySecretKey } from '@/lib/secretKeyAuth';

// GET all signature wall entries
export async function GET() {
  const db = getDb();
  const items = await db.collection('signatureWall').find({}).toArray();
  return NextResponse.json(items);
}

// POST a new entry (requires secret key)
export async function POST(request: Request) {
  const secretKey = request.headers.get('x-secret-key');
  try {
    await verifySecretKey(secretKey);
  } catch (e) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const body = await request.json();
  const db = getDb();
  const now = new Date();
  const result = await db.collection('signatureWall').insertOne({ ...body, createdAt: now, updatedAt: now });
  return NextResponse.json({ insertedId: result.insertedId });
}
