'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function formatDate(d: Date) {
  const day = DAYS[d.getDay()];
  const date = String(d.getDate()).padStart(2, '0');
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${day} ${date} ${month} ${year} — ${h}:${m}:${s}`;
}

export default function SiteFooter() {
  const pathname = usePathname();
  const [label, setLabel] = useState('');

  useEffect(() => {
    setLabel(formatDate(new Date()));
    const id = setInterval(() => setLabel(formatDate(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  if (pathname.startsWith('/admin')) return null;

  return (
    <div className="site-footer-date">{label}</div>
  );
}
