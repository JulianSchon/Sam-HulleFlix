'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { tmdbPosterUrl } from '@/lib/tmdb'

interface CollectionResult {
  id: number
  name: string
  overview: string
  poster_path: string | null
}

interface CollectionDetail {
  name: string
  parts: { id: number; title: string; release_date: string; poster_path: string | null }[]
}

export default function NewFranchisePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CollectionResult[]>([])
  const [selected, setSelected] = useState<CollectionResult | null>(null)
  const [detail, setDetail] = useState<CollectionDetail | null>(null)
  const [form, setForm] = useState({
    slug: '',
    name: '',
    description: '',
    watchOrderGuide: '',
    heroImageUrl: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function search() {
    if (!query.trim()) return
    const res = await fetch(`/api/admin/tmdb/search?q=${encodeURIComponent(query)}`)
    setResults(await res.json())
  }

  async function selectCollection(c: CollectionResult) {
    setSelected(c)
    const res = await fetch(`/api/admin/tmdb/search?id=${c.id}`)
    const d: CollectionDetail = await res.json()
    setDetail(d)
    setForm((f) => ({
      ...f,
      name: c.name.replace(' Collection', '').replace(' Franchise', ''),
      slug: c.name
        .toLowerCase()
        .replace(/\s+(collection|franchise)/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      description: c.overview || '',
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!detail) return
    setSaving(true)
    setError('')

    const res = await fetch('/api/admin/franchises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        tmdbCollectionId: selected?.id,
        movieTmdbIds: detail.parts.map((p) => p.id),
      }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(data.error ?? 'Failed to create franchise')
    } else {
      router.push('/admin/franchises')
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-white font-bold text-xl mb-6">Add Franchise</h2>

      {/* Step 1: TMDB search */}
      <div className="mb-8">
        <p className="text-cinema-muted text-xs uppercase tracking-wider mb-3">Step 1 — Search TMDB Collection</p>
        <div className="flex gap-2 mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="e.g. Terminator, Alien…"
            className="flex-1 bg-black border border-cinema-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cinema-red"
          />
          <button
            onClick={search}
            className="bg-cinema-red text-white text-sm font-bold px-4 py-2 rounded hover:opacity-80"
          >
            Search
          </button>
        </div>
        {results.length > 0 && !selected && (
          <div className="space-y-2">
            {results.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCollection(c)}
                className="w-full flex items-center gap-3 bg-cinema-surface border border-cinema-border rounded-lg p-3 hover:border-cinema-muted transition-colors text-left"
              >
                {c.poster_path && (
                  <Image
                    src={tmdbPosterUrl(c.poster_path, 'w92')}
                    alt={c.name}
                    width={40}
                    height={60}
                    className="rounded flex-shrink-0 object-cover"
                    unoptimized
                  />
                )}
                <div>
                  <p className="text-white font-bold text-sm">{c.name}</p>
                  <p className="text-cinema-muted text-xs line-clamp-2 mt-0.5">{c.overview}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {selected && detail && (
          <div className="bg-cinema-surface border border-cinema-gold/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-cinema-gold text-sm font-bold">✓ {selected.name}</p>
              <button onClick={() => { setSelected(null); setDetail(null) }} className="text-cinema-dim text-xs hover:text-cinema-muted">
                Change
              </button>
            </div>
            <p className="text-cinema-muted text-xs">{detail.parts.length} films detected:</p>
            <p className="text-cinema-dim text-xs mt-1">{detail.parts.map((p) => p.title).join(', ')}</p>
          </div>
        )}
      </div>

      {/* Step 2: Details form */}
      {detail && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-cinema-muted text-xs uppercase tracking-wider mb-1">Step 2 — Configure Details</p>

          {error && (
            <p className="text-cinema-red text-sm bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
              {error}
            </p>
          )}

          {[
            ['slug', 'URL Slug (lowercase, hyphens)'],
            ['name', 'Franchise Name'],
            ['heroImageUrl', 'Hero Image URL (optional)'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="block text-xs text-cinema-muted mb-1.5 uppercase tracking-wider">{label}</label>
              <input
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={key !== 'heroImageUrl'}
                className="w-full bg-black border border-cinema-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cinema-red"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs text-cinema-muted mb-1.5 uppercase tracking-wider">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={3}
              className="w-full bg-black border border-cinema-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cinema-red resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-cinema-muted mb-1.5 uppercase tracking-wider">Watch Order Guide</label>
            <textarea
              value={form.watchOrderGuide}
              onChange={(e) => setForm({ ...form, watchOrderGuide: e.target.value })}
              required
              rows={3}
              placeholder="e.g. Release order recommended. T1 → T2 → T3…"
              className="w-full bg-black border border-cinema-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cinema-red resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-cinema-red text-white font-bold py-3 rounded hover:opacity-80 disabled:opacity-50 transition-opacity"
          >
            {saving ? 'Creating…' : 'Create Franchise'}
          </button>
        </form>
      )}
    </div>
  )
}
