import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

function adminOnly() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

const schema = z.object({
  content: z.string().min(1).optional(),
  source: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return adminOnly()

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const trivia = await prisma.trivia.update({ where: { id: params.id }, data: parsed.data })
  return NextResponse.json(trivia)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return adminOnly()

  await prisma.trivia.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
