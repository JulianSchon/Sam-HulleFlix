import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getTmdbMovie, tmdbPosterUrl } from '@/lib/tmdb'
import Image from 'next/image'
import Link from 'next/link'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userMovies = await prisma.userMovie.findMany({
    where: { userId: session.user.id },
    include: {
      movie: {
        include: { franchise: { select: { name: true, slug: true } } },
      },
    },
  })

  const watched = userMovies.filter((um) => um.watched)
  const watchlist = userMovies.filter((um) => um.watchlist && !um.watched)
  const rated = userMovies.filter((um) => um.rating !== null)

  const franchisesSeen = new Set(watched.map((um) => um.movie.franchiseId))

  const avgByFranchise: Record<string, { name: string; slug: string; total: number; sum: number }> = {}
  for (const um of rated) {
    const { franchiseId, franchise } = um.movie
    if (!avgByFranchise[franchiseId]) {
      avgByFranchise[franchiseId] = { name: franchise.name, slug: franchise.slug, total: 0, sum: 0 }
    }
    avgByFranchise[franchiseId].total++
    avgByFranchise[franchiseId].sum += um.rating!
  }

  const favFranchise = Object.values(avgByFranchise).sort(
    (a, b) => b.sum / b.total - a.sum / a.total
  )[0]

  const watchedWithTmdb = await Promise.all(
    watched.slice(0, 20).map(async (um) => ({
      um,
      tmdb: await getTmdbMovie(um.movie.tmdbId),
    }))
  )

  const watchlistWithTmdb = await Promise.all(
    watchlist.slice(0, 20).map(async (um) => ({
      um,
      tmdb: await getTmdbMovie(um.movie.tmdbId),
    }))
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-white font-black text-2xl">{session.user.name}</h1>
        <p className="text-cinema-muted text-sm mt-1">{session.user.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-cinema-surface border border-cinema-border rounded-lg p-4 text-center">
          <p className="text-cinema-red font-black text-3xl">{watched.length}</p>
          <p className="text-cinema-muted text-xs mt-1 uppercase tracking-wider">Films Seen</p>
        </div>
        <div className="bg-cinema-surface border border-cinema-border rounded-lg p-4 text-center">
          <p className="text-cinema-gold font-black text-3xl">{franchisesSeen.size}</p>
          <p className="text-cinema-muted text-xs mt-1 uppercase tracking-wider">Franchises</p>
        </div>
        <div className="bg-cinema-surface border border-cinema-border rounded-lg p-4 text-center">
          <p className="text-cinema-blue font-black text-3xl">{watchlist.length}</p>
          <p className="text-cinema-muted text-xs mt-1 uppercase tracking-wider">Watchlist</p>
        </div>
        <div className="bg-cinema-surface border border-cinema-border rounded-lg p-4 text-center">
          {favFranchise ? (
            <>
              <p className="text-white font-black text-sm leading-tight">{favFranchise.name}</p>
              <p className="text-cinema-gold text-xs">
                {'★'.repeat(Math.round(favFranchise.sum / favFranchise.total))}
              </p>
            </>
          ) : (
            <p className="text-cinema-dim text-sm">—</p>
          )}
          <p className="text-cinema-muted text-xs mt-1 uppercase tracking-wider">Fav Franchise</p>
        </div>
      </div>

      {/* Watchlist */}
      <Section title="Watchlist" count={watchlist.length}>
        <MovieGrid items={watchlistWithTmdb} />
      </Section>

      {/* Seen */}
      <Section title="Seen" count={watched.length}>
        <MovieGrid items={watchedWithTmdb} showRating />
      </Section>
    </div>
  )
}

function Section({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: React.ReactNode
}) {
  return (
    <div className="mb-10">
      <h2 className="text-cinema-muted text-xs uppercase tracking-widest mb-4">
        {title} <span className="text-cinema-dim">({count})</span>
      </h2>
      {count === 0 ? (
        <p className="text-cinema-dim text-sm">Nothing here yet.</p>
      ) : (
        children
      )}
    </div>
  )
}

function MovieGrid({
  items,
  showRating,
}: {
  items: { um: { rating: number | null; movie: { id: string; franchise: { slug: string } } }; tmdb: Awaited<ReturnType<typeof getTmdbMovie>> }[]
  showRating?: boolean
}) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      {items.map(({ um, tmdb }) => (
        <Link key={um.movie.id} href={`/movie/${um.movie.id}`} className="group block">
          <div className="relative aspect-[2/3] rounded overflow-hidden bg-cinema-surface">
            {tmdb?.poster_path && (
              <Image
                src={tmdbPosterUrl(tmdb.poster_path, 'w185')}
                alt={tmdb.title ?? ''}
                fill
                className="object-cover group-hover:opacity-80 transition-opacity"
                unoptimized
              />
            )}
          </div>
          {showRating && um.rating && (
            <p className="text-cinema-gold text-[10px] mt-1 text-center">
              {'★'.repeat(um.rating)}
            </p>
          )}
        </Link>
      ))}
    </div>
  )
}
