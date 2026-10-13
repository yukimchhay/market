import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/listings', label: 'Listings' },
];

export default function AdminLayout() {
  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
      <aside className="w-48 flex-shrink-0">
        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Admin</p>
        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-jade-500 text-white' : 'text-ink/70 hover:bg-jade-50'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
