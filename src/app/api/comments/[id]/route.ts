import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const comment = await prisma.comment.findUnique({ where: { id: params.id } })
  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Only the author or an admin can delete
  if (comment.userId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.comment.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
