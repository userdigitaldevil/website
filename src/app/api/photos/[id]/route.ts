import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(Number(id)) as any;
  if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    await unlink(path.join(process.cwd(), 'data', 'uploads', 'photos', photo.filename));
  } catch {}

  db.prepare('DELETE FROM photos WHERE id = ?').run(Number(id));
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const db = getDb();

  const allowed = ['category', 'year', 'sort_order'];
  for (const key of allowed) {
    if (key in body) {
      db.prepare(`UPDATE photos SET ${key} = ? WHERE id = ?`).run(body[key], Number(id));
    }
  }
  return NextResponse.json({ ok: true });
}
