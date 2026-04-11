import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getTmdbMovie } from '@/lib/tmdb'
import EditFranchiseForm from '@/components/admin/EditFranchiseForm'
import FilmReorder from '@/components/admin/FilmReorder'
import TriviaEditor from '@/components/admin/TriviaEditor'

export default async function EditFranchisePage({ params }: { params: { id: string } }) {
  const franchise = await prisma.franchise.findUnique({
    where: { id: params.id },
    include: {
      movies: { orderBy: { sortOrder: 'asc' } },
      trivia: { where: { movieId: null } },
    },
  })

  if (!franchise) notFound()

  const filmsWithTitles = await Promise.all(
    franchise.movies.map(async (m) => {
      const tmdb = await getTmdbMovie(m.tmdbId)
      return { ...m, title: tmdb?.title }
    })
  )

  return (
    <div className="max-w-2xl space-y-10">
      <h2 className="text-white font-bold text-xl">Edit — {franchise.name}</h2>

      <section>
        <h3 className="text-cinema-muted text-xs uppercase tracking-wider mb-4">Franchise Details</h3>
        <EditFranchiseForm franchise={franchise} />
      </section>

      <section>
        <h3 className="text-cinema-muted text-xs uppercase tracking-wider mb-4">Film Order</h3>
        <FilmReorder franchiseId={franchise.id} initialFilms={filmsWithTitles} />
      </section>

      <section>
        <h3 className="text-cinema-muted text-xs uppercase tracking-wider mb-4">Franchise Trivia</h3>
        <TriviaEditor franchiseId={franchise.id} trivia={franchise.trivia} />
      </section>
    </div>
  )
}
