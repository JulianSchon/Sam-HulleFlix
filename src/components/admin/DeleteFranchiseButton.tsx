'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteFranchiseButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete "${name}" and all its movies and trivia?`)) return
    setLoading(true)
    await fetch(`/api/admin/franchises/${id}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-cinema-red hover:opacity-80 text-xs px-3 py-1.5 border border-red-900/50 rounded transition-opacity disabled:opacity-50"
    >
      {loading ? '…' : 'Delete'}
    </button>
  )
}
