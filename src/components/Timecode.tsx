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

  useEffect(() => {
    setCode(getTimecode());
    const id = setInterval(() => setCode(getTimecode()), 40);
    return () => clearInterval(id);
  }, []);

  if (variant === 'inline') {
    return <span className="splash-timecode">{siteName} {code}</span>;
  }

  return <div className="timecode">{siteName} {code}</div>;
}
