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

function SortableItem({ film }: { film: Film }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: film.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-3 bg-cinema-surface border border-cinema-border rounded px-3 py-2 cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <span className="text-cinema-dim">⠿</span>
      <span className="text-cinema-muted text-sm flex-1">{film.title ?? `TMDB ${film.tmdbId}`}</span>
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

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={films.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          {films.map((film) => (
            <SortableItem key={film.id} film={film} />
          ))}
        </SortableContext>
      </DndContext>
      <button
        onClick={saveOrder}
        disabled={saving}
        className="mt-2 text-sm bg-cinema-gold text-black font-bold px-4 py-2 rounded hover:opacity-80 disabled:opacity-50 transition-opacity"
      >
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Order'}
      </button>
    </div>
  )
}
