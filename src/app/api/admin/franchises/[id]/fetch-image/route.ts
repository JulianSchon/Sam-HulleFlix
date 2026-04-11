import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const franchise = await prisma.franchise.findUnique({ where: { id: params.id } })
  if (!franchise?.tmdbCollectionId) {
    return NextResponse.json({ error: 'No TMDB collection linked' }, { status: 400 })
  }

  const res = await fetch(
    `https://api.themoviedb.org/3/collection/${franchise.tmdbCollectionId}?api_key=${process.env.TMDB_API_KEY}`
  )
  if (!res.ok) return NextResponse.json({ error: 'TMDB fetch failed' }, { status: 502 })

  const data = await res.json()
  const backdropPath = data.backdrop_path ?? data.poster_path
  if (!backdropPath) return NextResponse.json({ error: 'No image found' }, { status: 404 })

  const heroImageUrl = `https://image.tmdb.org/t/p/w1280${backdropPath}`

  await prisma.franchise.update({
    where: { id: params.id },
    data: { heroImageUrl },
  })

  return NextResponse.json({ heroImageUrl })
}
