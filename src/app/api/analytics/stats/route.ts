import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();

  const total = (db.prepare('SELECT COUNT(*) as n FROM page_views').get() as { n: number }).n;
  const last7 = (db.prepare("SELECT COUNT(*) as n FROM page_views WHERE created_at >= datetime('now', '-7 days')").get() as { n: number }).n;
  const last30 = (db.prepare("SELECT COUNT(*) as n FROM page_views WHERE created_at >= datetime('now', '-30 days')").get() as { n: number }).n;

  const topPages = db.prepare(`
    SELECT path, COUNT(*) as views
    FROM page_views
    GROUP BY path
    ORDER BY views DESC
    LIMIT 10
  `).all() as { path: string; views: number }[];

  const topReferrers = db.prepare(`
    SELECT referrer, COUNT(*) as views
    FROM page_views
    WHERE referrer IS NOT NULL AND referrer != ''
    GROUP BY referrer
    ORDER BY views DESC
    LIMIT 8
  `).all() as { referrer: string; views: number }[];

  const daily = db.prepare(`
    SELECT date(created_at) as day, COUNT(*) as views
    FROM page_views
    WHERE created_at >= datetime('now', '-30 days')
    GROUP BY date(created_at)
    ORDER BY day ASC
  `).all() as { day: string; views: number }[];

  return NextResponse.json({ total, last7, last30, topPages, topReferrers, daily });
}
