'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: string
  inviteCode: string | null
  createdAt: Date
}

export default function AdminUsersClient({ users }: { users: User[] }) {
  const router = useRouter()
  const [inviteCodes, setInviteCodes] = useState<Record<string, string>>({})

  async function generateInvite(userId: string) {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const data = await res.json()
    setInviteCodes((prev) => ({ ...prev, [userId]: data.inviteCode }))
    router.refresh()
  }

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    if (!confirm(`Change role to ${newRole}?`)) return
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-2">
      {users.map((u) => (
        <div key={u.id} className="bg-cinema-surface border border-cinema-border rounded-lg px-4 py-3 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">{u.name}</p>
            <p className="text-cinema-muted text-xs">{u.email}</p>
            {(u.inviteCode || inviteCodes[u.id]) && (
              <p className="text-cinema-gold text-xs mt-1">
                Invite: <span className="font-mono">{inviteCodes[u.id] ?? u.inviteCode}</span>
                <span className="text-cinema-dim ml-2">— share link: /register?invite={inviteCodes[u.id] ?? u.inviteCode}</span>
              </p>
            )}
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
            u.role === 'ADMIN' ? 'bg-cinema-gold/20 text-cinema-gold' : 'bg-cinema-border text-cinema-muted'
          }`}>
            {u.role}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => generateInvite(u.id)}
              className="text-cinema-blue text-xs px-3 py-1.5 border border-cinema-border rounded hover:border-cinema-muted transition-colors"
            >
              Gen Invite
            </button>
            <button
              onClick={() => toggleRole(u.id, u.role)}
              className="text-cinema-muted text-xs px-3 py-1.5 border border-cinema-border rounded hover:border-cinema-muted transition-colors"
            >
              Toggle Role
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
