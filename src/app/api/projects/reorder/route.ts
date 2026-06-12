import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

// PUT /api/projects/reorder  body: { ids: number[] }
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const ids = body?.ids;
  if (!Array.isArray(ids) || !ids.every(id => Number.isInteger(id))) {
    return NextResponse.json({ error: 'Invalid ids' }, { status: 400 });
  }

  const db = getDb();
  const update = db.prepare('UPDATE projects SET sort_order = ? WHERE id = ?');
  const apply = db.transaction((list: number[]) => {
    list.forEach((id, index) => update.run(index, id));
  });
  apply(ids);

  return NextResponse.json({ ok: true });
}
