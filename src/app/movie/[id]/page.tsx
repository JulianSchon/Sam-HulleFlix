import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getTmdbMovie, getTmdbTrailerKey, getTmdbProviders, tmdbBackdropUrl, tmdbPosterUrl } from '@/lib/tmdb'
import Image from 'next/image'
import Link from 'next/link'
import TrailerEmbed from '@/components/TrailerEmbed'
import UserMovieActions from '@/components/UserMovieActions'
import StreamingBadges from '@/components/StreamingBadges'

export default async function MoviePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  const movie = await prisma.movie.findUnique({
    where: { id: params.id },
    include: {
      franchise: { select: { name: true, slug: true } },
      trivia: true,
    },
  })

  if (!movie) notFound()

  const [tmdb, trailerKey, providers] = await Promise.all([
    getTmdbMovie(movie.tmdbId),
    getTmdbTrailerKey(movie.tmdbId),
    getTmdbProviders(movie.tmdbId),
  ])

  const [userMovie, allRatings] = await Promise.all([
    session?.user?.id
      ? prisma.userMovie.findUnique({
          where: { userId_movieId: { userId: session.user.id, movieId: movie.id } },
        })
      : Promise.resolve(null),
    prisma.userMovie.findMany({
      where: { movieId: movie.id, rating: { not: null } },
      include: { user: { select: { name: true } } },
      orderBy: { watchedAt: 'desc' },
    }),
  ])

  const communityRating =
    allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + (r.rating ?? 0), 0) / allRatings.length
      : null

  const reviews = allRatings.filter((r) => r.review?.trim())

  const flatrate = providers.flatrate ?? []
  const rent = providers.rent ?? []
  const buy = providers.buy ?? []
  const fallbackLink = providers.link
  const cast = tmdb?.credits?.cast?.slice(0, 10) ?? []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-cinema-dim text-xs mb-6">
        <Link href={`/franchise/${movie.franchise.slug}`} className="hover:text-cinema-muted transition-colors">
          {movie.franchise.name}
        </Link>
        <span className="mx-2">›</span>
        <span className="text-cinema-muted">{tmdb?.title ?? 'Movie'}</span>
      </div>

      {/* Backdrop */}
      {tmdb?.backdrop_path && (
        <div className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-8">
          <Image
            src={tmdbBackdropUrl(tmdb.backdrop_path)}
            alt={tmdb.title}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-cinema-bg/40 to-transparent" />
        </div>
      )}

      <div className="grid md:grid-cols-[200px_1fr] gap-6 md:gap-8">
        {/* Poster */}
        <div className="max-w-[200px] mx-auto w-full md:max-w-none md:mx-0">
          <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-cinema-surface mb-4">
            {tmdb?.poster_path && (
              <Image
                src={tmdbPosterUrl(tmdb.poster_path, 'w342')}
                alt={tmdb.title}
                fill
                className="object-cover"
                unoptimized
              />
            )}
          </div>

          {/* Streaming */}
          {(flatrate.length > 0 || rent.length > 0 || buy.length > 0) && (
            <div className="mb-4 space-y-2">
              <p className="text-xs text-cinema-muted uppercase tracking-wider">Where to Watch</p>
              {flatrate.length > 0 && (
                <div>
                  <p className="text-[10px] text-cinema-dim uppercase tracking-wider mb-1">Stream</p>
                  <StreamingBadges providers={flatrate} movieTitle={tmdb?.title} fallbackLink={fallbackLink} />
                </div>
              )}
              {rent.length > 0 && (
                <div>
                  <p className="text-[10px] text-cinema-dim uppercase tracking-wider mb-1">Rent</p>
                  <StreamingBadges providers={rent} movieTitle={tmdb?.title} fallbackLink={fallbackLink} />
                </div>
              )}
              {buy.length > 0 && (
                <div>
                  <p className="text-[10px] text-cinema-dim uppercase tracking-wider mb-1">Buy</p>
                  <StreamingBadges providers={buy} movieTitle={tmdb?.title} fallbackLink={fallbackLink} />
                </div>
              )}
            </div>
          )}
          {flatrate.length === 0 && rent.length === 0 && buy.length === 0 && (
            <p className="text-cinema-dim text-xs mb-4">Not available for streaming in SE</p>
          )}

          {/* TMDB score */}
          {tmdb?.vote_average && (
            <p className="text-cinema-muted text-sm">
              TMDB{' '}
              <span className="text-cinema-gold font-bold">
                {tmdb.vote_average.toFixed(1)}
              </span>
              /10
            </p>
          )}
        </div>

        {/* Main content */}
        <div>
          <h1 className="text-white font-black text-2xl md:text-3xl mb-1">{tmdb?.title ?? 'Movie'}</h1>
          <div className="flex gap-3 text-cinema-muted text-sm mb-4 flex-wrap">
            {tmdb?.release_date && <span>{tmdb.release_date.slice(0, 4)}</span>}
            {tmdb?.runtime && <span>• {tmdb.runtime} min</span>}
            {tmdb?.genres?.map((g) => (
              <span key={g.id} className="bg-cinema-surface border border-cinema-border rounded px-2 py-0.5 text-xs">
                {g.name}
              </span>
            ))}
          </div>

          <p className="text-cinema-muted text-sm leading-relaxed mb-6">{tmdb?.overview}</p>

          {/* User actions */}
          <div className="bg-cinema-surface border border-cinema-border rounded-lg p-4 mb-6">
            <UserMovieActions
              movieId={movie.id}
              communityRating={communityRating}
              ratingCount={allRatings.length}
              initial={{
                watched: userMovie?.watched ?? false,
                watchlist: userMovie?.watchlist ?? false,
                rating: userMovie?.rating ?? null,
                review: userMovie?.review ?? null,
              }}
            />
          </div>

          {/* Cast */}
          {cast.length > 0 && (
            <div className="mb-6">
              <h2 className="text-cinema-muted text-xs uppercase tracking-wider mb-3">Cast</h2>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {cast.map((actor) => (
                  <div key={actor.id} className="flex-shrink-0 w-16 text-center">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-cinema-surface mb-1">
                      {actor.profile_path && (
                        <Image
                          src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                          alt={actor.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      )}
                    </div>
                    <p className="text-white text-[10px] font-medium leading-tight">{actor.name}</p>
                    <p className="text-cinema-dim text-[9px] leading-tight mt-0.5">{actor.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trailer */}
      {trailerKey && (
        <div className="mt-8">
          <h2 className="text-cinema-muted text-xs uppercase tracking-wider mb-3">Official Trailer</h2>
          <TrailerEmbed trailerKey={trailerKey} />
        </div>
      )}

      {/* Community reviews */}
      {reviews.length > 0 && (
        <div className="mt-8 bg-cinema-surface border border-cinema-border rounded-lg p-5">
          <h2 className="text-cinema-muted text-xs font-bold tracking-widest uppercase mb-4">
            Community Reviews <span className="text-cinema-dim">({reviews.length})</span>
          </h2>
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={`${r.userId}-${r.movieId}`} className="border-l border-cinema-border pl-4">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-white text-sm font-bold">{r.user.name}</span>
                  {r.rating && (
                    <span className="text-cinema-gold text-sm">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                  )}
                </div>
                <p className="text-cinema-muted text-sm leading-relaxed">{r.review}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Film-level trivia */}
      {movie.trivia.length > 0 && (
        <div className="mt-8 bg-cinema-surface border border-cinema-border rounded-lg p-5">
          <h2 className="text-cinema-gold text-xs font-bold tracking-widest uppercase mb-4">Trivia</h2>
          <div className="space-y-3">
            {movie.trivia.map((t) => (
              <p key={t.id} className="text-cinema-muted text-sm leading-relaxed border-l border-cinema-border pl-4">
                {t.content}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
