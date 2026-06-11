// src/app/api/signatureWall/stream/route.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const runtime = 'nodejs';

export async function GET() {
  const db = await getDb();
  const collection = db.collection('signatureWall');
  const changeStream = collection.watch([], { fullDocument: 'updateLookup' });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(': connected\n\n'));
      changeStream.on('change', (change) => {
        const data = JSON.stringify((change as any).fullDocument || {});
        const payload = `data: ${data}\n\n`;
        controller.enqueue(encoder.encode(payload));
      });
      changeStream.on('error', (err) => {
        controller.error(err);
      });
    },
    cancel() {
      changeStream.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
