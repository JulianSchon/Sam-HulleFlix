import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const TMDB_KEY = process.env.TMDB_API_KEY

async function getCollection(id: number) {
  const res = await fetch(`https://api.themoviedb.org/3/collection/${id}?api_key=${TMDB_KEY}&language=en-US`)
  const data = await res.json() as any
  return (data.parts ?? []).sort((a: any, b: any) =>
    (a.release_date ?? '').localeCompare(b.release_date ?? '')
  ) as { id: number; title: string; release_date: string }[]
}

const fixes = [
  { slug: 'predator', correctCollectionId: 399 },
  { slug: 'conan', correctCollectionId: 43055 },
]

// Also remove the unreleased Mad Max: The Wasteland placeholder
const unreleased = ['Mad Max: The Wasteland']

async function main() {
  // Fix wrong collections
  for (const fix of fixes) {
    const franchise = await prisma.franchise.findUnique({ where: { slug: fix.slug }, include: { movies: true } })
    if (!franchise) { console.log(`${fix.slug} not found`); continue }

    console.log(`Fixing ${franchise.name} — deleting ${franchise.movies.length} wrong movies...`)
    await prisma.movie.deleteMany({ where: { franchiseId: franchise.id } })
    await prisma.franchise.update({ where: { id: franchise.id }, data: { tmdbCollectionId: fix.correctCollectionId } })

    const parts = await getCollection(fix.correctCollectionId)
    for (let i = 0; i < parts.length; i++) {
      await prisma.movie.create({
        data: { tmdbId: parts[i].id, franchiseId: franchise.id, sortOrder: i },
      })
      console.log(`  + ${parts[i].title} (${parts[i].release_date?.slice(0, 4) ?? '?'})`)
    }
  }

  // Remove unreleased placeholder from Mad Max
  const madMax = await prisma.franchise.findUnique({ where: { slug: 'mad-max' } })
  if (madMax) {
    // Find the movie with no release date (the placeholder)
    const movies = await prisma.movie.findMany({ where: { franchiseId: madMax.id } })
    for (const m of movies) {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${m.tmdbId}?api_key=${TMDB_KEY}`)
      const data = await res.json() as any
      if (!data.release_date || unreleased.includes(data.title)) {
        await prisma.movie.delete({ where: { id: m.id } })
        console.log(`Removed unreleased: ${data.title}`)
      }
    }
  }

  // Also add missing Alien prequels (Prometheus, Alien: Covenant) and Creed films
  // Alien franchise — check if prequels need adding
  console.log('\nChecking Alien for Prometheus/Covenant...')
  const alien = await prisma.franchise.findUnique({ where: { slug: 'alien' }, include: { movies: true } })
  if (alien) {
    const prometheusId = 70981
    const covenantId = 395992
    const existing = alien.movies.map(m => m.tmdbId)
    if (!existing.includes(prometheusId)) {
      const count = alien.movies.length
      await prisma.movie.create({ data: { tmdbId: prometheusId, franchiseId: alien.id, sortOrder: count } })
      console.log('  + Prometheus (2012)')
    }
    if (!existing.includes(covenantId)) {
      const count = (await prisma.movie.count({ where: { franchiseId: alien.id } }))
      await prisma.movie.create({ data: { tmdbId: covenantId, franchiseId: alien.id, sortOrder: count } })
      console.log('  + Alien: Covenant (2017)')
    }
  }

  // Rocky/Creed — add Creed I, II, III
  console.log('\nChecking Rocky/Creed for Creed films...')
  const rocky = await prisma.franchise.findUnique({ where: { slug: 'rocky-creed' }, include: { movies: true } })
  if (rocky) {
    const creedFilms = [{ id: 267935, title: 'Creed', year: '2015' }, { id: 481767, title: 'Creed II', year: '2018' }, { id: 802425, title: 'Creed III', year: '2023' }]
    const existing = rocky.movies.map(m => m.tmdbId)
    for (const c of creedFilms) {
      if (!existing.includes(c.id)) {
        const count = await prisma.movie.count({ where: { franchiseId: rocky.id } })
        await prisma.movie.create({ data: { tmdbId: c.id, franchiseId: rocky.id, sortOrder: count } })
        console.log(`  + ${c.title} (${c.year})`)
      }
    }
  }

  console.log('\nDone.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
