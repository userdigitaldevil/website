import { getDb, type Video } from '@/lib/db';
import Timecode from '@/components/Timecode';
import Nav from '@/components/Nav';
import VideoPlayer from '@/components/VideoPlayer';

export const dynamic = 'force-dynamic';

function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function VideosPage() {
  const db = getDb();
  const name = (db.prepare('SELECT value FROM content WHERE key=?').get('site_name') as any)?.value ?? 'YOUR NAME';
  const videos = db.prepare('SELECT * FROM videos ORDER BY sort_order ASC, id DESC').all() as Video[];

  return (
    <>
      <header className="page-header">
        <Timecode siteName={name} />
        <Nav />
      </header>
      <div className="gallery-wrap">
        <div className="video-grid">
          {videos.map(v => {
            const ytId = v.youtube_url ? youtubeId(v.youtube_url) : null;
            if (ytId) {
              return <VideoPlayer key={v.id} ytId={ytId} title={v.title} />;
            }
            if (v.filename) {
              return (
                <div className="video-item" key={v.id}>
                  <div className="video-embed">
                    <video autoPlay muted loop playsInline controls src={`/api/uploads/videos/${v.filename}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  {v.title && <p className="video-title">{v.title}</p>}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </>
  );
}
