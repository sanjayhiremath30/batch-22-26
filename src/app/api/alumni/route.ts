import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET – return all alumni entries (newest first)
export async function GET() {
  try {
    const db = await getDb();
    const items = await db
      .collection('alumni')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json(items);
  } catch (err) {
    console.error('[alumni GET]', err);
    return NextResponse.json({ error: 'Failed to fetch alumni' }, { status: 500 });
  }
}

// POST – verify submissionKey, then save/upsert alumni record
// Body: { submissionKey, role, company, location, linkedin, website }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { submissionKey, role, company, location, linkedin, website } = body;

    if (!submissionKey || !role || !company || !location) {
      return NextResponse.json(
        { error: 'submissionKey, role, company, and location are required' },
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
        { error: 'Invalid secret key. Only registered students can post alumni details.' },
        { status: 403 }
      );
    }

    const now = new Date();

    // Upsert: one alumni record per student
    await db.collection('alumni').updateOne(
      { studentId: student._id.toString() },
      {
        $set: {
          studentId: student._id.toString(),
          name: student.name,
          photoUrl: student.photoUrl || '',
          role,
          company,
          location,
          linkedin: linkedin || '',
          website: website || '',
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    const saved = await db
      .collection('alumni')
      .findOne({ studentId: student._id.toString() });

    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    console.error('[alumni POST]', err);
    return NextResponse.json({ error: 'Failed to save alumni details' }, { status: 500 });
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
    await db.collection('alumni').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[alumni DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
