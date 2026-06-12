import { getDb } from '@/lib/db';
import Timecode from '@/components/Timecode';
import Nav from '@/components/Nav';

export const dynamic = 'force-dynamic';

export default function MenuPage() {
  const db = getDb();
  const name = (db.prepare('SELECT value FROM content WHERE key=?').get('site_name') as any)?.value ?? 'YOUR NAME';

  return (
    <>
      <header className="page-header">
        <Timecode siteName={name} />
        <Nav />
      </header>
    </>
  );
}
