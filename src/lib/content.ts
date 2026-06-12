import { unstable_cache } from 'next/cache';
import { getDb } from './db';

// Cache all content for 60s; invalidated immediately when admin saves
export const getCachedContent = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const db = getDb();
    const rows = db.prepare('SELECT key, value FROM content').all() as { key: string; value: string }[];
    const out: Record<string, string> = {};
    for (const r of rows) out[r.key] = r.value;
    return out;
  },
  ['site-content'],
  { revalidate: 60, tags: ['content'] }
);
