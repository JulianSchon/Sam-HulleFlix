'use client'

import { useState } from 'react'
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

export default function QuickSeenButton({ movieId, initial }: Props) {
  const router = useRouter()
  const [watched, setWatched] = useState(initial.watched)
  const [watchlist, setWatchlist] = useState(initial.watchlist)
  const [loading, setLoading] = useState(false)

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const nextWatched = !watched
    const nextWatchlist = nextWatched ? false : watchlist
    setWatched(nextWatched)
    setWatchlist(nextWatchlist)
    setLoading(true)
    await fetch('/api/user-movie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        movieId,
        watched: nextWatched,
        watchlist: nextWatchlist,
        rating: initial.rating,
        review: initial.review,
      }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={watched ? 'Mark as unseen' : 'Mark as seen'}
      title={watched ? 'Mark as unseen' : 'Mark as seen'}
      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-40 ${
        watched
          ? 'bg-green-600 border-green-600 text-white'
          : 'border-cinema-dim text-transparent hover:border-green-500 hover:text-green-500'
      }`}
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </button>
  )
}
