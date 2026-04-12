import { prisma } from '@/lib/db'
import Link from 'next/link'
import UpdateRequestActions from '@/components/admin/UpdateRequestActions'

export default async function UpdateRequestsPage() {
  const requests = await prisma.updateRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      franchise: { select: { name: true, slug: true } },
    },
  })

  const pending = requests.filter((r) => r.status === 'PENDING')
  const resolved = requests.filter((r) => r.status !== 'PENDING')

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-white font-bold text-xl">Update Requests</h2>
        <p className="text-cinema-muted text-sm mt-1">{pending.length} pending</p>
      </div>

      {pending.length === 0 && (
        <p className="text-cinema-dim text-sm">No pending requests.</p>
      )}

      <div className="space-y-3">
        {pending.map((r) => (
          <div key={r.id} className="bg-cinema-surface border border-cinema-border rounded-lg p-4 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm leading-relaxed">{r.content}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-cinema-dim">
                  <Link href={`/franchise/${r.franchise.slug}`} className="text-cinema-gold hover:underline">
                    {r.franchise.name}
                  </Link>
                  <span>{r.user.name} ({r.user.email})</span>
                  <span>{new Date(r.createdAt).toLocaleDateString('en-SE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
              <UpdateRequestActions id={r.id} />
            </div>
          </div>
        ))}
      </div>

      {resolved.length > 0 && (
        <details className="mt-8">
          <summary className="text-cinema-muted text-xs uppercase tracking-wider cursor-pointer hover:text-white transition-colors">
            Resolved / Dismissed ({resolved.length})
          </summary>
          <div className="space-y-2 mt-3">
            {resolved.map((r) => (
              <div key={r.id} className="bg-cinema-surface border border-cinema-border rounded-lg px-4 py-3 opacity-50">
                <p className="text-cinema-muted text-sm line-clamp-2">{r.content}</p>
                <div className="flex gap-3 mt-1 text-xs text-cinema-dim">
                  <span>{r.franchise.name}</span>
                  <span>{r.user.name}</span>
                  <span className={r.status === 'RESOLVED' ? 'text-green-500' : 'text-cinema-dim'}>
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
