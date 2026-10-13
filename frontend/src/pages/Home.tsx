import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import ListingCard from '../components/ListingCard';
import { Listing, CATEGORIES } from '../types';

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get('/listings', { params: { q: q || undefined, category: category || undefined, page } })
      .then((res) => {
        if (!active) return;
        setListings(res.data.listings);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [q, category, page]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-8 rounded-2xl bg-jade-600 px-6 py-10 text-white">
        <h1 className="text-3xl font-extrabold">Find it. Sell it. Right in your neighborhood.</h1>
        <p className="mt-2 max-w-lg text-jade-50/90">
          Thousands of listings from real people nearby — vehicles, electronics, furniture and more.
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex max-w-xl gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for anything…"
            className="flex-1 rounded-full border-0 px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-saffron-400"
          />
          <button
            type="submit"
            className="rounded-full bg-saffron-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-saffron-600"
          >
            Search
          </button>
        </form>
      </section>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => {
            setCategory('');
            setPage(1);
          }}
          className={`rounded-full border px-3 py-1.5 text-sm ${
            category === '' ? 'border-jade-500 bg-jade-500 text-white' : 'border-jade-100 text-ink/70 hover:border-jade-300'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCategory(c);
              setPage(1);
            }}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              category === c ? 'border-jade-500 bg-jade-500 text-white' : 'border-jade-100 text-ink/70 hover:border-jade-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-16 text-center text-jade-600">Loading listings…</p>
      ) : listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-jade-200 py-16 text-center">
          <p className="text-ink/60">No listings match your search yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {listings.map((l) => (
              <ListingCard key={l._id} listing={l} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-full border border-jade-100 px-4 py-1.5 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-ink/60">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-full border border-jade-100 px-4 py-1.5 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
