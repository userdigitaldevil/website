'use client';
import { useEffect, useState } from 'react';

export default function VideoPlayer({ ytId, title }: { ytId: string; title?: string | null }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    setSrc(
      `https://www.youtube.com/embed/${ytId}` +
      `?autoplay=1&mute=1&modestbranding=1&rel=0` +
      `&playsinline=1&loop=1&playlist=${ytId}` +
      `&origin=${encodeURIComponent(window.location.origin)}`
    );
  }, [ytId]);

  return (
    <div className="video-item">
      <div className="video-embed">
        {src && (
          <iframe
            src={src}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          />
        )}
      </div>
      {title && <p className="video-title">{title}</p>}
    </div>
  );
}
