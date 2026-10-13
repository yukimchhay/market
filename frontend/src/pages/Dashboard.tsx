import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { imageUrl, formatPrice } from '../components/ListingCard';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get('/listings/mine')
      .then((res) => setListings(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function markSold(id: string) {
    await api.put(`/listings/${id}`, { status: 'sold' });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    await api.delete(`/listings/${id}`);
    load();
  }

  const active = listings.filter((l) => l.status === 'active');
  const sold = listings.filter((l) => l.status === 'sold');
  const totalViews = listings.reduce((sum, l) => sum + l.views, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-ink">Welcome back, {user?.name.split(' ')[0]}</h1>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-jade-100 p-4">
          <p className="text-2xl font-bold text-jade-600">{active.length}</p>
          <p className="text-xs text-ink/50">Active listings</p>
        </div>
        <div className="rounded-xl border border-jade-100 p-4">
          <p className="text-2xl font-bold text-jade-600">{sold.length}</p>
          <p className="text-xs text-ink/50">Sold</p>
        </div>
        <div className="rounded-xl border border-jade-100 p-4">
          <p className="text-2xl font-bold text-jade-600">{totalViews}</p>
          <p className="text-xs text-ink/50">Total views</p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Your listings</h2>
        <Link to="/post-item" className="text-sm font-medium text-jade-600 hover:underline">
          + Post a new item
        </Link>
      </div>

      {loading ? (
        <p className="py-12 text-center text-jade-600">Loading…</p>
      ) : listings.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-jade-200 py-16 text-center">
          <p className="text-ink/60">You haven't posted anything yet.</p>
          <Link to="/post-item" className="mt-3 inline-block text-sm font-medium text-jade-600 hover:underline">
            Sell your first item
          </Link>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-jade-50 rounded-xl border border-jade-100">
          {listings.map((l) => (
            <div key={l._id} className="flex items-center gap-4 p-4">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-jade-50">
                {l.images[0] ? (
                  <img src={imageUrl(l.images[0]) || ''} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/listing/${l._id}`} className="truncate text-sm font-semibold text-ink hover:text-jade-600">
                  {l.title}
                </Link>
                <p className="text-sm text-jade-600">{formatPrice(l.price, l.currency)}</p>
                <p className="text-xs text-ink/50">
                  {l.status === 'sold' ? 'Sold' : 'Active'} · {l.views} views
                </p>
              </div>
              <div className="flex gap-2">
                {l.status !== 'sold' && (
                  <button
                    onClick={() => markSold(l._id)}
                    className="rounded-full border border-jade-100 px-3 py-1.5 text-xs font-medium text-ink hover:border-jade-300"
                  >
                    Mark sold
                  </button>
                )}
                <button
                  onClick={() => remove(l._id)}
                  className="rounded-full border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
