import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

function adminOnly() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

const reorderSchema = z.object({
  order: z.array(z.object({ id: z.string(), sortOrder: z.number().int() })),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return adminOnly()

  const body = await req.json()
  const parsed = reorderSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  await Promise.all(
    parsed.data.order.map(({ id, sortOrder }) =>
      prisma.movie.update({ where: { id }, data: { sortOrder } })
    )
  )

  return NextResponse.json({ ok: true })
}

const addMovieSchema = z.object({ tmdbId: z.number().int() })

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return adminOnly()

  const body = await req.json()
  const parsed = addMovieSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const count = await prisma.movie.count({ where: { franchiseId: params.id } })

  const movie = await prisma.movie.create({
    data: { tmdbId: parsed.data.tmdbId, franchiseId: params.id, sortOrder: count },
  })

  return NextResponse.json(movie, { status: 201 })
}
