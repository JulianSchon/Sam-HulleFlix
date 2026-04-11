import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

function adminOnly() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, inviteCode: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(users)
}

const createSchema = z.object({
  action: z.literal('create'),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
})

const inviteSchema = z.object({
  action: z.literal('invite'),
  userId: z.string(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return adminOnly()

  const body = await req.json()

  if (body.action === 'create') {
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const { name, email, password, role } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 400 })

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role },
      select: { id: true, email: true, name: true, role: true, inviteCode: true, createdAt: true },
    })
    return NextResponse.json(user, { status: 201 })
  }

  // Generate invite code for existing user
  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const inviteCode = randomBytes(8).toString('hex')
  await prisma.user.update({ where: { id: parsed.data.userId }, data: { inviteCode } })
  return NextResponse.json({ inviteCode })
}
