import { prisma } from '@/lib/db'
import AdminUsersClient from '@/components/admin/AdminUsersClient'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, inviteCode: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h2 className="text-white font-bold text-xl mb-6">Users</h2>
      <AdminUsersClient users={users} />
    </div>
  )
}
