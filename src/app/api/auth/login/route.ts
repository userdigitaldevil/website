import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { signToken } from '@/lib/auth';

// In-memory rate limiter: max 5 attempts per IP per 10 minutes
const attempts = new Map<string, { count: number; until: number }>();

function getIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
}

function isRateLimited(ip: string): boolean {
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'unknown') return false;
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.until) return false;
  return entry.count >= 5;
}

function recordFailure(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.until) {
    attempts.set(ip, { count: 1, until: now + 10 * 60 * 1000 });
  } else {
    entry.count += 1;
  }
}

function clearFailures(ip: string) {
  attempts.delete(ip);
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many failed attempts. Try again in 10 minutes.' },
      { status: 429 }
    );
  }

  const { username, password } = await req.json();
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as
    | { id: number; username: string; password_hash: string }
    | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    recordFailure(ip);
    const entry = attempts.get(ip);
    const remaining = 5 - (entry?.count ?? 0);
    return NextResponse.json(
      { error: remaining > 0 ? `Invalid credentials (${remaining} attempts left)` : 'Too many failed attempts. Try again in 10 minutes.' },
      { status: 401 }
    );
  }

  clearFailures(ip);
  const token = await signToken({ userId: user.id, username: user.username });
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}
