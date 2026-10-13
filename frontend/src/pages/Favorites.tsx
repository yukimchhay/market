import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import ListingCard from "../components/ListingCard";
import { Listing } from "../types";

export default function Favorites() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/favorites")
      .then((res) => setListings(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-ink">Your favorites</h1>

      {loading ? (
        <p className="py-16 text-center text-jade-600">Loading…</p>
      ) : listings.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-jade-200 py-16 text-center">
          <p className="text-ink/60">You haven't saved anything yet.</p>
          <Link
            to="/"
            className="mt-3 inline-block text-sm font-medium text-jade-600 hover:underline"
          >
            Browse listings
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {listings.map((l) => (
            <ListingCard key={l._id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
