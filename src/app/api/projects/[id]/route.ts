import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { title, description, cover_image, year, sort_order } = await req.json();
  const db = getDb();
  db.prepare(
    'UPDATE projects SET title=?, description=?, cover_image=?, year=?, sort_order=? WHERE id=?'
  ).run(title, description ?? '', cover_image ?? '', year ?? null, sort_order ?? 0, id);

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  db.prepare('DELETE FROM projects WHERE id=?').run(id);
  return NextResponse.json({ ok: true });
}
