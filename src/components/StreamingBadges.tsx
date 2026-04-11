import { StreamingProvider } from '@/lib/tmdb'
import Image from 'next/image'

export default function StreamingBadges({ providers }: { providers: StreamingProvider[] }) {
  if (!providers.length) return null

  return (
    <div className="flex gap-1 flex-wrap">
      {providers.slice(0, 3).map((p) => (
        <div key={p.provider_id} title={p.provider_name} className="relative w-6 h-6 rounded overflow-hidden flex-shrink-0">
          <Image
            src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
            alt={p.provider_name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ))}
    </div>
  )
}
