import { getDb, type Photo } from '@/lib/db';
import Timecode from '@/components/Timecode';
import Nav from '@/components/Nav';
import Gallery from '@/components/Gallery';

export const dynamic = 'force-dynamic';

export default function Page() {
  const db = getDb();
  const name = (db.prepare('SELECT value FROM content WHERE key=?').get('site_name') as any)?.value ?? 'YOUR NAME';
  const photos = db.prepare('SELECT * FROM photos WHERE category=? ORDER BY year DESC, sort_order ASC, id DESC').all('iphone') as Photo[];

  const byYear: Record<number, Photo[]> = {};
  for (const p of photos) {
    if (!byYear[p.year]) byYear[p.year] = [];
    byYear[p.year].push(p);
  }

  return (
    <>
      <header className="page-header">
        <Timecode siteName={name} />
        <Nav />
      </header>
      <Gallery photosByYear={byYear} />
    </>
  );
}
