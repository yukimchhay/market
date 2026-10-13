import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not log in. Check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-ink/50">Log in to manage your listings.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-jade-500 py-2.5 text-sm font-semibold text-white hover:bg-jade-600 disabled:opacity-60"
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/50">
        New here?{' '}
        <Link to="/register" className="font-medium text-jade-600">
          Create an account
        </Link>
      </p>
    </div>
  );
}
