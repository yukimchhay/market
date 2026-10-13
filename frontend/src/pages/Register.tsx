import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', location: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold text-ink">Create your account</h1>
      <p className="mt-1 text-sm text-ink/50">Join Bazario to buy and sell items near you.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Full name</label>
          <input
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="w-full rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            className="w-full rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="w-full rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">City</label>
            <input
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              className="w-full rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-jade-500 py-2.5 text-sm font-semibold text-white hover:bg-jade-600 disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/50">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-jade-600">
          Log in
        </Link>
      </p>
    </div>
  );
}
