'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Props {
  movieId: string
  communityRating: number | null
  ratingCount: number
  initial: {
    watched: boolean
    watchlist: boolean
    rating: number | null
    review: string | null
  }
}

export default function UserMovieActions({ movieId, communityRating, ratingCount, initial }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [state, setState] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [hoverRating, setHoverRating] = useState<number | null>(null)

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

  const displayRating = hoverRating ?? state.rating ?? 0

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
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-cinema-muted uppercase tracking-wider">
            Your Rating
            {state.rating !== null && (
              <span className="ml-2 text-cinema-gold normal-case tracking-normal font-bold">
                {state.rating % 1 === 0 ? state.rating : state.rating.toFixed(1)}★
              </span>
            )}
          </p>
          {communityRating !== null && (
            <p className="text-xs text-cinema-dim">
              Community{' '}
              <span className="text-cinema-gold font-bold">{communityRating.toFixed(1)}★</span>
              <span className="text-cinema-dim"> ({ratingCount})</span>
            </p>
          )}
        </div>

        <div className="flex gap-0.5" onMouseLeave={() => setHoverRating(null)}>
          {[1, 2, 3, 4, 5].map((n) => {
            const isFull = displayRating >= n
            const isHalf = !isFull && displayRating >= n - 0.5

            return (
              <div key={n} className="relative w-8 h-8">
                {/* Empty star */}
                <span className="absolute inset-0 flex items-center justify-center text-2xl text-cinema-border select-none pointer-events-none">
                  ★
                </span>
                {/* Gold fill — clips to left 50% for half stars */}
                {(isFull || isHalf) && (
                  <span
                    className="absolute inset-0 flex items-center justify-center text-2xl text-cinema-gold select-none pointer-events-none overflow-hidden"
                    style={isHalf ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
                  >
                    ★
                  </span>
                )}
                {/* Left half hit area → n - 0.5 */}
                <button
                  className="absolute left-0 top-0 w-1/2 h-full"
                  onMouseEnter={() => setHoverRating(n - 0.5)}
                  onClick={() => save({ rating: state.rating === n - 0.5 ? null : n - 0.5 })}
                  aria-label={`Rate ${n - 0.5} out of 5`}
                />
                {/* Right half hit area → n */}
                <button
                  className="absolute right-0 top-0 w-1/2 h-full"
                  onMouseEnter={() => setHoverRating(n)}
                  onClick={() => save({ rating: state.rating === n ? null : n })}
                  aria-label={`Rate ${n} out of 5`}
                />
              </div>
            )
          })}
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
