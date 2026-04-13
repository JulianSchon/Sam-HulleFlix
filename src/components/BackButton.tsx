'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      aria-label="Go back"
      className="w-8 h-8 rounded-full bg-cinema-red/10 border border-cinema-red/30 flex items-center justify-center text-cinema-red hover:bg-cinema-red/20 hover:border-cinema-red/60 transition-all mb-6"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  )
}
