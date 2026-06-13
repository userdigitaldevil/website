'use client';
import { useState } from 'react';

export default function ZoomImage({ src, alt = '', className }: { src: string; alt?: string; className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img src={src} alt={alt} className={className} loading="lazy" onClick={() => setOpen(true)} style={{ cursor: 'zoom-in' }} />
      {open && (
        <div className="lightbox" onClick={() => setOpen(false)}>
          <button className="lightbox-close" onClick={() => setOpen(false)}>×</button>
          <img src={src} alt={alt} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
