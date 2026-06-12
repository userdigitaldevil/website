import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  return new TextEncoder().encode(s || 'dev-secret-change-in-production');
}

export async function signToken(payload: { userId: number; username: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { userId: number; username: string };
  } catch {
    return null;
  }
}

export async function getSession() {
  const jar = await cookies();
  const token = jar.get('admin_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
