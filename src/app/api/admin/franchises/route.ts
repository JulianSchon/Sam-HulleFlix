import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getTmdbCollection } from '@/lib/tmdb'
import { z } from 'zod'

function adminOnly() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

const createSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().min(1),
  watchOrderGuide: z.string().min(1),
  tmdbCollectionId: z.number().int().optional(),
  movieTmdbIds: z.array(z.number().int()),
  heroImageUrl: z.string().optional(),
})

export async function GET() {
  const franchises = await prisma.franchise.findMany({
    include: { _count: { select: { movies: true } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(franchises)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return adminOnly()

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { slug, name, description, watchOrderGuide, tmdbCollectionId, movieTmdbIds, heroImageUrl } = parsed.data

  const existing = await prisma.franchise.findUnique({ where: { slug } })
  if (existing) return NextResponse.json({ error: 'Slug already taken' }, { status: 400 })

  const franchise = await prisma.franchise.create({
    data: {
      slug,
      name,
      description,
      watchOrderGuide,
      tmdbCollectionId,
      heroImageUrl,
      movies: {
        create: movieTmdbIds.map((tmdbId, i) => ({ tmdbId, sortOrder: i })),
      },
    },
  })

  return NextResponse.json(franchise, { status: 201 })
}
