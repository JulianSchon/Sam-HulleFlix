'use client'

import { useState } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
  inviteCode: string | null
  createdAt: Date
}

export default function AdminUsersClient({ users: initialUsers }: { users: User[] }) {

  const [users, setUsers] = useState(initialUsers)
  const [inviteCodes, setInviteCodes] = useState<Record<string, string>>({})

  // Create user form state
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setCreateError('')

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...form }),
    })
    const data = await res.json()
    setCreating(false)

    if (!res.ok) {
      setCreateError(data.error ?? 'Failed to create user')
    } else {
      setUsers((prev) => [data, ...prev])
      setForm({ name: '', email: '', password: '', role: 'USER' })
      setShowForm(false)
    }
  }

  async function generateInvite(userId: string) {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'invite', userId }),
    })
    const data = await res.json()
    setInviteCodes((prev) => ({ ...prev, [userId]: data.inviteCode }))
  }

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    if (!confirm(`Change role to ${newRole}?`)) return
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u))
  }

  async function deleteUser(userId: string, name: string) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    }
  }

  return (
    <div className="space-y-4">
      {/* Create user button */}
      <div>
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="bg-cinema-red text-white text-sm font-bold px-4 py-2 rounded hover:opacity-80 transition-opacity"
          >
            + Create User
          </button>
        ) : (
          <form
            onSubmit={createUser}
            className="bg-cinema-surface border border-cinema-border rounded-lg p-5 space-y-3"
          >
            <p className="text-cinema-muted text-xs uppercase tracking-wider font-bold">New User</p>

            {createError && (
              <p className="text-cinema-red text-sm">{createError}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-cinema-muted mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full bg-black border border-cinema-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cinema-red"
                />
              </div>
              <div>
                <label className="block text-xs text-cinema-muted mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full bg-black border border-cinema-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cinema-red"
                />
              </div>
              <div>
                <label className="block text-xs text-cinema-muted mb-1">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full bg-black border border-cinema-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cinema-red"
                />
              </div>
              <div>
                <label className="block text-xs text-cinema-muted mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-black border border-cinema-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cinema-red"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={creating}
                className="bg-cinema-red text-white text-sm font-bold px-4 py-2 rounded hover:opacity-80 disabled:opacity-50"
              >
                {creating ? 'Creating…' : 'Create User'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setCreateError('') }}
                className="text-cinema-muted text-sm px-4 py-2 border border-cinema-border rounded hover:border-cinema-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* User list */}
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="bg-cinema-surface border border-cinema-border rounded-lg px-4 py-3 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">{u.name}</p>
              <p className="text-cinema-muted text-xs">{u.email}</p>
              {(u.inviteCode || inviteCodes[u.id]) && (
                <p className="text-cinema-gold text-xs mt-1 font-mono">
                  Invite code: {inviteCodes[u.id] ?? u.inviteCode}
                </p>
              )}
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 ${
              u.role === 'ADMIN' ? 'bg-cinema-gold/20 text-cinema-gold' : 'bg-cinema-border text-cinema-muted'
            }`}>
              {u.role}
            </span>
            <div className="flex gap-2 flex-shrink-0">
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
              <button
                onClick={() => deleteUser(u.id, u.name)}
                className="text-cinema-dim hover:text-cinema-red text-xs px-3 py-1.5 border border-cinema-border rounded hover:border-cinema-red/50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
