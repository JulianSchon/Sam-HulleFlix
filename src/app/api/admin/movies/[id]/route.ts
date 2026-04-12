import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

function adminOnly() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return adminOnly()

  const { mainStoryline } = await req.json()
  const movie = await prisma.movie.update({
    where: { id: params.id },
    data: { mainStoryline },
  })
  return NextResponse.json(movie)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return adminOnly()

  await prisma.movie.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
