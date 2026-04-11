'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Invalid email or password')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-cinema-red font-black tracking-[3px] text-2xl">SAM-HULLE-FLIX</h1>
          <p className="text-cinema-muted text-sm mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-cinema-surface border border-cinema-border rounded-lg p-6 space-y-4">
          {error && (
            <p className="text-cinema-red text-sm bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-xs text-cinema-muted mb-1.5 font-medium uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black border border-cinema-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cinema-red transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-cinema-muted mb-1.5 font-medium uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black border border-cinema-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cinema-red transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cinema-red text-white font-bold py-2.5 rounded text-sm hover:opacity-80 transition-opacity disabled:opacity-50 mt-2"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-cinema-dim text-xs mt-4">
          Have an invite?{' '}
          <Link href="/register" className="text-cinema-gold hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
