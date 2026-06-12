import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const projects = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC, id DESC').all();
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, description, cover_image, year } = await req.json();
  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO projects (title, description, cover_image, year) VALUES (?, ?, ?, ?)'
  ).run(title, description ?? '', cover_image ?? '', year ?? null);

  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}
