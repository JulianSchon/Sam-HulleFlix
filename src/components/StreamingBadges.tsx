import { StreamingProvider } from '@/lib/tmdb'
import Image from 'next/image'

export default function StreamingBadges({ providers }: { providers: StreamingProvider[] }) {
  if (!providers.length) return null

  return (
    <div className="flex gap-1 flex-wrap">
      {providers.map((p) => (
        <div key={p.provider_id} className="relative group flex-shrink-0">
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
        </div>
      ))}
    </div>
  )
}
