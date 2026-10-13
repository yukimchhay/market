import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { imageUrl, formatPrice } from "../components/ListingCard";
import { Conversation } from "../types";
import { useAuth } from "../context/AuthContext";

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    function load() {
      api
        .get("/conversations")
        .then((res) => active && setConversations(res.data))
        .finally(() => active && setLoading(false));
    }

    load();
    const interval = setInterval(load, 8000); // poll for new conversations/messages
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (loading)
    return <p className="py-24 text-center text-jade-600">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-ink">Messages</h1>

      {conversations.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-jade-200 py-16 text-center">
          <p className="text-ink/60">No conversations yet.</p>
          <p className="mt-1 text-sm text-ink/50">
            Message a seller from a listing page to start chatting.
          </p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-jade-50 rounded-xl border border-jade-100">
          {conversations.map((c) => {
            const other = c.participants.find((p) => p._id !== user?._id);
            const cover = c.listing?.images?.[0]
              ? imageUrl(c.listing.images[0])
              : null;

            return (
              <Link
                key={c._id}
                to={`/messages/${c._id}`}
                className="flex items-center gap-3 p-4 hover:bg-jade-50/50"
              >
                {other?.avatar ? (
                  <img
                    src={imageUrl(other.avatar) || ""}
                    alt={other.name}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-jade-100 font-bold text-jade-600">
                    {other?.name?.charAt(0).toUpperCase()}
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold text-ink">
                      {other?.name || "Unknown user"}
                    </p>
                    {!!c.unreadCount && (
                      <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-saffron-500 px-1.5 text-xs font-bold text-white">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-ink/60">
                    {c.lastMessage || "Say hello!"}
                  </p>
                  {c.listing && (
                    <p className="mt-0.5 truncate text-xs text-jade-600">
                      {c.listing.title} ·{" "}
                      {formatPrice(c.listing.price, c.listing.currency)}
                    </p>
                  )}
                </div>

                {cover && (
                  <img
                    src={cover}
                    alt=""
                    className="h-11 w-11 flex-shrink-0 rounded-lg object-cover"
                  />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
