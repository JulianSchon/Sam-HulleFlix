// @ts-check
// Audits streaming coverage across all movies for a given country
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const KEY = process.env.TMDB_API_KEY
const COUNTRY = process.env.COUNTRY ?? 'SE'

async function getProviders(tmdbId) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${tmdbId}/watch/providers?api_key=${KEY}`
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.results?.[COUNTRY] ?? null
}

async function main() {
  const movies = await prisma.movie.findMany({
    include: { franchise: { select: { name: true } } },
    orderBy: [{ franchise: { name: 'asc' } }],
  })

  console.log(`Checking ${movies.length} movies for ${COUNTRY} streaming...\n`)

  const noStream = []
  const withStream = []

  for (const movie of movies) {
    const providers = await getProviders(movie.tmdbId)
    const flatrate = providers?.flatrate ?? []
    const rent = providers?.rent ?? []
    const buy = providers?.buy ?? []

    const entry = {
      tmdbId: movie.tmdbId,
      franchise: movie.franchise.name,
      flatrate: flatrate.map((p) => p.provider_name),
      rent: rent.map((p) => p.provider_name),
      buy: buy.map((p) => p.provider_name),
    }

    if (flatrate.length === 0 && rent.length === 0 && buy.length === 0) {
      noStream.push(entry)
    } else {
      withStream.push(entry)
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 150))
  }

  console.log(`✅ With streaming data: ${withStream.length}`)
  console.log(`❌ No streaming data:   ${noStream.length}\n`)

  if (noStream.length > 0) {
    console.log('── Movies with NO streaming options ──')
    const byFranchise = {}
    for (const m of noStream) {
      if (!byFranchise[m.franchise]) byFranchise[m.franchise] = []
      byFranchise[m.franchise].push(m.tmdbId)
    }
    for (const [franchise, ids] of Object.entries(byFranchise)) {
      console.log(`  ${franchise}: ${ids.length} film(s) — tmdbIds: ${ids.join(', ')}`)
    }
  }

  console.log('\n── Sample: movies WITH streaming ──')
  for (const m of withStream.slice(0, 5)) {
    const parts = []
    if (m.flatrate.length) parts.push(`stream: ${m.flatrate.slice(0, 3).join(', ')}`)
    if (m.rent.length) parts.push(`rent: ${m.rent.slice(0, 2).join(', ')}`)
    console.log(`  [${m.franchise}] ${m.tmdbId}: ${parts.join(' | ')}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
