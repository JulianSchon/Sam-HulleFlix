import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { searchTmdbCollections, getTmdbCollection } from '@/lib/tmdb'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const query = searchParams.get('q')
  const collectionId = searchParams.get('id')

  if (collectionId) {
    const collection = await getTmdbCollection(Number(collectionId))
    return NextResponse.json(collection)
  }

  if (query) {
    const results = await searchTmdbCollections(query)
    return NextResponse.json(results)
  }

  return NextResponse.json([])
}
