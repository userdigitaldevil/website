'use client';
import { useState } from 'react';
import type { Photo } from '@/lib/db';

export default function Gallery({ photosByYear }: { photosByYear: Record<number, Photo[]> }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<number | 'all'>('all');

  const years = Object.keys(photosByYear).map(Number).sort((a, b) => b - a);
  const visibleYears = activeYear === 'all' ? years : years.filter(y => y === activeYear);

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
          {activeYear === 'all' && <p className="year-label">{year}</p>}
          <div className="photo-grid">
            {photosByYear[year].map(photo => (
              <img
                key={photo.id}
                src={`/api/uploads/photos/${photo.filename}`}
                alt={photo.original_name || ''}
                loading="lazy"
                onClick={() => setLightbox(`/api/uploads/photos/${photo.filename}`)}
              />
            ))}
          </div>
        </div>
      ))}

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>×</button>
          <img src={lightbox} alt="" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
