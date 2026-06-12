'use client';
import { useEffect, useState } from 'react';

function pad(n: number, len = 2) {
  return String(n).padStart(len, '0');
}

function getTimecode() {
  const now = new Date();
  let h = now.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const m = now.getMinutes();
  const cs = Math.floor(now.getMilliseconds() / 10);
  return `${pad(h)}:${pad(m)}:${pad(cs)}${ampm}`;
}

export default function Timecode({ siteName, variant = 'fixed' }: { siteName: string; variant?: 'fixed' | 'inline' }) {
  const [code, setCode] = useState('');
  const [glitch, setGlitch] = useState(true);

  useEffect(() => {
    setCode(getTimecode());
    const id = setInterval(() => setCode(getTimecode()), 40);
    // Remove glitch class after animation completes
    const off = setTimeout(() => setGlitch(false), 700);
    return () => { clearInterval(id); clearTimeout(off); };
  }, []);

  const nameEl = (
    <span className={glitch ? 'site-name glitch-load' : 'site-name'}>{siteName}</span>
  );

  if (variant === 'inline') {
    return <span className="splash-timecode">{nameEl} {code}</span>;
  }

  return <div className="timecode">{nameEl} {code}</div>;
}
