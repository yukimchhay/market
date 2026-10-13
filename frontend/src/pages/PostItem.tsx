import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { CATEGORIES } from '../types';

export default function PostItem() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    category: CATEGORIES[0],
    condition: 'Used',
    location: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setImages(Array.from(e.target.files).slice(0, 6));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      images.forEach((img) => data.append('images', img));

      const res = await api.post('/listings', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/listing/${res.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not publish your listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-ink">Sell an item</h1>
      <p className="mt-1 text-sm text-ink/50">Add photos and details so buyers know exactly what they're getting.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Photos (up to 6)</label>
          <input type="file" accept="image/*" multiple onChange={handleFiles} className="text-sm" />
          {images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(img)}
                  alt=""
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Title</label>
          <input
            required
            maxLength={100}
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className="w-full rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Description</label>
          <textarea
            required
            rows={5}
            maxLength={3000}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="w-full rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Price</label>
            <input
              type="number"
              min={0}
              required
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              className="w-full rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Currency</label>
            <select
              value={form.currency}
              onChange={(e) => update('currency', e.target.value)}
              className="w-full rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="KHR">KHR (៛)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Category</label>
            <select
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className="w-full rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Condition</label>
            <select
              value={form.condition}
              onChange={(e) => update('condition', e.target.value)}
              className="w-full rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
            >
              <option value="New">New</option>
              <option value="Used">Used</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Location</label>
          <input
            required
            placeholder="e.g. Phnom Penh, Toul Kork"
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            className="w-full rounded-lg border border-jade-100 px-3 py-2 text-sm focus:border-jade-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-saffron-500 py-2.5 text-sm font-semibold text-white hover:bg-saffron-600 disabled:opacity-60"
        >
          {submitting ? 'Publishing…' : 'Publish listing'}
        </button>
      </form>
    </div>
  );
}
