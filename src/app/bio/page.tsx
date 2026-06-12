import { getDb } from '@/lib/db';
import Timecode from '@/components/Timecode';
import Nav from '@/components/Nav';

export const dynamic = 'force-dynamic';

export default function BioPage() {
  const db = getDb();
  const get = (key: string) => (db.prepare('SELECT value FROM content WHERE key=?').get(key) as any)?.value ?? '';

  const name = get('site_name');
  const bioText = get('bio_text');
  const bioPhoto = get('bio_photo');

  return (
    <>
      <header className="page-header">
        <Timecode siteName={name} />
        <Nav />
      </header>
      <div className="bio-content">
        {bioPhoto && (
          <div className="bio-photo">
            <img src={bioPhoto.startsWith('/') || bioPhoto.startsWith('http') ? bioPhoto : `/api/uploads/content/${bioPhoto}`} alt={name} />
          </div>
        )}
        {bioText && <p className="bio-text">{bioText}</p>}
      </div>
    </>
  );
}
