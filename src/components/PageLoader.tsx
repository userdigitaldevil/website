'use client';
import { useEffect, useState, useRef } from 'react';

const DURATION = 1800; // total ms for counter to run
const HOLD = 200;      // ms to hold at 100 before sliding out

export default function PageLoader() {
  const [count, setCount] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [done, setDone] = useState(false);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Only play once per session
    if (sessionStorage.getItem('loader-shown')) {
      setDone(true);
      return;
    }

    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / DURATION, 1);
      // Ease out expo feel
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * 100));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(100);
        setTimeout(() => {
          setSliding(true);
          setTimeout(() => {
            setDone(true);
            sessionStorage.setItem('loader-shown', '1');
          }, 700);
        }, HOLD);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (done) return null;

  return (
    <div className={`loader-overlay${sliding ? ' loader-slide-out' : ''}`}>
      <div className="loader-content">
        <span className="loader-initials">SA</span>
        <span className="loader-counter">{String(count).padStart(2, '0')}</span>
      </div>
      <div className="loader-bar">
        <div className="loader-bar-fill" style={{ width: `${count}%` }} />
      </div>
    </div>
  );
}
