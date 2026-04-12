'use client'

import { useState } from 'react'

export default function UpdateRequestButton({ franchiseId }: { franchiseId: string }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    await fetch('/api/update-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ franchiseId, content: text.trim() }),
    })
    setSending(false)
    setSent(true)
    setText('')
    setTimeout(() => { setSent(false); setOpen(false) }, 2000)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-cinema-dim hover:text-cinema-muted text-xs border border-cinema-border rounded px-3 py-1.5 transition-colors"
      >
        Request an update
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="bg-cinema-surface border border-cinema-border rounded-lg p-4 space-y-3">
      <p className="text-cinema-muted text-xs font-bold uppercase tracking-wider">Request an Update</p>
      <p className="text-cinema-dim text-xs">Spotted a missing film, wrong info, or want something added? Let us know.</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe what needs updating…"
        maxLength={2000}
        rows={3}
        className="w-full bg-black border border-cinema-border rounded px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-cinema-muted transition-colors"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={sending || sent || !text.trim()}
          className="bg-cinema-red text-white text-sm font-bold px-4 py-2 rounded hover:opacity-80 disabled:opacity-50 transition-opacity"
        >
          {sent ? '✓ Sent' : sending ? 'Sending…' : 'Send Request'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setText('') }}
          className="text-cinema-muted text-sm px-4 py-2 border border-cinema-border rounded hover:border-cinema-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
