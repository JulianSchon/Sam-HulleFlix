'use client'

export default function TrailerEmbed({ trailerKey }: { trailerKey: string }) {
  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${trailerKey}`}
        title="Official Trailer"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  )
}
