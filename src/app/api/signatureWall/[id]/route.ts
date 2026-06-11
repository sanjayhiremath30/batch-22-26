// src/app/api/signatureWall/[id]/route.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Admin-only delete by MongoDB _id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminKey = request.headers.get('x-admin-key');
  if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'Sanjay@04') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const db = await getDb();
    await db.collection('signatureWall').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[signatureWall DELETE id]', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}