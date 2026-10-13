import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { formatPrice } from '../../components/ListingCard';
import { Listing, User, CATEGORIES } from '../../types';

export default function AdminListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get('/admin/listings', {
        params: { status: status || undefined, category: category || undefined, q: q || undefined },
      })
      .then((res) => setListings(res.data.listings))
      .finally(() => setLoading(false));
  }

  useEffect(load, [status, category, q]);

  async function setListingStatus(id: string, newStatus: string) {
    await api.put(`/admin/listings/${id}/status`, { status: newStatus });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    await api.delete(`/admin/listings/${id}`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Listings</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title…"
          className="rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="sold">Sold</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="py-12 text-center text-jade-600">Loading…</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-jade-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-jade-50 text-xs uppercase text-ink/50">
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Seller</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-jade-50">
              {listings.map((l) => {
                const seller = l.seller as User;
                return (
                  <tr key={l._id}>
                    <td className="px-4 py-2">
                      <Link to={`/listing/${l._id}`} className="font-medium text-ink hover:text-jade-600">
                        {l.title}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-ink/70">{seller?.name}</td>
                    <td className="px-4 py-2 text-ink/70">{formatPrice(l.price, l.currency)}</td>
                    <td className="px-4 py-2">
                      <select
                        value={l.status}
                        onChange={(e) => setListingStatus(l._id, e.target.value)}
                        className="rounded-lg border border-jade-100 px-2 py-1 text-xs"
                      >
                        <option value="active">Active</option>
                        <option value="sold">Sold</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => remove(l._id)}
                        className="rounded-full border border-red-100 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {listings.length === 0 && <p className="py-8 text-center text-sm text-ink/50">No listings found.</p>}
        </div>
      )}
    </div>
  );
}
