import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const franchises = [
  {
    slug: 'terminator',
    name: 'Terminator',
    tmdbCollectionId: 528,
    description: 'A cybernetic assassin travels back in time to kill Sarah Connor, whose son will one day lead humanity in a war against machines.',
    watchOrderGuide: 'Release order recommended: T1 → T2 → T3 → Salvation → Genisys → Dark Fate. T1 and T2 are essential. The rest are optional.',
    featured: true,
  },
  {
    slug: 'alien',
    name: 'Alien',
    tmdbCollectionId: 8091,
    description: 'The deadliest creature in the universe encounters the crew of the Nostromo — and the saga of Ripley begins.',
    watchOrderGuide: 'Release order: Alien → Aliens → Alien 3 → Alien: Resurrection. The prequels (Prometheus, Alien: Covenant) can be watched after.',
  },
  {
    slug: 'predator',
    name: 'Predator',
    tmdbCollectionId: 31562,
    description: 'An alien hunter stalks the most dangerous prey in the universe: humans.',
    watchOrderGuide: 'Start with Predator (1987), then Predator 2, Predators, The Predator, and Prey.',
  },
  {
    slug: 'rambo',
    name: 'Rambo',
    tmdbCollectionId: 5039,
    description: 'John Rambo, a Vietnam veteran, is pushed too far and unleashes hell.',
    watchOrderGuide: 'Watch in release order: First Blood → Rambo: First Blood Part II → Rambo III → Rambo → Last Blood.',
  },
  {
    slug: 'rocky-creed',
    name: 'Rocky / Creed',
    tmdbCollectionId: 1575,
    description: 'From a small-time boxer to a living legend — and the next generation stepping into the ring.',
    watchOrderGuide: 'Rocky I–IV are classic. Rocky V is optional. Rocky Balboa is a solid return. Then Creed I–III continue the legacy.',
  },
  {
    slug: 'die-hard',
    name: 'Die Hard',
    tmdbCollectionId: 1570,
    description: 'New York cop John McClane keeps ending up in the wrong place at the wrong time.',
    watchOrderGuide: 'Die Hard is a masterpiece. Watch 2 and 3 for fun. 4 is decent. 5 can be skipped.',
  },
  {
    slug: 'robocop',
    name: 'RoboCop',
    tmdbCollectionId: 5547,
    description: 'In a crime-ridden future Detroit, a murdered cop is reborn as a cyborg law enforcer.',
    watchOrderGuide: 'The original (1987) is a classic. RoboCop 2 is watchable. 3 can be skipped.',
  },
  {
    slug: 'mad-max',
    name: 'Mad Max',
    tmdbCollectionId: 8945,
    description: 'In a post-apocalyptic wasteland, Max Rockatansky fights for survival on the open road.',
    watchOrderGuide: 'Start with Mad Max (1979), then The Road Warrior, Beyond Thunderdome, Fury Road (a masterpiece), and Furiosa.',
  },
  {
    slug: 'lethal-weapon',
    name: 'Lethal Weapon',
    tmdbCollectionId: 945,
    description: 'Suicidal cop Riggs and family man Murtaugh become the most unlikely and unstoppable partner duo in LA.',
    watchOrderGuide: 'Watch all four in order. The tone shifts from dark thriller to action-comedy but it works.',
  },
  {
    slug: 'conan',
    name: 'Conan',
    tmdbCollectionId: 8354,
    description: 'The mighty Cimmerian barbarian seeks vengeance and glory in a world of sorcery and steel.',
    watchOrderGuide: 'Conan the Barbarian (1982) first — it\'s essential. Conan the Destroyer is a fun follow-up.',
  },
]

async function main() {
  console.log('Seeding franchises…')

  for (const f of franchises) {
    const existing = await prisma.franchise.findUnique({ where: { slug: f.slug } })
    if (existing) {
      console.log(`  ✓ ${f.name} already exists, skipping`)
      continue
    }

    await prisma.franchise.create({
      data: {
        slug: f.slug,
        name: f.name,
        description: f.description,
        watchOrderGuide: f.watchOrderGuide,
        tmdbCollectionId: f.tmdbCollectionId,
        featured: f.featured ?? false,
      },
    })

    console.log(`  + Created ${f.name} (no movies yet — add via admin panel)`)
  }

  // Seed admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL
  const adminPassword = process.env.SEED_ADMIN_PASSWORD

  if (adminEmail && adminPassword) {
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
    if (!existing) {
      const passwordHash = await bcrypt.hash(adminPassword, 12)
      await prisma.user.create({
        data: { email: adminEmail, name: 'Admin', passwordHash, role: 'ADMIN' },
      })
      console.log(`  + Created admin user: ${adminEmail}`)
    } else {
      console.log(`  ✓ Admin user already exists`)
    }
  } else {
    console.log('  ⚠ SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping admin user')
  }

  console.log('Done.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
