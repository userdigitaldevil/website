import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

// PUT /api/photos/reorder  body: { ids: number[] }
// Writes sort_order = position for each id in a single transaction.
// `ids` is the full ordered list of photo ids within one (category, year) group.
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const ids = body?.ids;
  if (!Array.isArray(ids) || !ids.every(id => Number.isInteger(id))) {
    return NextResponse.json({ error: 'Invalid ids' }, { status: 400 });
  }

  const db = getDb();
  const update = db.prepare('UPDATE photos SET sort_order = ? WHERE id = ?');
  const apply = db.transaction((list: number[]) => {
    list.forEach((id, index) => update.run(index, id));
  });
  apply(ids);

  return NextResponse.json({ ok: true });
}
