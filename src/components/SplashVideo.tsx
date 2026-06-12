'use client';
import { useEffect, useRef } from 'react';

export default function SplashVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const tryPlay = () => {
      video.play().catch(() => {});
    };

    tryPlay();

    // Fallback: play on first user interaction (required by some mobile browsers)
    const onInteraction = () => {
      tryPlay();
      document.removeEventListener('touchstart', onInteraction);
      document.removeEventListener('click', onInteraction);
    };

    document.addEventListener('touchstart', onInteraction, { passive: true });
    document.addEventListener('click', onInteraction);

    return () => {
      document.removeEventListener('touchstart', onInteraction);
      document.removeEventListener('click', onInteraction);
    };
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  );
}
