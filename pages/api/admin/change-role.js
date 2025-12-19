import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden' })
  }

  if (req.method === 'POST') {
    const { userId, role } = req.body

    if (!userId || !role) {
      return res.status(400).json({ message: 'Missing userId or role' })
    }

    if (!['STUDENT', 'TEACHER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' })
    }

    // Prevent changing own role
    if (userId === session.user.id) {
      return res.status(400).json({ message: 'Cannot change your own role' })
    }

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { role }
      })

      return res.json(user)
    } catch (error) {
      console.error('Error changing role:', error)
      return res.status(500).json({ error: 'Failed to change role' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}