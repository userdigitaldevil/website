import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const db = getDb();
  const photos = db.prepare('SELECT * FROM photos ORDER BY year DESC, sort_order ASC, id DESC').all();
  return NextResponse.json(photos);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const fd = await req.formData();
  const files = fd.getAll('files') as File[];
  const category = fd.get('category') as string;
  const year = Number(fd.get('year'));

  if (!files.length || !category || !year) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const db = getDb();
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'photos');

  const ALLOWED_PHOTO_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];
  if (!['digital', 'iphone'].includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  const inserted: number[] = [];
  for (const file of files) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ext || !ALLOWED_PHOTO_EXTS.includes(ext)) {
      return NextResponse.json({ error: `File type not allowed: ${file.name}` }, { status: 400 });
    }
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bytes = await file.arrayBuffer();
    await writeFile(path.join(uploadDir, filename), Buffer.from(bytes));

    const result = db.prepare(
      'INSERT INTO photos (filename, original_name, category, year) VALUES (?, ?, ?, ?)'
    ).run(filename, file.name, category, year);
    inserted.push(result.lastInsertRowid as number);
  }

  return NextResponse.json({ inserted });
}
