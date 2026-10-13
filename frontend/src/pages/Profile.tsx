import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.put('/users/me', form);
      refreshUser(res.data);
      setSaved(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save your profile.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-bold text-ink">Your profile</h1>
      <p className="mt-1 text-sm text-ink/50">This is what buyers see when they view your listings.</p>

      <div className="mt-6 flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-jade-100 text-xl font-bold text-jade-600">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="font-semibold text-ink">{user.name}</p>
          <p className="text-sm text-ink/50">{user.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        {saved && <p className="rounded-lg bg-jade-50 px-3 py-2 text-sm text-jade-600">Profile updated.</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Full name</label>
          <input
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="w-full rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Location</label>
          <input
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            className="w-full rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">About you</label>
          <textarea
            rows={3}
            maxLength={300}
            value={form.bio}
            onChange={(e) => update('bio', e.target.value)}
            className="w-full rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-jade-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-jade-600 disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Save changes'}
        </button>
      </form>
      <p>Chat feature we will update it later, now you can choose phone number to contact by telegram</p>
    </div>
  );
}
