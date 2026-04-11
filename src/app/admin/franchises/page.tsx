import { prisma } from '@/lib/db'
import Link from 'next/link'
import DeleteFranchiseButton from '@/components/admin/DeleteFranchiseButton'

export default async function AdminFranchisesPage() {
  const franchises = await prisma.franchise.findMany({
    include: { _count: { select: { movies: true } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-xl">Franchises</h2>
        <Link
          href="/admin/franchises/new"
          className="bg-cinema-red text-white text-sm font-bold px-4 py-2 rounded hover:opacity-80 transition-opacity"
        >
          + Add Franchise
        </Link>
      </div>

      <div className="space-y-2">
        {franchises.map((f) => (
          <div
            key={f.id}
            className="bg-cinema-surface border border-cinema-border rounded-lg px-4 py-3 flex items-center gap-4"
          >
            <div className="flex-1">
              <p className="text-white font-bold text-sm">{f.name}</p>
              <p className="text-cinema-dim text-xs mt-0.5">
                {f._count.movies} films • /{f.slug}{' '}
                {f.featured && <span className="text-cinema-gold ml-2">★ Featured</span>}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/franchise/${f.slug}`}
                className="text-cinema-dim hover:text-cinema-muted text-xs px-3 py-1.5 border border-cinema-border rounded transition-colors"
              >
                View
              </Link>
              <Link
                href={`/admin/franchises/${f.id}/edit`}
                className="text-cinema-muted hover:text-white text-xs px-3 py-1.5 border border-cinema-border rounded transition-colors"
              >
                Edit
              </Link>
              <DeleteFranchiseButton id={f.id} name={f.name} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
