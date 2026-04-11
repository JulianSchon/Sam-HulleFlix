'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Props {
  movieId: string
  initial: {
    watched: boolean
    watchlist: boolean
    rating: number | null
    review: string | null
  }
}

export default function UserMovieActions({ movieId, initial }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [state, setState] = useState(initial)
  const [saving, setSaving] = useState(false)

  if (!session) {
    return (
      <p className="text-cinema-dim text-sm">
        <a href="/login" className="text-cinema-gold hover:underline">Sign in</a> to track this film
      </p>
    )
  }

  async function save(patch: Partial<typeof state>) {
    const next = { ...state, ...patch }
    setState(next)
    setSaving(true)
    await fetch('/api/user-movie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieId, ...next }),
    })
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Watched + Watchlist */}
      <div className="flex gap-3">
        <button
          onClick={() => save({ watched: !state.watched, watchlist: state.watched ? state.watchlist : false })}
          className={`flex-1 text-sm font-bold py-2.5 rounded transition-colors ${
            state.watched
              ? 'bg-green-900/50 border border-green-700/50 text-green-400 hover:bg-green-900/80'
              : 'bg-cinema-surface border border-cinema-border text-cinema-muted hover:border-cinema-muted'
          }`}
        >
          {state.watched ? '✓ Seen' : 'Mark as Seen'}
        </button>
        <button
          onClick={() => save({ watchlist: !state.watchlist })}
          className={`flex-1 text-sm font-bold py-2.5 rounded transition-colors ${
            state.watchlist
              ? 'bg-blue-900/50 border border-blue-700/50 text-cinema-blue hover:bg-blue-900/80'
              : 'bg-cinema-surface border border-cinema-border text-cinema-muted hover:border-cinema-muted'
          }`}
        >
          {state.watchlist ? '✓ In Watchlist' : '+ Watchlist'}
        </button>
      </div>

      {/* Star rating */}
      <div>
        <p className="text-xs text-cinema-muted uppercase tracking-wider mb-2">Your Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => save({ rating: state.rating === n ? null : n })}
              className={`text-2xl transition-colors ${
                (state.rating ?? 0) >= n ? 'text-cinema-gold' : 'text-cinema-border hover:text-cinema-dim'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* Review */}
      <div>
        <p className="text-xs text-cinema-muted uppercase tracking-wider mb-2">Your Review</p>
        <textarea
          value={state.review ?? ''}
          onChange={(e) => setState({ ...state, review: e.target.value })}
          onBlur={() => save({ review: state.review })}
          rows={3}
          placeholder="Write your thoughts…"
          className="w-full bg-black border border-cinema-border rounded px-3 py-2 text-sm text-white placeholder-cinema-dim resize-none focus:outline-none focus:border-cinema-muted transition-colors"
        />
        {saving && <p className="text-cinema-dim text-xs mt-1">Saving…</p>}
      </div>
    </div>
  )
}
