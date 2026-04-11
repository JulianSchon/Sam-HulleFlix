import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

function adminOnly() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

const updateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  watchOrderGuide: z.string().optional(),
  heroImageUrl: z.string().nullable().optional(),
  featured: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return adminOnly()

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const franchise = await prisma.franchise.update({
    where: { id: params.id },
    data: parsed.data,
  })

  return NextResponse.json(franchise)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return adminOnly()

  await prisma.franchise.delete({ where: { id: params.id } })

  return NextResponse.json({ ok: true })
}
