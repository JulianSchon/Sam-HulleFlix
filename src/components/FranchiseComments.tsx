'use client'

import { useState } from 'react'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: { name: string }
}

export default function FranchiseComments({
  franchiseId,
  initialComments,
  currentUserId,
  isAdmin,
}: {
  franchiseId: string
  initialComments: Comment[]
  currentUserId: string | null
  isAdmin: boolean
}) {
  const [comments, setComments] = useState(initialComments)
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)

  async function postComment(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setPosting(true)
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ franchiseId, content: text.trim() }),
    })
    if (res.ok) {
      const comment = await res.json()
      setComments((prev) => [comment, ...prev])
      setText('')
    }
    setPosting(false)
  }

  async function deleteComment(id: string) {
    await fetch(`/api/comments/${id}`, { method: 'DELETE' })
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div>
      <h2 className="text-cinema-muted text-xs font-bold tracking-widest uppercase mb-4">
        Comments <span className="text-cinema-dim">({comments.length})</span>
      </h2>

      {currentUserId && (
        <form onSubmit={postComment} className="mb-5 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Leave a comment…"
            maxLength={1000}
            className="flex-1 bg-black border border-cinema-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cinema-muted transition-colors"
          />
          <button
            type="submit"
            disabled={posting || !text.trim()}
            className="bg-cinema-surface border border-cinema-border text-cinema-muted text-sm px-4 py-2 rounded hover:border-cinema-muted hover:text-white transition-colors disabled:opacity-40"
          >
            {posting ? '…' : 'Post'}
          </button>
        </form>
      )}

      {comments.length === 0 ? (
        <p className="text-cinema-dim text-sm">No comments yet.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="bg-cinema-surface border border-cinema-border rounded-lg px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm leading-relaxed">{c.content}</p>
                  <p className="text-cinema-dim text-xs mt-1.5">
                    {c.user.name} · {new Date(c.createdAt).toLocaleDateString('en-SE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {(isAdmin) && (
                  <button
                    onClick={() => deleteComment(c.id)}
                    className="text-cinema-dim hover:text-cinema-red text-xs transition-colors flex-shrink-0"
                    title="Delete comment"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
