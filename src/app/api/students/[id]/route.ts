// src/app/api/students/[id]/route.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifySecretKey } from '@/lib/secretKeyAuth';
import { ObjectId } from 'mongodb';

function isObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('UPDATE ID:', id);

  try {
    const updates = await request.json();
    const db = await getDb();
    const now = new Date();

    const submissionKey = updates.submissionKey;
    let isAdmin = false;

    if (!submissionKey) {
      const secretKey = request.headers.get('x-secret-key') || undefined;
      try {
        await verifySecretKey(secretKey);
        isAdmin = true;
      } catch {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    const query: Record<string, unknown> = isObjectId(id) ? { _id: new ObjectId(id) } : { id };

    if (submissionKey && !isAdmin) {
      const student = await db.collection('students').findOne({ submissionKey });
      if (!student) {
        return NextResponse.json({ error: 'Invalid submission key' }, { status: 403 });
      }
      
      if (student.id !== id && student._id.toString() !== id) {
        return NextResponse.json({ error: 'Submission key does not match this student' }, { status: 403 });
      }

      const allowedUpdates = {
        messageToBatch: updates.messageToBatch,
        favouriteMemory: updates.favouriteMemory,
        bestFriend: updates.bestFriend,
        birthday: updates.birthday,
        updatedAt: now
      };

      const result = await db.collection('students').updateOne(query, { $set: allowedUpdates });
      return NextResponse.json({ success: result.modifiedCount > 0 });
    }

    if (isAdmin) {
      const result = await db.collection('students').updateOne(
        query,
        { $set: { ...updates, updatedAt: now } }
      );
      return NextResponse.json({ success: result.modifiedCount > 0 });
    }
  } catch (err) {
    console.error('[students PUT]', err);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

/** Delete a student */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('DELETE ID:', id);

  const secretKey = request.headers.get('x-secret-key') || undefined;
  try {
    await verifySecretKey(secretKey);
  } catch {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const db = await getDb();
    let result;

    if (isObjectId(id)) {
      result = await db.collection('students').deleteOne({ _id: new ObjectId(id) });
    } else {
      result = await db.collection('students').deleteOne({ id });
    }

    return NextResponse.json({ success: result.deletedCount > 0 });
  } catch (err) {
    console.error('[students DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}