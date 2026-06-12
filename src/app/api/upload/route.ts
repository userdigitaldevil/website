import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getSession } from '@/lib/auth';

const ALLOWED_FOLDERS = ['splash', 'music', 'content'];
const ALLOWED_EXTS: Record<string, string[]> = {
  splash:  ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'mp4', 'mov', 'webm'],
  music:   ['mp3', 'm4a', 'wav', 'aac', 'ogg'],
  content: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'],
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const fd = await req.formData();
  const file = fd.get('file') as File | null;
  const folder = fd.get('folder') as string | null;

  if (!file || !folder || !ALLOWED_FOLDERS.includes(folder)) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ext || !ALLOWED_EXTS[folder].includes(ext)) {
    return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
  await mkdir(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const bytes = await file.arrayBuffer();
  await writeFile(path.join(uploadDir, filename), Buffer.from(bytes));

  return NextResponse.json({ filename });
}
