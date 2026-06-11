import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET – return all signature wall entries (newest first)
export async function GET() {
  try {
    const db = await getDb();
    const items = await db
      .collection('signatureWall')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json(items);
  } catch (err) {
    console.error('[signatureWall GET]', err);
    return NextResponse.json({ error: 'Failed to fetch signatures' }, { status: 500 });
  }
}

// POST – verify submissionKey against students collection, then save
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { submissionKey, message } = body;

    if (!submissionKey || !message) {
      return NextResponse.json(
        { error: 'submissionKey and message are required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Verify the submissionKey belongs to a registered student
    const student = await db
      .collection('students')
      .findOne({ submissionKey });

    if (!student) {
      return NextResponse.json(
        { error: 'Invalid secret key. Only registered students can sign the wall.' },
        { status: 403 }
      );
    }

    const now = new Date();

    // Upsert: one signature per student (overwrite if they post again)
    await db.collection('signatureWall').updateOne(
      { studentId: student._id.toString() },
      {
        $set: {
          studentId: student._id.toString(),
          studentName: student.name,
          message,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    // Return the saved entry
    const saved = await db
      .collection('signatureWall')
      .findOne({ studentId: student._id.toString() });

    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    console.error('[signatureWall POST]', err);
    return NextResponse.json({ error: 'Failed to save signature' }, { status: 500 });
  }
}

// DELETE – admin only (uses x-admin-key header)
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
    await db.collection('signatureWall').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[signatureWall DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
