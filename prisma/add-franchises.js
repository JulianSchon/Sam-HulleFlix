// @ts-check
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const KEY = process.env.TMDB_API_KEY

const NEW_FRANCHISES = [
  {
    slug: 'james-bond',
    name: 'James Bond (007)',
    tmdbCollectionId: 645,
    description: "The world's most famous spy franchise. British MI6 agent 007 goes on globe-trotting missions battling megalomaniacs and evil organisations.",
    watchOrderGuide: 'Each film is largely standalone. Watch in release order (1962–present) to see the evolution of Bond. Six actors have played 007: Connery, Lazenby, Moore, Dalton, Brosnan, and Craig.',
  },
  {
    slug: 'indiana-jones',
    name: 'Indiana Jones',
    tmdbCollectionId: 84,
    description: "Archaeology professor by day, adventure hero by night. Dr. Henry 'Indy' Jones Jr. hunts legendary relics across globe-spanning expeditions.",
    watchOrderGuide: 'Release order: Raiders of the Lost Ark → Temple of Doom (set 1935, a prequel) → Last Crusade → Kingdom of the Crystal Skull → Dial of Destiny.',
  },
  {
    slug: 'back-to-the-future',
    name: 'Back to the Future',
    tmdbCollectionId: 264,
    description: "Teenager Marty McFly and eccentric inventor Doc Brown travel through time in a DeLorean, causing chaos across 1885, 1955, and 1985.",
    watchOrderGuide: 'A tightly connected trilogy — watch Part I → Part II → Part III in order. Parts II and III were filmed back-to-back.',
  },
  {
    slug: 'jurassic-park',
    name: 'Jurassic Park',
    tmdbCollectionId: 328,
    description: "Scientists clone dinosaurs for a theme park, and chaos theory does the rest. Six films spanning three decades of prehistoric mayhem.",
    watchOrderGuide: 'Release order: Jurassic Park → The Lost World → Jurassic Park III → Jurassic World → Fallen Kingdom → Dominion.',
  },
  {
    slug: 'the-lord-of-the-rings',
    name: 'The Lord of the Rings',
    tmdbCollectionId: 119,
    description: "Peter Jackson's epic adaptation of Tolkien's masterwork. The Fellowship must destroy the One Ring to save Middle-earth from Sauron.",
    watchOrderGuide: 'Watch the original trilogy first: Fellowship → Two Towers → Return of the King. The Hobbit trilogy is a prequel and can be watched after.',
  },
  {
    slug: 'the-matrix',
    name: 'The Matrix',
    tmdbCollectionId: 2344,
    description: "A hacker discovers reality is a simulation and joins a resistance fighting machine overlords. Groundbreaking sci-fi action.",
    watchOrderGuide: 'The Matrix → Reloaded → Revolutions form the original trilogy. Resurrections (2021) is a standalone sequel.',
  },
  {
    slug: 'pirates-of-the-caribbean',
    name: 'Pirates of the Caribbean',
    tmdbCollectionId: 295,
    description: "Eccentric pirate Captain Jack Sparrow navigates supernatural curses, Davy Jones' locker, and the East India Trading Company on the high seas.",
    watchOrderGuide: "Curse of the Black Pearl → Dead Man's Chest → At World's End form a connected trilogy. On Stranger Tides and Dead Men Tell No Tales are follow-up adventures.",
  },
  {
    slug: 'the-godfather',
    name: 'The Godfather',
    tmdbCollectionId: 230,
    description: "Francis Ford Coppola's masterpiece trilogy chronicles the rise and fall of the Corleone crime family across three generations.",
    watchOrderGuide: 'The Godfather → The Godfather Part II → The Godfather Part III (Coda). Parts I and II are widely considered among the greatest films ever made.',
  },
  {
    slug: 'fast-and-furious',
    name: 'Fast & Furious',
    tmdbCollectionId: 9485,
    description: "What started as a street-racing thriller evolved into a globe-trotting franchise about family, loyalty, and increasingly absurd stunts.",
    watchOrderGuide: 'Release order is simplest. Note: Tokyo Drift (3rd film) is chronologically set after Fast 6. Hobbs & Shaw is a spin-off.',
  },
  {
    slug: 'mission-impossible',
    name: 'Mission: Impossible',
    tmdbCollectionId: 87359,
    description: "IMF agent Ethan Hunt tackles impossible covert missions — each film featuring increasingly spectacular practical stunts by Tom Cruise.",
    watchOrderGuide: 'Each film is largely standalone but characters carry over. Watch in release order for the best experience.',
  },
  {
    slug: 'jason-bourne',
    name: 'Jason Bourne',
    tmdbCollectionId: 31562,
    description: "Amnesiac CIA assassin Jason Bourne unravels his identity while evading government operatives in this taut, realistic spy thriller series.",
    watchOrderGuide: 'Release order: The Bourne Identity → Supremacy → Ultimatum (the core trilogy). The Bourne Legacy is a parallel spin-off; Jason Bourne is the fifth film.',
  },
  {
    slug: 'dirty-harry',
    name: 'Dirty Harry',
    tmdbCollectionId: 10014,
    description: "San Francisco detective 'Dirty Harry' Callahan dispenses hard-boiled justice his own way, armed with a .44 Magnum and legendary one-liners.",
    watchOrderGuide: 'Release order: Dirty Harry → Magnum Force → The Enforcer → Sudden Impact → The Dead Pool. Each film is standalone.',
  },
  {
    slug: 'john-wick',
    name: 'John Wick',
    tmdbCollectionId: 404609,
    description: "A retired hitman is pulled back into the criminal underworld after a fatal provocation. Stylish, hyper-choreographed gun-fu action.",
    watchOrderGuide: 'Watch in release order — Chapter 1 → 2 → 3: Parabellum → 4. A continuous story with escalating stakes.',
  },
  {
    slug: 'kill-bill',
    name: 'Kill Bill',
    tmdbCollectionId: 2883,
    description: "Quentin Tarantino's bloody revenge epic. An assassin known as The Bride hunts down the team that tried to kill her on her wedding day.",
    watchOrderGuide: 'Volume 1 → Volume 2 (release order). The Whole Bloody Affair is the preferred single-film cut.',
  },
  {
    slug: 'men-in-black',
    name: 'Men in Black',
    tmdbCollectionId: 86055,
    description: "Secret government agents police alien activity on Earth with neuralyzers and hi-tech weaponry.",
    watchOrderGuide: 'Release order: Men in Black → MIB II → MIB 3. MIB International (2019) is a standalone spin-off with new agents.',
  },
  {
    slug: 'ghostbusters',
    name: 'Ghostbusters',
    tmdbCollectionId: 2980,
    description: "Scientists-turned-paranormal investigators capture ghosts in New York City. A beloved comedy franchise spanning four decades.",
    watchOrderGuide: 'Ghostbusters (1984) → Ghostbusters II form the original. Afterlife (2021) and Frozen Empire (2024) continue the Spengler family legacy.',
  },
  {
    slug: 'star-trek-original',
    name: 'Star Trek (Original Crew)',
    tmdbCollectionId: 115,
    description: "Captain Kirk and the crew of the USS Enterprise boldly go where no man has gone before in this classic sci-fi film series.",
    watchOrderGuide: 'The Motion Picture → Wrath of Khan → Search for Spock → Voyage Home → Final Frontier → Undiscovered Country. Start with Wrath of Khan for the best entry point.',
  },
  {
    slug: 'planet-of-the-apes-classic',
    name: 'Planet of the Apes',
    tmdbCollectionId: 173,
    description: "Astronauts crash-land on a world ruled by intelligent apes. Classic sci-fi exploring themes of humanity, evolution, and societal collapse.",
    watchOrderGuide: 'Classic series (1968–1973): Planet of the Apes → Beneath → Escape → Conquest → Battle. Modern trilogy: Rise → Dawn → War → Kingdom (loosely related).',
  },
  {
    slug: 'oceans',
    name: "Ocean's",
    tmdbCollectionId: 304,
    description: "Danny Ocean assembles a crew of stylish con artists to pull off the ultimate casino heists in Las Vegas and Europe.",
    watchOrderGuide: "Ocean's Eleven → Ocean's Twelve → Ocean's Thirteen form the original trilogy. Ocean's 8 is a standalone spin-off.",
  },
  {
    slug: 'beverly-hills-cop',
    name: 'Beverly Hills Cop',
    tmdbCollectionId: 85960,
    description: "Detroit street cop Axel Foley brings his unique brand of loud, improvised humor to Beverly Hills in these classic action-comedies.",
    watchOrderGuide: 'Release order: Beverly Hills Cop → Beverly Hills Cop II → Beverly Hills Cop III → Axel F (2024).',
  },
]

async function getCollection(id) {
  const res = await fetch(
    `https://api.themoviedb.org/3/collection/${id}?api_key=${KEY}&language=en-US`
  )
  if (!res.ok) return null
  return res.json()
}

async function main() {
  for (const f of NEW_FRANCHISES) {
    const existing = await prisma.franchise.findUnique({ where: { slug: f.slug } })
    if (existing) {
      console.log(`⏭  ${f.name} already exists, skipping`)
      continue
    }

    console.log(`\n→ ${f.name} (collection ${f.tmdbCollectionId})`)
    const collection = await getCollection(f.tmdbCollectionId)
    if (!collection) {
      console.log(`  ✗ TMDB collection not found — skipping`)
      continue
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
        console.log(`    - ${part.title} (already in DB, skipping)`)
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

  console.log('\n✅ Done.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
