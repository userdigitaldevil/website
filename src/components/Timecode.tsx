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

const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function useScrambleDecode(text: string, active: boolean) {
  // Start with real text to avoid SSR hydration mismatch
  const [chars, setChars] = useState<string[]>(() => text.split(''));

  useEffect(() => {
    if (!active || !text) return;
    const target = text.split('');
    let solved = 0;

    // Immediately scramble all letters
    setChars(target.map(() => POOL[Math.floor(Math.random() * POOL.length)]));

    const scrambleId = setInterval(() => {
      setChars(target.map((ch, i) =>
        i < solved ? ch : POOL[Math.floor(Math.random() * POOL.length)]
      ));
    }, 50);

    const solveNext = () => {
      solved++;
      if (solved >= target.length) {
        clearInterval(scrambleId);
        setChars(target);
      } else {
        setTimeout(solveNext, 120);
      }
    };

    const startId = setTimeout(solveNext, 300);

    return () => { clearInterval(scrambleId); clearTimeout(startId); };
  }, [text, active]);

  return chars;
}

export default function Timecode({ siteName, variant = 'fixed' }: { siteName: string; variant?: 'fixed' | 'inline' }) {
  const [code, setCode] = useState('');
  const decodedChars = useScrambleDecode(siteName, variant === 'inline');

  useEffect(() => {
    setCode(getTimecode());
    const id = setInterval(() => setCode(getTimecode()), 40);
    return () => clearInterval(id);
  }, []);

  if (variant === 'inline') {
    return (
      <span className="splash-timecode">
        {decodedChars.map((ch, i) => (
          <span key={i} style={{ display: 'inline-block' }}>{ch}</span>
        ))}
        {' '}{code}
      </span>
    );
  }

  return <div className="timecode">{siteName} {code}</div>;
}
