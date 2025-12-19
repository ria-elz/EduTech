import prisma from '../../../lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { name, email, password, role } = req.body || {}

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing fields' })
    }

    // Validate role
    const validRole = ['STUDENT', 'TEACHER'].includes(role) ? role : 'STUDENT'

    // Check existing user
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
        role: validRole,
      },
    })

    // Success response
    return res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    })
  } catch (error) {
    console.error('REGISTER ERROR:', error)

    return res.status(500).json({
      message: 'Internal server error',
      error: error?.message || 'Unknown error',
    })
  }
}