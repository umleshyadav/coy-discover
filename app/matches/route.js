import { NextResponse } from 'next/server';
import { getMatches } from '../../lib/store.mjs';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({ matches: getMatches() });
}
