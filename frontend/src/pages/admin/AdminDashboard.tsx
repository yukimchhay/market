import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { AdminStats } from '../../types';

const cards: { key: keyof AdminStats; label: string }[] = [
  { key: 'totalUsers', label: 'Total users' },
  { key: 'newUsersThisWeek', label: 'New users (7d)' },
  { key: 'bannedUsers', label: 'Banned users' },
  { key: 'totalListings', label: 'Total listings' },
  { key: 'activeListings', label: 'Active listings' },
  { key: 'soldListings', label: 'Sold listings' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Overview</h1>
      <p className="mt-1 text-sm text-ink/50">A snapshot of everything happening on the site.</p>

      {loading ? (
        <p className="py-12 text-center text-jade-600">Loading…</p>
      ) : stats ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {cards.map((c) => (
            <div key={c.key} className="rounded-xl border border-jade-100 p-4">
              <p className="text-2xl font-bold text-jade-600">{stats[c.key]}</p>
              <p className="text-xs text-ink/50">{c.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-ink/60">Could not load stats.</p>
      )}
    </div>
  );
}
