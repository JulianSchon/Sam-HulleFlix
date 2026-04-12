import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import FranchiseCard from '@/components/FranchiseCard'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  const franchises = await prisma.franchise.findMany({
    include: { movies: { select: { id: true } } },
    orderBy: [{ featured: 'desc' }, { name: 'asc' }],
  })

  const seenMap: Record<string, number> = {}

  if (session?.user?.id) {
    const userMovies = await prisma.userMovie.findMany({
      where: { userId: session.user.id, watched: true },
      select: { movieId: true },
    })

    const watchedIds = new Set(userMovies.map((um) => um.movieId))

    for (const f of franchises) {
      seenMap[f.id] = f.movies.filter((m) => watchedIds.has(m.id)).length
    }
  }

  const featured = franchises.find((f) => f.featured) ?? franchises[0]
  const rest = franchises.filter((f) => f.id !== featured?.id)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero */}
      {featured && (
        <div className="relative rounded-xl overflow-hidden mb-10 bg-gradient-to-b from-cinema-red/10 to-cinema-bg border border-cinema-border">
          {featured.heroImageUrl && (
            <div className="absolute inset-0">
              <Image
                src={featured.heroImageUrl}
                alt={featured.name}
                fill
                className="object-cover opacity-50"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-black/20" />
            </div>
          )}
          <div className="relative px-8 py-10">
            <p className="text-cinema-muted text-xs tracking-widest uppercase mb-2">Featured Franchise</p>
            <h1 className="text-white font-black text-4xl tracking-wide mb-2">{featured.name}</h1>
            <p className="text-cinema-muted text-sm mb-1">
              {featured.movies.length} films
            </p>
            <p className="text-cinema-muted text-sm max-w-lg mb-6 line-clamp-2">{featured.description}</p>
            <div className="flex items-center gap-3">
              <Link
                href={`/franchise/${featured.slug}`}
                className="bg-cinema-red text-white font-bold text-sm px-5 py-2.5 rounded hover:opacity-80 transition-opacity"
              >
                View Franchise
              </Link>
              {session && (
                <span className="bg-black/50 border border-cinema-border text-cinema-muted text-sm px-4 py-2.5 rounded">
                  {seenMap[featured.id] ?? 0} / {featured.movies.length} seen
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div>
        <h2 className="text-cinema-muted text-xs tracking-widest uppercase mb-4">All Franchises</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...(featured ? [featured] : []), ...rest].map((f) => (
            <FranchiseCard key={f.id} franchise={f} seen={seenMap[f.id] ?? 0} />
          ))}
        </div>
      </div>
    </div>
  )
}
