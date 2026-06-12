'use client';
import { useCallback, useRef, useState } from 'react';

const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIAERESIS = '̈';

function ShuffleLetter({ char }: { char: string }) {
  const [display, setDisplay] = useState(char);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const onEnter = useCallback(() => {
    if (char === ' ' || char === '+' || char === '-') return;
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      const r = POOL[Math.floor(Math.random() * POOL.length)];
      setDisplay(r + DIAERESIS);
    }, 50);
  }, [char]);

  const onLeave = useCallback(() => {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
    setDisplay(char);
  }, [char]);

  return (
    <span
      style={{ display: 'inline-block' }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {display}
    </span>
  );
}

export default function GlyphText({ text }: { text: string }) {
  return (
    <>
      {text.split('').map((char, i) => (
        <ShuffleLetter key={i} char={char} />
      ))}
    </>
  );
}
