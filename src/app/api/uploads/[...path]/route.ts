import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  gif: 'image/gif', webp: 'image/webp', avif: 'image/avif',
  mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm',
  mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav',
  aac: 'audio/aac', ogg: 'audio/ogg',
};

export async function GET(_: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
  const filePath = path.resolve(uploadsDir, ...parts);

  if (!filePath.startsWith(uploadsDir + path.sep) && filePath !== uploadsDir) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const file = await readFile(filePath);
    const ext = parts[parts.length - 1].split('.').pop()?.toLowerCase() ?? '';
    const contentType = MIME[ext] ?? 'application/octet-stream';
    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}
