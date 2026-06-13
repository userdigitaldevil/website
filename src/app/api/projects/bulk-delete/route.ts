import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const ids = body?.ids;
  if (!Array.isArray(ids) || !ids.every(id => Number.isInteger(id))) {
    return NextResponse.json({ error: 'Invalid ids' }, { status: 400 });
  }

  const db = getDb();
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`DELETE FROM projects WHERE id IN (${placeholders})`).run(...ids);

  return NextResponse.json({ ok: true, deleted: ids.length });
}
