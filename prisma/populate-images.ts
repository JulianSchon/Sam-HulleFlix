import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const KEY = process.env.TMDB_API_KEY

async function main() {
  const franchises = await prisma.franchise.findMany({
    where: { tmdbCollectionId: { not: null } },
  })

  for (const f of franchises) {
    const res = await fetch(
      `https://api.themoviedb.org/3/collection/${f.tmdbCollectionId}?api_key=${KEY}`
    )
    const data = await res.json() as any
    const path = data.backdrop_path || data.poster_path
    if (!path) { console.log(`  ⚠ No image for ${f.name}`); continue }
    const url = `https://image.tmdb.org/t/p/w1280${path}`
    await prisma.franchise.update({ where: { id: f.id }, data: { heroImageUrl: url } })
    console.log(`✓ ${f.name}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
