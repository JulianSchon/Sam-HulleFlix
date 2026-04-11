'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Film {
  id: string
  tmdbId: number
  sortOrder: number
  title?: string
}

interface TmdbSearchResult {
  id: number
  title: string
  release_date: string
  poster_path: string | null
}

function SortableItem({
  film,
  onDelete,
}: {
  film: Film
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: film.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-3 bg-cinema-surface border border-cinema-border rounded px-3 py-2"
    >
      <span
        className="text-cinema-dim cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        ⠿
      </span>
      <span className="text-cinema-muted text-sm flex-1">{film.title ?? `TMDB ${film.tmdbId}`}</span>
      <button
        onClick={() => onDelete(film.id)}
        className="text-cinema-red text-xs hover:opacity-70 transition-opacity flex-shrink-0 px-1"
        title="Remove from franchise"
      >
        ✕
      </button>
    </div>
  )
}

export default function FilmReorder({
  franchiseId,
  initialFilms,
}: {
  franchiseId: string
  initialFilms: Film[]
}) {
  const [films, setFilms] = useState(initialFilms)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Add movie state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<TmdbSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setFilms((items) => {
      const oldIndex = items.findIndex((f) => f.id === active.id)
      const newIndex = items.findIndex((f) => f.id === over.id)
      return arrayMove(items, oldIndex, newIndex)
    })
  }

  async function saveOrder() {
    setSaving(true)
    await fetch(`/api/admin/franchises/${franchiseId}/movies`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: films.map((f, i) => ({ id: f.id, sortOrder: i })) }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function deleteFilm(id: string) {
    if (!confirm('Remove this film from the franchise?')) return
    await fetch(`/api/admin/movies/${id}`, { method: 'DELETE' })
    setFilms((prev) => prev.filter((f) => f.id !== id))
  }

  async function searchTmdb() {
    if (!searchQuery.trim()) return
    setSearching(true)
    const res = await fetch(
      `/api/admin/tmdb/search/movies?q=${encodeURIComponent(searchQuery)}`
    )
    const data = await res.json()
    setSearchResults(data)
    setSearching(false)
  }

  async function addFilm(result: TmdbSearchResult) {
    setAdding(result.id)
    const res = await fetch(`/api/admin/franchises/${franchiseId}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tmdbId: result.id }),
    })
    const newMovie = await res.json()
    setFilms((prev) => [...prev, { id: newMovie.id, tmdbId: result.id, sortOrder: prev.length, title: result.title }])
    setSearchResults([])
    setSearchQuery('')
    setAdding(null)
  }

  return (
    <div className="space-y-4">
      {/* Film list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={films.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {films.map((film) => (
              <SortableItem key={film.id} film={film} onDelete={deleteFilm} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {films.length > 0 && (
        <button
          onClick={saveOrder}
          disabled={saving}
          className="text-sm bg-cinema-gold text-black font-bold px-4 py-2 rounded hover:opacity-80 disabled:opacity-50 transition-opacity"
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Order'}
        </button>
      )}

      {/* Add movie */}
      <div className="border-t border-cinema-border pt-4">
        <p className="text-cinema-muted text-xs uppercase tracking-wider mb-3">Add Movie</p>
        <div className="flex gap-2 mb-3">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchTmdb()}
            placeholder="Search TMDB by title…"
            className="flex-1 bg-black border border-cinema-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cinema-gold"
          />
          <button
            onClick={searchTmdb}
            disabled={searching}
            className="bg-cinema-gold text-black text-sm font-bold px-4 py-2 rounded hover:opacity-80 disabled:opacity-50"
          >
            {searching ? '…' : 'Search'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {searchResults.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between bg-cinema-surface border border-cinema-border rounded px-3 py-2"
              >
                <div>
                  <span className="text-white text-sm">{r.title}</span>
                  <span className="text-cinema-dim text-xs ml-2">{r.release_date?.slice(0, 4)}</span>
                </div>
                <button
                  onClick={() => addFilm(r)}
                  disabled={adding === r.id}
                  className="text-cinema-gold text-xs font-bold hover:opacity-70 disabled:opacity-50 ml-4"
                >
                  {adding === r.id ? '…' : '+ Add'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
