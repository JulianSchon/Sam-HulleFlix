const BASE = 'https://api.themoviedb.org/3'
const KEY = process.env.TMDB_API_KEY

function tmdbFetch(path: string) {
  return fetch(`${BASE}${path}?api_key=${KEY}&language=en-US`, {
    next: { revalidate: 86400 },
  })
}

export interface TmdbMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  runtime: number | null
  vote_average: number
  genres: { id: number; name: string }[]
  credits: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[]
  }
}

export async function getTmdbMovie(tmdbId: number): Promise<TmdbMovie | null> {
  try {
    const res = await tmdbFetch(`/movie/${tmdbId}&append_to_response=credits`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function getTmdbTrailerKey(tmdbId: number): Promise<string | null> {
  try {
    const res = await tmdbFetch(`/movie/${tmdbId}/videos`)
    if (!res.ok) return null
    const data = await res.json()
    const trailers: { key: string; site: string; type: string; published_at: string }[] =
      data.results ?? []
    const youtubeTrailers = trailers.filter(
      (v) => v.site === 'YouTube' && v.type === 'Trailer'
    )
    if (!youtubeTrailers.length) return null
    youtubeTrailers.sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    )
    return youtubeTrailers[0].key
  } catch {
    return null
  }
}

export interface StreamingProvider {
  provider_id: number
  provider_name: string
  logo_path: string
}

export interface WatchProviders {
  flatrate?: StreamingProvider[]
  rent?: StreamingProvider[]
  buy?: StreamingProvider[]
  link?: string
}

export async function getTmdbProviders(
  tmdbId: number,
  country = 'SE'
): Promise<WatchProviders> {
  try {
    const res = await tmdbFetch(`/movie/${tmdbId}/watch/providers`)
    if (!res.ok) return {}
    const data = await res.json()
    return data.results?.[country] ?? {}
  } catch {
    return {}
  }
}

export interface TmdbCollectionResult {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
}

export async function searchTmdbCollections(query: string): Promise<TmdbCollectionResult[]> {
  try {
    const res = await fetch(
      `${BASE}/search/collection?api_key=${KEY}&language=en-US&query=${encodeURIComponent(query)}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.results ?? []
  } catch {
    return []
  }
}

export interface TmdbCollectionMovie {
  id: number
  title: string
  release_date: string
  poster_path: string | null
}

export async function getTmdbCollection(
  collectionId: number
): Promise<{ name: string; parts: TmdbCollectionMovie[] } | null> {
  try {
    const res = await fetch(`${BASE}/collection/${collectionId}?api_key=${KEY}&language=en-US`, {
      next: { revalidate: 86400 },
    })
    if (!res.ok) return null
    const data = await res.json()
    const parts: TmdbCollectionMovie[] = (data.parts ?? []).sort(
      (a: TmdbCollectionMovie, b: TmdbCollectionMovie) =>
        (a.release_date ?? '').localeCompare(b.release_date ?? '')
    )
    return { name: data.name, parts }
  } catch {
    return null
  }
}

export function tmdbPosterUrl(path: string | null, size = 'w342'): string {
  if (!path) return '/no-poster.svg'
  return `https://image.tmdb.org/t/p/${size}${path}`
}

export function tmdbBackdropUrl(path: string | null, size = 'w1280'): string {
  if (!path) return ''
  return `https://image.tmdb.org/t/p/${size}${path}`
}
