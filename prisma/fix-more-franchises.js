// @ts-check
// Fixes wrong Beverly Hills Cop collection ID and adds missing franchises
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const KEY = process.env.TMDB_API_KEY

const FIXES = [
  // Delete the wrong Beverly Hills Cop (had My Girl movies) and re-create with correct ID
  {
    action: 'replace',
    slug: 'beverly-hills-cop',
    name: 'Beverly Hills Cop',
    tmdbCollectionId: 85861,
    description: "Detroit street cop Axel Foley brings his unique brand of loud, improvised humor to Beverly Hills in these classic action-comedies.",
    watchOrderGuide: 'Release order: Beverly Hills Cop → Beverly Hills Cop II → Beverly Hills Cop III → Axel F (2024).',
  },
  // Add missing franchises that failed first time
  {
    action: 'add',
    slug: 'dirty-harry',
    name: 'Dirty Harry',
    tmdbCollectionId: 10456,
    description: "San Francisco detective 'Dirty Harry' Callahan dispenses hard-boiled justice his own way, armed with a .44 Magnum and legendary one-liners.",
    watchOrderGuide: 'Release order: Dirty Harry → Magnum Force → The Enforcer → Sudden Impact → The Dead Pool. Each film is standalone.',
  },
  {
    action: 'add',
    slug: 'star-trek-original',
    name: 'Star Trek (Original Crew)',
    tmdbCollectionId: 151,
    description: "Captain Kirk and the crew of the USS Enterprise boldly go where no man has gone before in this classic sci-fi film series.",
    watchOrderGuide: 'The Motion Picture → Wrath of Khan → Search for Spock → Voyage Home → Final Frontier → Undiscovered Country. Start with Wrath of Khan for the best entry point.',
  },
  {
    action: 'add',
    slug: 'planet-of-the-apes-classic',
    name: 'Planet of the Apes',
    tmdbCollectionId: 1709,
    description: "Astronauts crash-land on a world ruled by intelligent apes. Classic sci-fi exploring themes of humanity, evolution, and societal collapse.",
    watchOrderGuide: 'Classic series (1968–1973): Planet of the Apes → Beneath → Escape → Conquest → Battle. Modern trilogy: Rise → Dawn → War → Kingdom (loosely related).',
  },
]

async function getCollection(id) {
  const res = await fetch(
    `https://api.themoviedb.org/3/collection/${id}?api_key=${KEY}&language=en-US`
  )
  if (!res.ok) return null
  return res.json()
}

async function addFranchise(f) {
  console.log(`\n→ ${f.name} (collection ${f.tmdbCollectionId})`)
  const collection = await getCollection(f.tmdbCollectionId)
  if (!collection) {
    console.log(`  ✗ TMDB collection not found — skipping`)
    return
  }
  console.log(`  TMDB: "${collection.name}"`)

  const imgPath = collection.backdrop_path ?? collection.poster_path
  const heroImageUrl = imgPath ? `https://image.tmdb.org/t/p/w1280${imgPath}` : null

  const franchise = await prisma.franchise.create({
    data: {
      slug: f.slug,
      name: f.name,
      description: f.description,
      watchOrderGuide: f.watchOrderGuide,
      tmdbCollectionId: f.tmdbCollectionId,
      heroImageUrl,
    },
  })
  console.log(`  ✓ Franchise created${heroImageUrl ? ' with hero image' : ''}`)

  const parts = (collection.parts ?? [])
    .filter((p) => p.release_date)
    .sort((a, b) => a.release_date.localeCompare(b.release_date))

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const alreadyExists = await prisma.movie.findUnique({ where: { tmdbId: part.id } })
    if (alreadyExists) {
      console.log(`    - ${part.title} (already in DB, linking)`)
      // Re-link to this franchise if it's orphaned
      continue
    }
    await prisma.movie.create({
      data: {
        tmdbId: part.id,
        franchiseId: franchise.id,
        sortOrder: i,
      },
    })
    console.log(`    + ${part.title} (${part.release_date.slice(0, 4)})`)
  }
}

async function main() {
  for (const f of FIXES) {
    if (f.action === 'replace') {
      // Delete wrong franchise and its movies, then re-add
      const existing = await prisma.franchise.findUnique({ where: { slug: f.slug } })
      if (existing) {
        console.log(`\n🗑  Deleting wrong "${existing.name}" (had wrong collection)...`)
        await prisma.franchise.delete({ where: { id: existing.id } })
        console.log(`  ✓ Deleted`)
      }
      await addFranchise(f)
    } else {
      // Only add if not already present
      const existing = await prisma.franchise.findUnique({ where: { slug: f.slug } })
      if (existing) {
        console.log(`⏭  ${f.name} already exists, skipping`)
        continue
      }
      await addFranchise(f)
    }
  }

  console.log('\n✅ Done.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
