import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { AWARD_CATEGORIES } from '@/types/voting';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const candidateId = params.id;
    const db = await getDb();
    
    // Fetch all votes for this candidate
    const candidateVotes = await db.collection('votes').find({ candidateId }).toArray();
    
    const totalVotes = candidateVotes.length;
    
    // Group votes by awardId
    const votesByAward: Record<string, number> = {};
    for (const vote of candidateVotes) {
      votesByAward[vote.awardId] = (votesByAward[vote.awardId] || 0) + 1;
    }

    // Now determine the rank for each award the candidate has votes in.
    // To do this properly, we need to know the leaderboard for those specific awards.
    const badges: any[] = [];
    
    for (const awardId of Object.keys(votesByAward)) {
      // Get all votes for this award to find the rank
      const allAwardVotes = await db.collection('votes').find({ awardId }).toArray();
      const counts: Record<string, number> = {};
      for (const vote of allAwardVotes) {
        counts[vote.candidateId] = (counts[vote.candidateId] || 0) + 1;
      }
      
      const leaderboard = Object.entries(counts)
        .map(([cId, count]) => ({ candidateId: cId, count }))
        .sort((a, b) => b.count - a.count);
        
      const rankIndex = leaderboard.findIndex(entry => entry.candidateId === candidateId);
      const rank = rankIndex + 1;
      
      if (rank <= 3 && rank > 0) {
        const award = AWARD_CATEGORIES.find(a => a.id === awardId);
        if (award) {
          badges.push({
            awardId,
            awardTitle: award.title,
            rank,
            votes: votesByAward[awardId]
          });
        }
      }
    }

    // Overall current rank (based on total votes among all students)
    // To do this, we need total votes for everyone
    const allVotes = await db.collection('votes').find({}).toArray();
    const globalCounts: Record<string, number> = {};
    for (const vote of allVotes) {
      globalCounts[vote.candidateId] = (globalCounts[vote.candidateId] || 0) + 1;
    }
    const globalLeaderboard = Object.entries(globalCounts)
      .map(([cId, count]) => ({ candidateId: cId, count }))
      .sort((a, b) => b.count - a.count);
      
    const globalRankIndex = globalLeaderboard.findIndex(entry => entry.candidateId === candidateId);
    const currentRank = globalRankIndex >= 0 ? globalRankIndex + 1 : null;

    return NextResponse.json({
      totalVotes,
      currentRank,
      badges
    });

  } catch (err) {
    console.error('[student votes GET]', err);
    return NextResponse.json({ error: 'Failed to fetch student votes' }, { status: 500 });
  }
}
