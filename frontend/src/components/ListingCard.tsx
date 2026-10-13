import React from "react";
import { Link } from "react-router-dom";
import { Listing, User } from "../types";
import FavoriteButton from "./FavoriteButton";
const API_ORIGIN = (
  (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env
    ?.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

function imageUrl(path?: string) {
  if (!path) return null;
  return path.startsWith("http") ? path : `${API_ORIGIN}${path}`;
}

function formatPrice(price: number, currency: string) {
  if (currency === "KHR") return `${price.toLocaleString()}\u00A0៛`;
  return `$${price.toLocaleString()}`;
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const seller =
    typeof listing.seller === "object" ? (listing.seller as User) : null;
  const cover = imageUrl(listing.images?.[0]);

  return (
    <Link
      to={`/listing/${listing._id}`}
      className="group block overflow-hidden rounded-xl border border-jade-100 bg-white transition hover:border-jade-400 hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-jade-50">
        {cover ? (
          <img
            src={cover}
            alt={listing.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-jade-200">
            <span className="text-sm">No photo</span>
          </div>
        )}
        <FavoriteButton
          listingId={listing._id}
          className="absolute right-2 top-2"
        />
      </div>

      <div className="space-y-1 p-3">
        <p className="text-lg font-bold text-jade-600">
          {formatPrice(listing.price, listing.currency)}
        </p>
        <h3 className="truncate text-sm font-medium text-ink">
          {listing.title}
        </h3>
        <p className="truncate text-xs text-ink/50">{listing.location}</p>

        {seller && (
          <div className="mt-2 flex items-center gap-2 border-t border-jade-50 pt-2">
            {seller.avatar ? (
              <img
                src={imageUrl(seller.avatar) || ""}
                alt={seller.name}
                className="h-5 w-5 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-jade-100 text-[10px] font-bold text-jade-600">
                {seller.name?.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="truncate text-xs text-ink/60">{seller.name}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export { imageUrl, formatPrice };
