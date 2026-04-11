'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Franchise {
  id: string
  name: string
  description: string
  watchOrderGuide: string
  heroImageUrl: string | null
  featured: boolean
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
      {[
        ['name', 'Name'],
        ['heroImageUrl', 'Hero Image URL (optional)'],
      ].map(([key, label]) => (
        <div key={key}>
          <label className="block text-xs text-cinema-muted mb-1.5 uppercase tracking-wider">{label}</label>
          <input
            value={form[key as keyof typeof form] as string}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="w-full bg-black border border-cinema-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cinema-red"
          />
        </div>
      ))}
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
        <label htmlFor="featured" className="text-cinema-muted text-sm">Featured franchise (hero on home page)</label>
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
