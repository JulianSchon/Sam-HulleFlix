import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getTmdbMovie, getTmdbProviders, tmdbPosterUrl } from '@/lib/tmdb'
import Image from 'next/image'
import Link from 'next/link'
import StreamingBadges from '@/components/StreamingBadges'

export default async function FranchisePage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)

  const franchise = await prisma.franchise.findUnique({
    where: { slug: params.slug },
    include: {
      movies: { orderBy: { sortOrder: 'asc' } },
      trivia: true,
    },
  })

  if (!franchise) notFound()

  const userMovies = session?.user?.id
    ? await prisma.userMovie.findMany({
        where: {
          userId: session.user.id,
          movieId: { in: franchise.movies.map((m) => m.id) },
        },
      })
    : []

  const userMovieMap = Object.fromEntries(userMovies.map((um) => [um.movieId, um]))

  const moviesWithTmdb = await Promise.all(
    franchise.movies.map(async (movie) => {
      const [tmdb, providers] = await Promise.all([
        getTmdbMovie(movie.tmdbId),
        getTmdbProviders(movie.tmdbId),
      ])
      return { movie, tmdb, providers: providers.flatrate ?? [] }
    })
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-cinema-muted text-xs tracking-widest uppercase mb-1">Franchise</p>
        <h1 className="text-white font-black text-3xl tracking-wide">{franchise.name}</h1>
        <p className="text-cinema-muted text-sm mt-2">
          {franchise.movies.length} films •{' '}
          {moviesWithTmdb[0]?.tmdb?.release_date?.slice(0, 4)} –{' '}
          {moviesWithTmdb.at(-1)?.tmdb?.release_date?.slice(0, 4)}
        </p>
        <p className="text-cinema-muted text-sm mt-3 max-w-2xl">{franchise.description}</p>
      </div>

      {/* Watch order guide */}
      <div className="mb-8 bg-cinema-surface border-l-2 border-cinema-gold rounded-r-lg px-5 py-4">
        <p className="text-cinema-gold text-xs font-bold tracking-widest uppercase mb-2">Watch Order</p>
        <p className="text-cinema-muted text-sm leading-relaxed">{franchise.watchOrderGuide}</p>
      </div>

      {/* Film list */}
      <div className="space-y-3 mb-10">
        {moviesWithTmdb.map(({ movie, tmdb, providers }, i) => {
          const um = userMovieMap[movie.id]
          const watched = um?.watched ?? false
          const onWatchlist = um?.watchlist ?? false
          const rating = um?.rating

          return (
            <Link
              key={movie.id}
              href={`/movie/${movie.id}`}
              className="flex items-center gap-4 bg-cinema-surface border border-cinema-border rounded-lg p-3 hover:border-cinema-muted transition-colors"
            >
              <span className="text-cinema-dim text-xs w-4 flex-shrink-0 text-right">{i + 1}</span>
              <div className="relative w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-cinema-border">
                {tmdb?.poster_path && (
                  <Image
                    src={tmdbPosterUrl(tmdb.poster_path, 'w92')}
                    alt={tmdb.title ?? movie.tmdbId.toString()}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${watched ? 'text-white' : 'text-cinema-muted'}`}>
                  {tmdb?.title ?? `Movie ${movie.tmdbId}`}
                </p>
                <p className="text-cinema-dim text-xs mt-0.5">
                  {tmdb?.release_date?.slice(0, 4)} • {tmdb?.runtime ?? '?'} min
                </p>
                {rating && (
                  <p className="text-cinema-gold text-xs mt-0.5">
                    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                  </p>
                )}
                {movie.watchOrderNote && (
                  <p className="text-cinema-dim text-xs mt-1 italic">{movie.watchOrderNote}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                {watched && (
                  <span className="bg-green-950/50 border border-green-900/50 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded">
                    SEEN
                  </span>
                )}
                {onWatchlist && !watched && (
                  <span className="bg-blue-950/50 border border-blue-900/50 text-cinema-blue text-[10px] font-bold px-2 py-0.5 rounded">
                    WATCHLIST
                  </span>
                )}
                {!movie.mainStoryline && (
                  <span className="bg-cinema-border text-cinema-dim text-[10px] font-bold px-2 py-0.5 rounded">
                    SIDE STORY
                  </span>
                )}
                <StreamingBadges providers={providers} />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Trivia */}
      {franchise.trivia.length > 0 && (
        <div className="bg-cinema-surface border border-cinema-border rounded-lg p-5">
          <h2 className="text-cinema-gold text-xs font-bold tracking-widest uppercase mb-4">
            Franchise Trivia
          </h2>
          <div className="space-y-4">
            {franchise.trivia.map((t) => (
              <p key={t.id} className="text-cinema-muted text-sm leading-relaxed border-l border-cinema-border pl-4">
                {t.content}
                {t.source && (
                  <span className="text-cinema-dim text-xs ml-2">— {t.source}</span>
                )}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
