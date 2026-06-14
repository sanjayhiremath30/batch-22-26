import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const memories = await db.collection('best_memories').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(memories);
  } catch (err) {
    console.error('[memories GET]', err);
    return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const secretKey = request.headers.get('x-secret-key') || '';
  if (!secretKey) {
    return new NextResponse('Unauthorized: Missing submission key', { status: 401 });
  }

  try {
    const db = await getDb();
    
    // Validate submissionKey
    const student = await db.collection('students').findOne({ submissionKey: secretKey });
    if (!student) {
      return new NextResponse('Unauthorized: Invalid submission key', { status: 401 });
    }

    const body = await request.json();
    const now = new Date();
    
    const result = await db.collection('best_memories').insertOne({ 
      ...body, 
      studentId: student._id.toString(), // Store reference to student
      createdAt: now 
    });
    
    return NextResponse.json({ insertedId: result.insertedId });
  } catch (err) {
    console.error('[memories POST]', err);
    return NextResponse.json({ error: 'Failed to add memory' }, { status: 500 });
  }
}
