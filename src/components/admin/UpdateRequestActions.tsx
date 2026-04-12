'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UpdateRequestActions({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'RESOLVED' | 'DISMISSED' | null>(null)

  async function update(status: 'RESOLVED' | 'DISMISSED') {
    setLoading(status)
    await fetch(`/api/admin/update-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      <button
        onClick={() => update('RESOLVED')}
        disabled={loading !== null}
        className="text-green-500 hover:text-green-400 text-xs border border-green-900/50 rounded px-2.5 py-1 transition-colors disabled:opacity-40"
      >
        {loading === 'RESOLVED' ? '…' : 'Resolve'}
      </button>
      <button
        onClick={() => update('DISMISSED')}
        disabled={loading !== null}
        className="text-cinema-dim hover:text-cinema-muted text-xs border border-cinema-border rounded px-2.5 py-1 transition-colors disabled:opacity-40"
      >
        {loading === 'DISMISSED' ? '…' : 'Dismiss'}
      </button>
    </div>
  )
}
