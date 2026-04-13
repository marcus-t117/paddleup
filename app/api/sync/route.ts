import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

// GET /api/sync?code=XXXX — load state from server
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code || code.length < 4) {
    return NextResponse.json({ error: 'Missing sync code' }, { status: 400 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
  }

  const data = await redis.get(`paddleup:${code.toUpperCase()}`);
  if (!data) {
    return NextResponse.json({ error: 'No data found for this code' }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PUT /api/sync — save state to server
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { code, data } = body;

  if (!code || code.length < 4) {
    return NextResponse.json({ error: 'Missing sync code' }, { status: 400 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
  }

  // Store with no expiry (persistent)
  await redis.set(`paddleup:${code.toUpperCase()}`, data);

  return NextResponse.json({ ok: true });
}
