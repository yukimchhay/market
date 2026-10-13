import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { User } from "../../types";
import { useAuth } from "../../context/AuthContext";

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get("/admin/users", { params: { q: q || undefined } })
      .then((res) => setUsers(res.data.users))
      .finally(() => setLoading(false));
  }

  useEffect(load, [q]);

  async function toggleBan(u: User) {
    await api.put(`/admin/users/${u._id}/ban`, { isBanned: !u.isBanned });
    load();
  }

  async function toggleRole(u: User) {
    const isCurrentlyAdmin = u.role === "admin";
    const nextRole = isCurrentlyAdmin ? "user" : "admin";
    if (
      !confirm(
        `Make ${u.name} ${nextRole === "admin" ? "an admin" : "a regular user"}?`,
      )
    )
      return;
    await api.put(`/admin/users/${u._id}/role`, { role: nextRole });
    load();
  }

  async function remove(u: User) {
    if (
      !confirm(
        `Delete ${u.name} and all of their listings? This cannot be undone.`,
      )
    )
      return;
    await api.delete(`/admin/users/${u._id}`);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Users</h1>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name or email…"
        className="mt-4 w-full max-w-sm rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
      />

      {loading ? (
        <p className="py-12 text-center text-jade-600">Loading…</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-jade-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-jade-50 text-xs uppercase text-ink/50">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Listings</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-jade-50">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-2 font-medium text-ink">
                    <Link
                      to={`/admin/users/${u._id}`}
                      className="hover:text-jade-600 hover:underline"
                    >
                      {u.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-ink/70">{u.email}</td>
                  <td className="px-4 py-2 text-ink/70">
                    {u.listingCount ?? 0}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        (u.role as string) === "superadmin"
                          ? "bg-jade-600 text-white"
                          : u.role === "admin"
                            ? "bg-saffron-500/20 text-saffron-600"
                            : "bg-jade-50 text-jade-600"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {u.isBanned ? (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                        Banned
                      </span>
                    ) : (
                      <span className="rounded-full bg-jade-50 px-2 py-0.5 text-xs font-medium text-jade-600">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const targetIsAdminAccount =
                          u.role === "admin" ||
                          (u.role as string) === "superadmin";
                        const iAmSuperadmin = (me?.role as string) === "superadmin";
                        // Only a superadmin may touch an existing admin/superadmin account,
                        // or grant admin access to a plain user.
                        const roleActionLocked =
                          u._id === me?._id ||
                          (targetIsAdminAccount && !iAmSuperadmin);
                        const banActionLocked =
                          u._id === me?._id ||
                          (targetIsAdminAccount && !iAmSuperadmin);

                        return (
                          <>
                            <button
                              onClick={() => toggleRole(u)}
                              disabled={roleActionLocked}
                              title={
                                roleActionLocked && targetIsAdminAccount
                                  ? "Only a super admin can manage admin accounts"
                                  : undefined
                              }
                              className="rounded-full border border-jade-100 px-2.5 py-1 text-xs font-medium text-ink hover:border-jade-300 disabled:opacity-40"
                            >
                              {u.role === "admin" ||
                              (u.role as string) === "superadmin"
                                ? "Remove admin"
                                : "Make admin"}
                            </button>
                            <button
                              onClick={() => toggleBan(u)}
                              disabled={banActionLocked}
                              title={
                                banActionLocked && targetIsAdminAccount
                                  ? "Only a super admin can manage admin accounts"
                                  : undefined
                              }
                              className="rounded-full border border-jade-100 px-2.5 py-1 text-xs font-medium text-ink hover:border-jade-300 disabled:opacity-40"
                            >
                              {u.isBanned ? "Unban" : "Ban"}
                            </button>
                            <button
                              onClick={() => remove(u)}
                              disabled={banActionLocked}
                              title={
                                banActionLocked && targetIsAdminAccount
                                  ? "Only a super admin can manage admin accounts"
                                  : undefined
                              }
                              className="rounded-full border border-red-100 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                            >
                              Delete
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="py-8 text-center text-sm text-ink/50">
              No users found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
