import { StreamingProvider } from '@/lib/tmdb'
import Image from 'next/image'

// TMDB provider_id → URL template (title is URL-encoded movie title)
const PROVIDER_URLS: Record<number, (title: string) => string> = {
  8:    (t) => `https://www.netflix.com/search?q=${encodeURIComponent(t)}`,
  119:  (t) => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(t)}`,
  337:  (t) => `https://www.disneyplus.com/search?q=${encodeURIComponent(t)}`,
  384:  (t) => `https://www.hbomax.com/search?q=${encodeURIComponent(t)}`,
  1899: (t) => `https://www.max.com/search?q=${encodeURIComponent(t)}`,
  350:  (t) => `https://tv.apple.com/search?term=${encodeURIComponent(t)}`,
  76:   (t) => `https://viaplay.com/se/search?query=${encodeURIComponent(t)}`,
  26:   (t) => `https://www.cmore.se/search?q=${encodeURIComponent(t)}`,
  531:  (t) => `https://www.paramountplus.com/search/?query=${encodeURIComponent(t)}`,
  11:   (t) => `https://mubi.com/en/se/search?query=${encodeURIComponent(t)}`,
  538:  (t) => `https://app.plex.tv/desktop/#!/search?query=${encodeURIComponent(t)}`,
  2:    (t) => `https://tv.apple.com/search?term=${encodeURIComponent(t)}`, // Apple TV (channels)
}

export default function StreamingBadges({
  providers,
  movieTitle,
  fallbackLink,
}: {
  providers: StreamingProvider[]
  movieTitle?: string
  fallbackLink?: string
}) {
  if (!providers.length) return null

  return (
    <div className="flex gap-1 flex-wrap">
      {providers.map((p) => {
        const urlFn = PROVIDER_URLS[p.provider_id]
        const href = (movieTitle && urlFn)
          ? urlFn(movieTitle)
          : fallbackLink

        const inner = (
          <>
            <div className="relative w-6 h-6 rounded overflow-hidden">
              <Image
                src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                alt={p.provider_name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-black/90 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {p.provider_name}
            </span>
          </>
        )

        return href ? (
          <a
            key={p.provider_id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="relative group flex-shrink-0"
            title={`Watch on ${p.provider_name}`}
          >
            {inner}
          </a>
        ) : (
          <div key={p.provider_id} className="relative group flex-shrink-0">
            {inner}
          </div>
        )
      })}
    </div>
  )
}
