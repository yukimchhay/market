import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import ListingCard from '../components/ListingCard';
import { Listing, User } from '../types';

export default function SellerProfile() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/users/${id}`)
      .then((res) => {
        setUser(res.data.user);
        setListings(res.data.listings);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="py-24 text-center text-jade-600">Loading…</p>;
  if (!user) return <p className="py-24 text-center text-ink/60">Seller not found.</p>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-jade-100 text-xl font-bold text-jade-600">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="text-xl font-bold text-ink">{user.name}</h1>
          <p className="text-sm text-ink/50">{user.location}</p>
          {user.bio && <p className="mt-1 max-w-lg text-sm text-ink/70">{user.bio}</p>}
        </div>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-ink">{listings.length} listings</h2>
      {listings.length === 0 ? (
        <p className="mt-4 text-sm text-ink/60">No active listings right now.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {listings.map((l) => (
            <ListingCard key={l._id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
