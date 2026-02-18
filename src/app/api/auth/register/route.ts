import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { checkPassword } from '@/lib/password'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Server-side password strength gate (identical rules as the signup form)
    const { isValid } = checkPassword(password)
    if (!isValid) {
      return NextResponse.json(
        { message: 'Password must be ≥ 8 chars and include uppercase, lowercase, a number, and a symbol.' },
        { status: 422 }
      )
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser) {
      return NextResponse.json({ message: 'An account with that email already exists.' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({ data: { email: normalizedEmail, passwordHash } })

    return NextResponse.json(
      { message: 'Account created.', user: { id: user.id, email: user.email } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 })
  }
}
