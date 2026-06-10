// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // No authentication or DB work here – let the request continue.
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'], // Apply to API routes only if needed.
};
