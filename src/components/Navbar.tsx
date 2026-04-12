'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b border-cinema-border bg-black/60 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-cinema-red font-black tracking-[2px] md:tracking-[3px] text-base md:text-lg hover:opacity-80 transition-opacity"
        >
          SAM-HULLE-FLIX
        </Link>

        <div className="flex items-center gap-3 md:gap-6 text-sm">
          <Link href="/" className="text-cinema-muted hover:text-white transition-colors">
            Browse
          </Link>

          {session ? (
            <>
              <Link href="/profile" className="text-cinema-gold hover:opacity-80 transition-opacity">
                Profile
              </Link>
              {session.user.role === 'ADMIN' && (
                <Link href="/admin" className="text-cinema-muted hover:text-white transition-colors">
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-cinema-dim hover:text-cinema-muted transition-colors text-xs"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-cinema-red text-white text-xs font-bold px-4 py-1.5 rounded hover:opacity-80 transition-opacity"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
