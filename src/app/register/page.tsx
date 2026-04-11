'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ inviteCode: '', name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Registration failed')
    } else {
      router.push('/login')
    }
  }

  const field = (key: keyof typeof form, label: string, type = 'text') => (
    <div>
      <label className="block text-xs text-cinema-muted mb-1.5 font-medium uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        required
        className="w-full bg-black border border-cinema-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cinema-gold transition-colors"
      />
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-cinema-red font-black tracking-[3px] text-2xl">SAM-HULLE-FLIX</h1>
          <p className="text-cinema-muted text-sm mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-cinema-surface border border-cinema-border rounded-lg p-6 space-y-4">
          {error && (
            <p className="text-cinema-red text-sm bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
              {error}
            </p>
          )}

          {field('inviteCode', 'Invite Code')}
          {field('name', 'Name')}
          {field('email', 'Email', 'email')}
          {field('password', 'Password', 'password')}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cinema-gold text-black font-bold py-2.5 rounded text-sm hover:opacity-80 transition-opacity disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-cinema-dim text-xs mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-cinema-gold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
