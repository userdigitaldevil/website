import { getDb, type Video } from '@/lib/db';
import VideoGallery from '@/components/VideoGallery';

export const dynamic = 'force-dynamic';

export default function VideosPage() {
  const videos = getDb().prepare('SELECT * FROM videos ORDER BY sort_order ASC, id DESC').all() as Video[];

  return <VideoGallery videos={videos} />;
}
