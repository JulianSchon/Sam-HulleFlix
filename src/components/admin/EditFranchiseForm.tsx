'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Franchise {
  id: string
  name: string
  description: string
  watchOrderGuide: string
  heroImageUrl: string | null
  featured: boolean
  tmdbCollectionId: number | null
}

export default function EditFranchiseForm({ franchise }: { franchise: Franchise }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: franchise.name,
    description: franchise.description,
    watchOrderGuide: franchise.watchOrderGuide,
    heroImageUrl: franchise.heroImageUrl ?? '',
    featured: franchise.featured,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fetchingImage, setFetchingImage] = useState(false)

  async function fetchTmdbImage() {
    setFetchingImage(true)
    const res = await fetch(`/api/admin/franchises/${franchise.id}/fetch-image`, { method: 'POST' })
    const data = await res.json()
    if (data.heroImageUrl) {
      setForm((f) => ({ ...f, heroImageUrl: data.heroImageUrl }))
    }
    setFetchingImage(false)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch(`/api/admin/franchises/${franchise.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, heroImageUrl: form.heroImageUrl || null }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div>
        <label className="block text-xs text-cinema-muted mb-1.5 uppercase tracking-wider">Name</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-black border border-cinema-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cinema-red"
        />
      </div>

      {/* Hero image with preview */}
      <div>
        <label className="block text-xs text-cinema-muted mb-1.5 uppercase tracking-wider">Hero Image</label>
        <div className="flex gap-2 mb-2">
          <input
            value={form.heroImageUrl}
            onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })}
            placeholder="https://image.tmdb.org/…"
            className="flex-1 bg-black border border-cinema-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cinema-red"
          />
          {franchise.tmdbCollectionId && (
            <button
              type="button"
              onClick={fetchTmdbImage}
              disabled={fetchingImage}
              className="bg-cinema-surface border border-cinema-border text-cinema-muted text-xs font-bold px-3 py-2 rounded hover:border-cinema-muted hover:text-white transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {fetchingImage ? '…' : '↓ From TMDB'}
            </button>
          )}
        </div>
        {form.heroImageUrl && (
          <div className="relative h-24 rounded overflow-hidden border border-cinema-border">
            <Image
              src={form.heroImageUrl}
              alt="Hero preview"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs text-cinema-muted mb-1.5 uppercase tracking-wider">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full bg-black border border-cinema-border rounded px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-cinema-red"
        />
      </div>

      <div>
        <label className="block text-xs text-cinema-muted mb-1.5 uppercase tracking-wider">Watch Order Guide</label>
        <textarea
          value={form.watchOrderGuide}
          onChange={(e) => setForm({ ...form, watchOrderGuide: e.target.value })}
          rows={3}
          className="w-full bg-black border border-cinema-border rounded px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-cinema-red"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="featured"
          checked={form.featured}
          onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="featured" className="text-cinema-muted text-sm">
          Featured franchise (hero on home page)
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-cinema-red text-white font-bold text-sm px-5 py-2.5 rounded hover:opacity-80 disabled:opacity-50 transition-opacity"
      >
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
      </button>
    </form>
  )
}
