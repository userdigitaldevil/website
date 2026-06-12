import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const db = getDb();
  const videos = db.prepare('SELECT * FROM videos ORDER BY sort_order ASC, id DESC').all();
  return NextResponse.json(videos);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, youtube_url, category } = await req.json();
  if (!category) return NextResponse.json({ error: 'Category required' }, { status: 400 });

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO videos (title, youtube_url, category) VALUES (?, ?, ?)'
  ).run(title || null, youtube_url || null, category);

  return NextResponse.json({ id: result.lastInsertRowid });
}
