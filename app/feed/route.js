import { NextResponse } from 'next/server';
import { getFeed } from '../../lib/store.mjs';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({ profiles: getFeed() });
}
