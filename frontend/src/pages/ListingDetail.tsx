import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { imageUrl, formatPrice } from "../components/ListingCard";
import FavoriteButton from "../components/FavoriteButton";
import { Listing, User } from "../types";
import { useAuth } from "../context/AuthContext";

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/listings/${id}`)
      .then((res) => setListing(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return <p className="py-24 text-center text-jade-600">Loading…</p>;
  if (!listing)
    return <p className="py-24 text-center text-ink/60">Listing not found.</p>;

  const seller = listing.seller as User;
  const isOwner = user && seller && user._id === seller._id;
  const cover = imageUrl(listing.images?.[activeImg]);

  async function handleMessageSeller() {
    if (!user) {
      navigate("/login");
      return;
    }
    setMessaging(true);
    try {
      const res = await api.post("/conversations", {
        recipientId: seller._id,
        listingId: listing!._id,
      });
      navigate(`/messages/${res.data._id}`);
    } finally {
      setMessaging(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-5">
        <div className="md:col-span-3">
          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-jade-50">
            {cover ? (
              <img
                src={cover}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-jade-200">
                No photo
              </div>
            )}
          </div>
          {listing.images.length > 1 && (
            <div className="mt-2 flex gap-2">
              {listing.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImg(i)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${
                    i === activeImg ? "border-jade-500" : "border-transparent"
                  }`}
                >
                  <img
                    src={imageUrl(img) || ""}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <h1 className="mt-6 text-2xl font-bold text-ink">{listing.title}</h1>
          <p className="mt-1 text-sm text-ink/50">
            {listing.location} · {listing.condition} · {listing.views} views
          </p>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
            {listing.description}
          </p>
        </div>

        <div className="md:col-span-2">
          <div className="rounded-xl border border-jade-100 p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-2xl font-extrabold text-jade-600">
                {formatPrice(listing.price, listing.currency)}
              </p>
              <FavoriteButton
                listingId={listing._id}
                className="border border-jade-100"
              />
            </div>
            <span className="mt-1 inline-block rounded-full bg-jade-50 px-2.5 py-0.5 text-xs font-medium text-jade-600">
              {listing.category}
            </span>

            <div className="mt-5 flex items-center gap-3 border-t border-jade-50 pt-4">
              {seller?.avatar ? (
                <img
                  src={imageUrl(seller.avatar) || ""}
                  alt={seller.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-jade-100 font-bold text-jade-600">
                  {seller?.name?.charAt(0).toUpperCase()}
                </span>
              )}
              <div>
                <Link
                  to={`/seller/${seller?._id}`}
                  className="text-sm font-semibold text-ink hover:text-jade-600"
                >
                  {seller?.name}
                </Link>
                <p className="text-xs text-ink/50">{seller?.location}</p>
              </div>
            </div>

            {isOwner ? (
              <p className="mt-4 rounded-lg bg-jade-50 px-3 py-2 text-center text-sm text-jade-600">
                This is your listing
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                <button
                  onClick={handleMessageSeller}
                  disabled={messaging}
                  className="w-full rounded-full bg-jade-500 py-2.5 text-sm font-semibold text-white hover:bg-jade-600 disabled:opacity-60"
                >
                  {messaging ? "Opening chat…" : "Message seller"}
                </button>
                <button
                  onClick={() => setShowPhone(true)}
                  className="w-full rounded-full border border-jade-100 py-2.5 text-sm font-semibold text-ink hover:border-jade-300"
                >
                  {showPhone
                    ? seller?.phone || "Not provided"
                    : "Show phone number"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
