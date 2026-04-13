import Link from 'next/link'
import Image from 'next/image'
import { tmdbPosterUrl } from '@/lib/tmdb'

interface Props {
  franchise: {
    id: string
    slug: string
    name: string
    heroImageUrl: string | null
    movies: { id: string }[]
  }
  seen: number
  avgRating: number | null
}

export default function FranchiseCard({ franchise, seen, avgRating }: Props) {
  const total = franchise.movies.length
  const allSeen = seen === total && total > 0
  const noneSeen = seen === 0

  return (
    <Link href={`/franchise/${franchise.slug}`} className="group block">
      <div className="bg-cinema-surface border border-cinema-border rounded-lg overflow-hidden hover:border-cinema-muted transition-colors">
        <div className="h-20 relative overflow-hidden">
          {franchise.heroImageUrl ? (
            <Image
              src={franchise.heroImageUrl}
              alt={franchise.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-cinema-red/30 to-black" />
          )}
        </div>
        <div className="p-3">
          <p className="text-white font-bold text-xs truncate">{franchise.name}</p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-cinema-dim text-[10px]">{total} films</p>
            {avgRating !== null && (
              <p className="text-cinema-gold text-[10px] font-medium">★ {avgRating.toFixed(1)}</p>
            )}
          </div>
          <p
            className={`text-[10px] mt-1.5 font-medium ${
              allSeen ? 'text-green-500' : noneSeen ? 'text-cinema-dim' : 'text-cinema-red'
            }`}
          >
            {Array.from({ length: total }, (_, i) => (
              <span key={i}>{i < seen ? '●' : '○'}</span>
            ))}{' '}
            {seen}/{total}
          </p>
        </div>
      </div>
    </Link>
  )
}
