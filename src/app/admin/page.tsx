import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [franchiseCount, userCount] = await Promise.all([
    prisma.franchise.count(),
    prisma.user.count(),
  ])

  return (
    <div>
      <h2 className="text-white font-bold text-xl mb-6">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link href="/admin/franchises" className="bg-cinema-surface border border-cinema-border rounded-lg p-6 hover:border-cinema-muted transition-colors">
          <p className="text-cinema-red font-black text-3xl">{franchiseCount}</p>
          <p className="text-cinema-muted text-sm mt-1">Franchises</p>
          <p className="text-cinema-dim text-xs mt-3">Manage →</p>
        </Link>
        <Link href="/admin/users" className="bg-cinema-surface border border-cinema-border rounded-lg p-6 hover:border-cinema-muted transition-colors">
          <p className="text-cinema-gold font-black text-3xl">{userCount}</p>
          <p className="text-cinema-muted text-sm mt-1">Users</p>
          <p className="text-cinema-dim text-xs mt-3">Manage →</p>
        </Link>
        <Link href="/admin/franchises/new" className="bg-cinema-surface border border-cinema-border rounded-lg p-6 hover:border-cinema-muted transition-colors">
          <p className="text-white font-black text-3xl">+</p>
          <p className="text-cinema-muted text-sm mt-1">Add Franchise</p>
          <p className="text-cinema-dim text-xs mt-3">Import from TMDB →</p>
        </Link>
      </div>
    </div>
  )
}
