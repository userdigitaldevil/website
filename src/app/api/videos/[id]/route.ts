import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const db = getDb();
  if ('year' in body) {
    db.prepare('UPDATE videos SET year = ? WHERE id = ?').run(body.year ? Number(body.year) : null, Number(id));
  }
  if ('title' in body) {
    db.prepare('UPDATE videos SET title = ? WHERE id = ?').run(body.title || null, Number(id));
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  db.prepare('DELETE FROM videos WHERE id = ?').run(Number(id));
  return NextResponse.json({ ok: true });
}
