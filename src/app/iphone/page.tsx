import { getDb, type Photo } from '@/lib/db';
import { getCachedContent } from '@/lib/content';
import Timecode from '@/components/Timecode';
import Nav from '@/components/Nav';
import Gallery from '@/components/Gallery';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [content, photos] = await Promise.all([
    getCachedContent(),
    Promise.resolve(getDb().prepare('SELECT * FROM photos WHERE category=? ORDER BY year DESC, sort_order ASC, id DESC').all('iphone') as Photo[]),
  ]);
  const name = content['site_name'] ?? 'YOUR NAME';

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
