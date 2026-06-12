import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const BOT_RE = /bot|crawl|spider|slurp|mediapartners|facebookexternalhit|lighthouse|headless/i;

export async function POST(req: NextRequest) {
  const ua = req.headers.get('user-agent') ?? '';
  if (BOT_RE.test(ua)) return NextResponse.json({ ok: true });

  const body = await req.json().catch(() => null);
  const path = typeof body?.path === 'string' ? body.path.slice(0, 255) : null;
  if (!path || path.startsWith('/admin') || path.startsWith('/api')) {
    return NextResponse.json({ ok: true });
  }

  const referrer = typeof body?.referrer === 'string' ? body.referrer.slice(0, 512) : null;
  getDb().prepare('INSERT INTO page_views (path, referrer) VALUES (?, ?)').run(path, referrer || null);
  return NextResponse.json({ ok: true });
}
