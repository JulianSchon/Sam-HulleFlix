import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  movieId: z.string(),
  watched: z.boolean(),
  watchlist: z.boolean(),
  rating: z.number().int().min(1).max(5).nullable(),
  review: z.string().nullable(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { movieId, watched, watchlist, rating, review } = parsed.data

  await prisma.userMovie.upsert({
    where: { userId_movieId: { userId: session.user.id, movieId } },
    create: {
      userId: session.user.id,
      movieId,
      watched,
      watchlist,
      rating,
      review,
      watchedAt: watched ? new Date() : null,
    },
    update: {
      watched,
      watchlist,
      rating,
      review,
      watchedAt: watched ? new Date() : null,
    },
  })

  return NextResponse.json({ ok: true })
}
