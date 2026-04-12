import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  franchiseId: z.string(),
  content: z.string().min(1).max(2000),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const request = await prisma.updateRequest.create({
    data: {
      content: parsed.data.content,
      franchiseId: parsed.data.franchiseId,
      userId: session.user.id,
    },
  })

  return NextResponse.json(request, { status: 201 })
}
