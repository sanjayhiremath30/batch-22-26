import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminKey = request.headers.get('x-admin-key');
  if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'Sanjay@04') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const { ObjectId } = await import('mongodb');
    await db.collection('memoryTunnel').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[memoryTunnel DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 });
  }
}
