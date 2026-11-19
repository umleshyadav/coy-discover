import { NextResponse } from 'next/server';
import { resetDemo } from '../../lib/store.mjs';

export const dynamic = 'force-dynamic';

// Demo-only: wipes swipes and matches so the feed can be replayed.
export function POST() {
  resetDemo();
  return NextResponse.json({ ok: true });
}
