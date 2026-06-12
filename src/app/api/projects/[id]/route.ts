import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, description, cover_image, year, sort_order } = await req.json();
  const db = getDb();
  db.prepare(
    'UPDATE projects SET title=?, description=?, cover_image=?, year=?, sort_order=? WHERE id=?'
  ).run(title, description ?? '', cover_image ?? '', year ?? null, sort_order ?? 0, params.id);

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  db.prepare('DELETE FROM projects WHERE id=?').run(params.id);
  return NextResponse.json({ ok: true });
}
