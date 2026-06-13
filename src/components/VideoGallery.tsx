'use client';
import { useState } from 'react';
import type { Video } from '@/lib/db';
import VideoPlayer from '@/components/VideoPlayer';

function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function VideoItem({ video: v }: { video: Video }) {
  const ytId = v.youtube_url ? youtubeId(v.youtube_url) : null;
  if (ytId) return <VideoPlayer ytId={ytId} title={v.title} />;
  if (v.filename) {
    return (
      <div className="video-item">
        <div className="video-embed">
          <video autoPlay muted loop playsInline controls src={`/api/uploads/videos/${v.filename}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        {v.title && <p className="video-title">{v.title}</p>}
      </div>
    );
  }
  return null;
}

export default function VideoGallery({ videos }: { videos: Video[] }) {
  const [activeYear, setActiveYear] = useState<number | 'all'>('all');

  const years = [...new Set(videos.map(v => v.year).filter((y): y is number => y != null))].sort((a, b) => b - a);
  const visibleYears = activeYear === 'all' ? years : years.filter(y => y === activeYear);
  const undated = activeYear === 'all' ? videos.filter(v => v.year == null) : [];

  return (
    <div className="gallery-wrap">
      {years.length > 1 && (
        <div className="year-filter">
          <button
            className={`year-filter-btn${activeYear === 'all' ? ' active' : ''}`}
            onClick={() => setActiveYear('all')}
          >
            ALL
          </button>
          {years.map(y => (
            <button
              key={y}
              className={`year-filter-btn${activeYear === y ? ' active' : ''}`}
              onClick={() => setActiveYear(y)}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {visibleYears.map(year => (
        <div key={year}>
          {activeYear === 'all' && years.length > 1 && <p className="year-label">{year}</p>}
          <div className="video-grid">
            {videos.filter(v => v.year === year).map(v => <VideoItem key={v.id} video={v} />)}
          </div>
        </div>
      ))}

      {undated.length > 0 && (
        <div className="video-grid">
          {undated.map(v => <VideoItem key={v.id} video={v} />)}
        </div>
      )}
    </div>
  );
}
