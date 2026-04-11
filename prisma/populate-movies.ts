import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const TMDB_KEY = process.env.TMDB_API_KEY

async function getCollection(id: number) {
  const res = await fetch(`https://api.themoviedb.org/3/collection/${id}?api_key=${TMDB_KEY}&language=en-US`)
  if (!res.ok) return null
  const data = await res.json() as any
  const parts = (data.parts ?? []).sort((a: any, b: any) =>
    (a.release_date ?? '').localeCompare(b.release_date ?? '')
  )
  return parts as { id: number; title: string; release_date: string }[]
}

async function main() {
  const franchises = await prisma.franchise.findMany({
    where: { tmdbCollectionId: { not: null } },
    include: { _count: { select: { movies: true } } },
  })

  for (const franchise of franchises) {
    if (franchise._count.movies > 0) {
      console.log(`✓ ${franchise.name} already has ${franchise._count.movies} movies, skipping`)
      continue
    }

    console.log(`Fetching ${franchise.name} (collection ${franchise.tmdbCollectionId})...`)
    const parts = await getCollection(franchise.tmdbCollectionId!)

    if (!parts || parts.length === 0) {
      console.log(`  ⚠ No results for ${franchise.name}`)
      continue
    }

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const existing = await prisma.movie.findUnique({ where: { tmdbId: part.id } })
      if (existing) {
        console.log(`  - ${part.title} already exists`)
        continue
      }
      await prisma.movie.create({
        data: { tmdbId: part.id, franchiseId: franchise.id, sortOrder: i },
      })
      console.log(`  + ${part.title} (${part.release_date?.slice(0, 4) ?? '?'})`)
    }
  }

  console.log('\nDone.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
