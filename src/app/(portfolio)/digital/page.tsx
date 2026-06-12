import { getDb, type Photo } from '@/lib/db';
import Gallery from '@/components/Gallery';

export const dynamic = 'force-dynamic';

export default function DigitalPage() {
  const photos = getDb().prepare('SELECT * FROM photos WHERE category=? ORDER BY year DESC, sort_order ASC, id DESC').all('digital') as Photo[];

  const byYear: Record<number, Photo[]> = {};
  for (const p of photos) {
    if (!byYear[p.year]) byYear[p.year] = [];
    byYear[p.year].push(p);
  }

  return <Gallery photosByYear={byYear} />;
}
