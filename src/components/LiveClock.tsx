'use client';
import { useEffect, useState } from 'react';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function LiveClock() {
  const [t, setT] = useState('');

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setT(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return <span suppressHydrationWarning>{t || '00:00:00'}</span>;
}
