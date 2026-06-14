import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const awardId = searchParams.get('awardId');
  if (!awardId) {
    return NextResponse.json({ error: 'awardId is required' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const votes = await db.collection('votes').find({ awardId }).toArray();
    
    // Aggregate votes: { [candidateId]: count }
    const counts: Record<string, number> = {};
    for (const vote of votes) {
      counts[vote.candidateId] = (counts[vote.candidateId] || 0) + 1;
    }
    
    // Convert to array and sort
    const leaderboard = Object.entries(counts)
      .map(([candidateId, count]) => ({ candidateId, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json(leaderboard);
  } catch (err) {
    console.error('[votes GET]', err);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { awardId, candidateId, submissionKey } = body;
    
    if (!awardId || !candidateId || !submissionKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    
    // Find voter by submissionKey
    const voter = await db.collection('students').findOne({ submissionKey });
    if (!voter) {
      return NextResponse.json({ error: 'Invalid submission key' }, { status: 401 });
    }

    // A student can't vote for themselves
    if (voter.id === candidateId || voter._id?.toString() === candidateId) {
      return NextResponse.json({ error: 'You cannot vote for yourself' }, { status: 403 });
    }

    // Check if voter already voted for this award
    const voterId = voter.id || voter._id?.toString();
    const existingVote = await db.collection('votes').findOne({
      awardId,
      voterId
    });

    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted for this category' }, { status: 403 });
    }

    // Insert vote
    await db.collection('votes').insertOne({
      awardId,
      candidateId,
      voterId,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[votes POST]', err);
    return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');
    const awardId = searchParams.get('awardId') || 'batch-favorite';
    
    // Admin verification
    // Since admin/page.tsx doesn't use headers for DELETE in the other ones, wait - 
    // Wait, the other APIs in this codebase for admin DELETE use `x-secret-key` header (e.g., student delete, memories delete).
    const secretKey = request.headers.get('x-secret-key');
    if (!secretKey) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { verifySecretKey } = await import('@/lib/secretKeyAuth');
    try {
      await verifySecretKey(secretKey);
    } catch {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!candidateId) {
      return NextResponse.json({ error: 'Missing candidateId' }, { status: 400 });
    }

    const db = await getDb();
    
    // Find one vote and delete it
    const voteToDelete = await db.collection('votes').findOne({ candidateId, awardId });
    if (!voteToDelete) {
      return NextResponse.json({ error: 'No votes found for this candidate' }, { status: 404 });
    }

    await db.collection('votes').deleteOne({ _id: voteToDelete._id });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[votes DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete vote' }, { status: 500 });
  }
}
