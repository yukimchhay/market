import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";
import { formatPrice, imageUrl } from "../../components/ListingCard";
import { Listing, User } from "../../types";
import { useAuth } from "../../context/AuthContext";

export default function AdminUserDetail() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const [owner, setOwner] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get(`/admin/users/${id}`)
      .then((res) => {
        setOwner(res.data.user);
        setListings(res.data.listings);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function toggleBan() {
    if (!owner) return;
    await api.put(`/admin/users/${owner._id}/ban`, {
      isBanned: !owner.isBanned,
    });
    load();
  }

  async function toggleRole() {
    if (!owner) return;
    const isCurrentlyAdmin =
      (owner.role as string) === "admin" || (owner.role as string) === "superadmin";
    const nextRole = isCurrentlyAdmin ? "user" : "admin";
    if (
      !confirm(
        `Make ${owner.name} ${nextRole === "admin" ? "an admin" : "a regular user"}?`,
      )
    )
      return;
    await api.put(`/admin/users/${owner._id}/role`, { role: nextRole });
    load();
  }

  async function setStatus(listingId: string, status: string) {
    await api.put(`/admin/listings/${listingId}/status`, { status });
    load();
  }

  async function removeListing(listingId: string) {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    await api.delete(`/admin/listings/${listingId}`);
    load();
  }

  if (loading)
    return <p className="py-12 text-center text-jade-600">Loading…</p>;
  if (!owner)
    return <p className="py-12 text-center text-ink/60">User not found.</p>;

  const isSelf = owner._id === me?._id;
  const targetIsAdminAccount = owner.role === "admin";
  const iAmSuperadmin = (me?.role as string | undefined) === "superadmin";
  const roleActionLocked = isSelf || (targetIsAdminAccount && !iAmSuperadmin);

  return (
    <div>
      <Link to="/admin/users" className="text-sm text-jade-600 hover:underline">
        ← Back to users
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-jade-100 p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-jade-100 text-lg font-bold text-jade-600">
            {owner.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="text-xl font-bold text-ink">{owner.name}</h1>
            <p className="text-sm text-ink/50">{owner.email}</p>
            <p className="text-sm text-ink/50">
              {owner.location || "No location set"}
            </p>
            {owner.phone && (
              <p className="text-sm text-ink/50">{owner.phone}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              (owner.role as string) === "superadmin"
                ? "bg-jade-600 text-white"
                : owner.role === "admin"
                  ? "bg-saffron-500/20 text-saffron-600"
                  : "bg-jade-50 text-jade-600"
            }`}
          >
            {owner.role}
          </span>
          {owner.isBanned && (
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
              Banned
            </span>
          )}
          <button
            onClick={toggleRole}
            disabled={roleActionLocked}
            title={
              roleActionLocked && targetIsAdminAccount
                ? "Only a super admin can manage admin accounts"
                : undefined
            }
            className="rounded-full border border-jade-100 px-3 py-1.5 text-xs font-medium text-ink hover:border-jade-300 disabled:opacity-40"
          >
            {targetIsAdminAccount ? "Remove admin" : "Make admin"}
          </button>
          <button
            onClick={toggleBan}
            disabled={roleActionLocked}
            title={
              roleActionLocked && targetIsAdminAccount
                ? "Only a super admin can manage admin accounts"
                : undefined
            }
            className="rounded-full border border-jade-100 px-3 py-1.5 text-xs font-medium text-ink hover:border-jade-300 disabled:opacity-40"
          >
            {owner.isBanned ? "Unban" : "Ban"}
          </button>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-ink">
        {listings.length} listing{listings.length === 1 ? "" : "s"} owned by{" "}
        {owner.name}
      </h2>

      {listings.length === 0 ? (
        <p className="mt-4 text-sm text-ink/60">
          This user hasn't posted anything.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-jade-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-jade-50 text-xs uppercase text-ink/50">
              <tr>
                <th className="px-4 py-2">Listing</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Views</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-jade-50">
              {listings.map((l) => (
                <tr key={l._id}>
                  <td className="px-4 py-2">
                    <Link
                      to={`/listing/${l._id}`}
                      className="flex items-center gap-2 font-medium text-ink hover:text-jade-600"
                    >
                      <span className="h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-jade-50">
                        {l.images[0] && (
                          <img
                            src={imageUrl(l.images[0]) || ""}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </span>
                      {l.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-ink/70">
                    {formatPrice(l.price, l.currency)}
                  </td>
                  <td className="px-4 py-2 text-ink/70">{l.views}</td>
                  <td className="px-4 py-2">
                    <select
                      value={l.status}
                      onChange={(e) => setStatus(l._id, e.target.value)}
                      className="rounded-lg border border-jade-100 px-2 py-1 text-xs"
                    >
                      <option value="active">Active</option>
                      <option value="sold">Sold</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => removeListing(l._id)}
                      className="rounded-full border border-red-100 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
