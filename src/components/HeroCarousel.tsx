'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Franchise {
  id: string
  slug: string
  name: string
  description: string
  heroImageUrl: string | null
  movieCount: number
  seen: number
  isLoggedIn: boolean
}

export default function HeroCarousel({ franchises }: { franchises: Franchise[] }) {
  const [index, setIndex] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (franchises.length <= 1) return
    const timer = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setIndex((i) => (i + 1) % franchises.length)
        setFading(false)
      }, 400)
    }, 5000)
    return () => clearInterval(timer)
  }, [franchises.length])

  function goTo(i: number) {
    if (i === index) return
    setFading(true)
    setTimeout(() => {
      setIndex(i)
      setFading(false)
    }, 400)
  }

  const f = franchises[index]

  return (
    <div className="relative rounded-xl overflow-hidden mb-10 bg-gradient-to-b from-cinema-red/10 to-cinema-bg border border-cinema-border min-h-[220px]">
      {/* Background image */}
      <div
        className="absolute inset-0 transition-opacity duration-400"
        style={{ opacity: fading ? 0 : 1 }}
      >
        {f.heroImageUrl && (
          <>
            <Image
              src={f.heroImageUrl}
              alt={f.name}
              fill
              className="object-cover opacity-50"
              unoptimized
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-black/20" />
          </>
        )}
      </div>

      {/* Content */}
      <div
        className="relative px-4 py-6 md:px-8 md:py-10 transition-opacity duration-400"
        style={{ opacity: fading ? 0 : 1 }}
      >
        <p className="text-cinema-muted text-xs tracking-widest uppercase mb-2">Featured Franchise</p>
        <h1 className="text-white font-black text-2xl md:text-4xl tracking-wide mb-2">{f.name}</h1>
        <p className="text-cinema-muted text-sm mb-1">{f.movieCount} films</p>
        <p className="text-cinema-muted text-sm max-w-lg mb-4 md:mb-6 line-clamp-2">{f.description}</p>
        <div className="flex items-center gap-3">
          <Link
            href={`/franchise/${f.slug}`}
            className="bg-cinema-red text-white font-bold text-sm px-5 py-2.5 rounded hover:opacity-80 transition-opacity"
          >
            View Franchise
          </Link>
          {f.isLoggedIn && (
            <span className="bg-black/50 border border-cinema-border text-cinema-muted text-sm px-4 py-2.5 rounded">
              {f.seen} / {f.movieCount} seen
            </span>
          )}
        </div>
      </div>

      {/* Dots */}
      {franchises.length > 1 && (
        <div className="absolute bottom-4 right-6 flex gap-1.5">
          {franchises.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === index ? 'bg-white scale-110' : 'bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
