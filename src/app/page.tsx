import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import FranchiseCard from '@/components/FranchiseCard'
import HeroCarousel from '@/components/HeroCarousel'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  const franchises = await prisma.franchise.findMany({
    include: { movies: { select: { id: true, mainStoryline: true } } },
    orderBy: [{ featured: 'desc' }, { name: 'asc' }],
  })

  const mainStoryIds = franchises.flatMap((f) => f.movies.filter((m) => m.mainStoryline).map((m) => m.id))
  const allRatings = await prisma.userMovie.findMany({
    where: { movieId: { in: mainStoryIds }, rating: { not: null } },
    select: { movieId: true, rating: true },
  })
  const ratingsByMovieId = new Map<string, number[]>()
  for (const r of allRatings) {
    const arr = ratingsByMovieId.get(r.movieId) ?? []
    arr.push(r.rating as number)
    ratingsByMovieId.set(r.movieId, arr)
  }
  const franchiseAvgRating: Record<string, number | null> = {}
  for (const f of franchises) {
    const vals = f.movies
      .filter((m) => m.mainStoryline)
      .flatMap((m) => ratingsByMovieId.get(m.id) ?? [])
    franchiseAvgRating[f.id] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }

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

  const featuredFranchises = franchises.filter((f) => f.featured)
  const heroFranchises = (featuredFranchises.length > 0 ? featuredFranchises : franchises.slice(0, 5)).map((f) => ({
    id: f.id,
    slug: f.slug,
    name: f.name,
    description: f.description,
    heroImageUrl: f.heroImageUrl,
    movieCount: f.movies.length,
    seen: seenMap[f.id] ?? 0,
    isLoggedIn: !!session,
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero carousel */}
      <HeroCarousel franchises={heroFranchises} />

      {/* Grid */}
      <div>
        <h2 className="text-cinema-muted text-xs tracking-widest uppercase mb-4">All Franchises</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {franchises.map((f) => (
            <FranchiseCard key={f.id} franchise={f} seen={seenMap[f.id] ?? 0} avgRating={franchiseAvgRating[f.id] ?? null} />
          ))}
        </div>
      </div>
    </div>
  )
}
