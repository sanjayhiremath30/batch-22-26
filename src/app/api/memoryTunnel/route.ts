// src/app/api/memoryTunnel/route.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifySecretKey } from '@/lib/secretKeyAuth';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const skip = Number(url.searchParams.get('skip') ?? '0');
  const limit = Number(url.searchParams.get('limit') ?? '20');

  const db = getDb();

  const items = await db
    .collection('memoryTunnel')
    .find({})
    .skip(skip)
    .limit(limit)
    .toArray();

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const secretKey = request.headers.get('x-secret-key') || undefined;

  try {
    await verifySecretKey(secretKey);
  } catch {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const now = new Date();
  const db = getDb();

  const result = await db.collection('memoryTunnel').insertOne({
    ...body,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({
    insertedId: result.insertedId,
  });
}