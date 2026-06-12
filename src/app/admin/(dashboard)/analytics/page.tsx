'use client';
import { useState, useEffect } from 'react';

type Stats = {
  total: number;
  last7: number;
  last30: number;
  topPages: { path: string; views: number }[];
  topReferrers: { referrer: string; views: number }[];
  daily: { day: string; views: number }[];
};

export default function AdminAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/analytics/stats')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setStats)
      .catch(() => setError('Failed to load stats.'));
  }, []);

  if (error) return <p style={{ color: '#e55', fontSize: '0.8rem' }}>{error}</p>;
  if (!stats) return <p style={{ color: '#555', fontSize: '0.8rem' }}>Loading…</p>;

  const maxDaily = Math.max(...stats.daily.map(d => d.views), 1);
  const maxPage = Math.max(...stats.topPages.map(p => p.views), 1);
  const maxRef = Math.max(...stats.topReferrers.map(r => r.views), 1);

  // Fill last 30 days for the bar chart
  const today = new Date();
  const days30: { day: string; views: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = stats.daily.find(x => x.day === key);
    days30.push({ day: key, views: found?.views ?? 0 });
  }

  return (
    <>
      <p className="admin-section-title">Analytics</p>

      {/* Summary cards */}
      <div className="analytics-cards">
        <StatCard label="Total Views" value={stats.total} />
        <StatCard label="Last 7 Days" value={stats.last7} />
        <StatCard label="Last 30 Days" value={stats.last30} />
      </div>

      {/* Daily bar chart */}
      <p className="admin-section-title" style={{ marginTop: '2.5rem' }}>Views — Last 30 Days</p>
      <div className="analytics-bars">
        {days30.map(d => (
          <div key={d.day} className="analytics-bar-col" title={`${d.day}: ${d.views} views`}>
            <div
              className="analytics-bar-fill"
              style={{ height: `${Math.round((d.views / maxDaily) * 100)}%` }}
            />
            {d.day.slice(8) === '01' || d.day === days30[0].day || d.day === days30[days30.length - 1].day
              ? <span className="analytics-bar-label">{d.day.slice(5)}</span>
              : null}
          </div>
        ))}
      </div>

      <div className="analytics-tables">
        {/* Top pages */}
        <div>
          <p className="admin-section-title">Top Pages</p>
          <table className="admin-table">
            <thead><tr><th>Path</th><th style={{ textAlign: 'right' }}>Views</th><th style={{ width: 100 }}></th></tr></thead>
            <tbody>
              {stats.topPages.length === 0 && (
                <tr><td colSpan={3} style={{ color: '#444', fontStyle: 'italic' }}>No data yet.</td></tr>
              )}
              {stats.topPages.map(p => (
                <tr key={p.path}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{p.path}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{p.views}</td>
                  <td>
                    <div className="analytics-row-bar">
                      <div className="analytics-row-bar-fill" style={{ width: `${Math.round((p.views / maxPage) * 100)}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top referrers */}
        <div>
          <p className="admin-section-title">Top Referrers</p>
          <table className="admin-table">
            <thead><tr><th>Referrer</th><th style={{ textAlign: 'right' }}>Views</th><th style={{ width: 100 }}></th></tr></thead>
            <tbody>
              {stats.topReferrers.length === 0 && (
                <tr><td colSpan={3} style={{ color: '#444', fontStyle: 'italic' }}>No referrer data yet.</td></tr>
              )}
              {stats.topReferrers.map(r => (
                <tr key={r.referrer}>
                  <td style={{ fontSize: '0.72rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.referrer.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.views}</td>
                  <td>
                    <div className="analytics-row-bar">
                      <div className="analytics-row-bar-fill" style={{ width: `${Math.round((r.views / maxRef) * 100)}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="analytics-card">
      <span className="analytics-card-value">{value.toLocaleString()}</span>
      <span className="analytics-card-label">{label}</span>
    </div>
  );
}
