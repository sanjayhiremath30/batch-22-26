import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET – return all time capsules (newest first)
export async function GET() {
  try {
    const db = await getDb();
    const items = await db
      .collection('timeCapsules')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json(items);
  } catch (err) {
    console.error('[timeCapsules GET]', err);
    return NextResponse.json({ error: 'Failed to fetch capsules' }, { status: 500 });
  }
}

// POST – verify submissionKey, then save capsule
// Body: { submissionKey, message, revealDate }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { submissionKey, message, revealDate } = body;

    if (!submissionKey || !message || !revealDate) {
      return NextResponse.json(
        { error: 'submissionKey, message, and revealDate are required' },
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
        { error: 'Invalid secret key. Only registered students can post capsules.' },
        { status: 403 }
      );
    }

    const now = new Date();

    // Upsert: one capsule per student
    await db.collection('timeCapsules').updateOne(
      { studentId: student._id.toString() },
      {
        $set: {
          studentId: student._id.toString(),
          author: student.name,
          message,
          revealDate,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    const saved = await db
      .collection('timeCapsules')
      .findOne({ studentId: student._id.toString() });

    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    console.error('[timeCapsules POST]', err);
    return NextResponse.json({ error: 'Failed to save capsule' }, { status: 500 });
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
    await db.collection('timeCapsules').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[timeCapsules DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
