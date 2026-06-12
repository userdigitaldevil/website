'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -200, y: -200 });
  const lerped = useRef({ x: -200, y: -200 });
  const rafRef = useRef<number>(0);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.body.classList.add('cursor-active');

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    const onEnter = () => {
      dot.classList.add('cursor-hover');
      ring.classList.add('cursor-hover');
    };
    const onLeave = () => {
      dot.classList.remove('cursor-hover');
      ring.classList.remove('cursor-hover');
    };

    const bindHover = () => {
      document.querySelectorAll<HTMLElement>('a, button').forEach(el => {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
    };
    bindHover();

    // Re-bind after any navigation (SPA route changes add new links)
    const observer = new MutationObserver(bindHover);
    observer.observe(document.body, { childList: true, subtree: true });

    const tick = () => {
      lerped.current.x += (mouse.current.x - lerped.current.x) * 0.1;
      lerped.current.y += (mouse.current.y - lerped.current.y) * 0.1;

      // Dot: instant response via left/top
      dot.style.left = `${mouse.current.x - 4}px`;
      dot.style.top = `${mouse.current.y - 4}px`;

      // Ring: smooth lag via transform
      ring.style.transform = `translate(${lerped.current.x}px, ${lerped.current.y}px)`;

      rafRef.current = requestAnimationFrame(tick);
    };

    document.addEventListener('mousemove', onMove);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      document.body.classList.remove('cursor-active');
      document.querySelectorAll<HTMLElement>('a, button').forEach(el => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
    };
  }, [pathname]);

  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}
