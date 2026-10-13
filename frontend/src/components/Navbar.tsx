import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadTotal, setUnreadTotal] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadTotal(0);
      return;
    }
    let active = true;
    function load() {
      api
        .get("/conversations")
        .then((res) => {
          if (!active) return;
          const total = res.data.reduce(
            (sum: number, c: { unreadCount?: number }) =>
              sum + (c.unreadCount || 0),
            0,
          );
          setUnreadTotal(total);
        })
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user]);

  return (
    <header className="border-b border-jade-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-jade-600">
         Sura
        </Link>

        <div className="hidden flex-1 justify-center px-8 md:flex">
          <span className="text-sm text-ink/50">
            Buy and sell almost anything, locally
          </span>
        </div>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/post-item"
                className="rounded-full bg-saffron-500 px-4 py-2 text-sm font-semibold text-white hover:bg-saffron-600"
              >
                + Sell an item
              </Link>
              <Link
                to="/dashboard"
                className="text-sm font-medium text-ink hover:text-jade-600"
              >
                Dashboard
              </Link>
              <Link
                to="/messages"
                className="relative text-sm font-medium text-ink hover:text-jade-600"
              >
                Messages
                {unreadTotal > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-saffron-500 px-1 text-[10px] font-bold text-white">
                    {unreadTotal}
                  </span>
                )}
              </Link>
              <Link
                to="/favorites"
                className="text-sm font-medium text-ink hover:text-jade-600"
              >
                Favorites
              </Link>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="text-sm font-medium text-ink hover:text-jade-600"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm font-medium text-ink hover:text-jade-600"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-jade-100 text-xs font-bold text-jade-600">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
                {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-sm text-ink/50 hover:text-ink"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-ink hover:text-jade-600"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-jade-500 px-4 py-2 text-sm font-semibold text-white hover:bg-jade-600"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
