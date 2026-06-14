import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifySecretKey } from '@/lib/secretKeyAuth';
import { ObjectId } from 'mongodb';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const secretKey = request.headers.get('x-secret-key') || undefined;

  try {
    await verifySecretKey(secretKey);
  } catch {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const db = await getDb();
    const result = await db.collection('best_memories').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return new NextResponse('Memory not found', { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('[memories DELETE]', err);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
