import { getCachedContent } from '@/lib/content';
import Timecode from '@/components/Timecode';
import Nav from '@/components/Nav';

export default async function BioPage() {
  const content = await getCachedContent();
  const get = (k: string) => content[k] ?? '';

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
