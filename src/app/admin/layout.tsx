import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-6 mb-8 border-b border-cinema-border pb-4">
        <h1 className="text-cinema-gold font-black tracking-widest text-sm uppercase">Admin</h1>
        <Link href="/admin/franchises" className="text-cinema-muted hover:text-white text-sm transition-colors">
          Franchises
        </Link>
        <Link href="/admin/users" className="text-cinema-muted hover:text-white text-sm transition-colors">
          Users
        </Link>
        <Link href="/admin/update-requests" className="text-cinema-muted hover:text-white text-sm transition-colors">
          Update Requests
        </Link>
        <Link href="/" className="text-cinema-dim hover:text-cinema-muted text-sm transition-colors ml-auto">
          ← Site
        </Link>
      </div>
      {children}
    </div>
  )
}
