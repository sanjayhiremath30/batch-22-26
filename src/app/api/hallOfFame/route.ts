import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET – return all Hall of Fame nominations (newest first)
export async function GET() {
  try {
    const db = await getDb();
    const items = await db
      .collection('hallOfFame')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json(items);
  } catch (err) {
    console.error('[hallOfFame GET]', err);
    return NextResponse.json({ error: 'Failed to fetch Hall of Fame' }, { status: 500 });
  }
}

// POST – verify submissionKey, then save nomination
// Body: { submissionKey, nomineeId, title }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { submissionKey, nomineeId, title } = body;

    if (!submissionKey || !nomineeId || !title) {
      return NextResponse.json(
        { error: 'submissionKey, nomineeId, and title are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const { ObjectId } = await import('mongodb');

    // Verify nominator
    const nominator = await db
      .collection('students')
      .findOne({ submissionKey });

    if (!nominator) {
      return NextResponse.json(
        { error: 'Invalid secret key. Only registered students can nominate.' },
        { status: 403 }
      );
    }

    // Resolve nominee by id
    let nomineeQuery: Record<string, unknown>;
    try {
      nomineeQuery = { _id: new ObjectId(nomineeId) };
    } catch {
      nomineeQuery = { id: nomineeId };
    }
    const nominee = await db.collection('students').findOne(nomineeQuery);
    if (!nominee) {
      return NextResponse.json({ error: 'Nominee not found' }, { status: 404 });
    }

    const now = new Date();

    const result = await db.collection('hallOfFame').insertOne({
      nominatorId: nominator._id.toString(),
      nominatorName: nominator.name,
      nomineeId: nominee._id.toString(),
      nomineeName: nominee.name,
      nomineePhotoUrl: nominee.photoUrl || '',
      title,
      createdAt: now,
    });

    const saved = await db
      .collection('hallOfFame')
      .findOne({ _id: result.insertedId });

    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    console.error('[hallOfFame POST]', err);
    return NextResponse.json({ error: 'Failed to save nomination' }, { status: 500 });
  }
}

// DELETE – admin only
export async function DELETE(request: Request) {
  const adminKey = request.headers.get('x-admin-key');
  if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'Sanjay@04') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const db = await getDb();
    const { ObjectId } = await import('mongodb');
    await db.collection('hallOfFame').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[hallOfFame DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
