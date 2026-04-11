'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TriviaItem {
  id: string
  content: string
  source: string | null
  movieId: string | null
}

export default function TriviaEditor({
  franchiseId,
  trivia,
}: {
  franchiseId: string
  trivia: TriviaItem[]
}) {
  const router = useRouter()
  const [newContent, setNewContent] = useState('')
  const [newSource, setNewSource] = useState('')
  const [adding, setAdding] = useState(false)

  async function addTrivia() {
    if (!newContent.trim()) return
    setAdding(true)
    await fetch('/api/admin/trivia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newContent, source: newSource || undefined, franchiseId }),
    })
    setNewContent('')
    setNewSource('')
    setAdding(false)
    router.refresh()
  }

  async function deleteTrivia(id: string) {
    await fetch(`/api/admin/trivia/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {trivia.map((t) => (
        <div key={t.id} className="flex items-start gap-3 bg-cinema-surface border border-cinema-border rounded px-3 py-2">
          <p className="flex-1 text-cinema-muted text-sm">{t.content}</p>
          {t.source && <p className="text-cinema-dim text-xs">— {t.source}</p>}
          <button
            onClick={() => deleteTrivia(t.id)}
            className="text-cinema-red text-xs hover:opacity-80 flex-shrink-0"
          >
            ✕
          </button>
        </div>
      ))}

      <div className="bg-black border border-cinema-border rounded-lg p-4 space-y-2">
        <p className="text-cinema-muted text-xs uppercase tracking-wider">Add Trivia</p>
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={2}
          placeholder="Trivia fact…"
          className="w-full bg-cinema-surface border border-cinema-border rounded px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-cinema-gold"
        />
        <input
          value={newSource}
          onChange={(e) => setNewSource(e.target.value)}
          placeholder="Source (optional)"
          className="w-full bg-cinema-surface border border-cinema-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cinema-gold"
        />
        <button
          onClick={addTrivia}
          disabled={adding}
          className="bg-cinema-gold text-black text-sm font-bold px-4 py-2 rounded hover:opacity-80 disabled:opacity-50"
        >
          {adding ? 'Adding…' : 'Add'}
        </button>
      </div>
    </div>
  )
}
