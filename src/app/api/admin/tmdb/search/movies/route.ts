import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const query = req.nextUrl.searchParams.get('q')
  if (!query) return NextResponse.json([])

  const res = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}`,
    { next: { revalidate: 3600 } }
  )

  if (!res.ok) return NextResponse.json([])

  const data = await res.json()
  const results = (data.results ?? [])
    .slice(0, 10)
    .map((m: { id: number; title: string; release_date: string; poster_path: string | null }) => ({
      id: m.id,
      title: m.title,
      release_date: m.release_date,
      poster_path: m.poster_path,
    }))

  return NextResponse.json(results)
}
