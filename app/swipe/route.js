import { NextResponse } from 'next/server';
import { swipe, HttpError } from '../../lib/store.mjs';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const body = await req.json().catch(() => null);
  try {
    if (!body) throw new HttpError(400, 'invalid JSON body');
    return NextResponse.json(swipe(body.id, body.action));
  } catch (e) {
    if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
