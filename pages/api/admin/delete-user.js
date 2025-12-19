import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden' })
  }

  if (req.method === 'DELETE') {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ message: 'Missing userId' })
    }

    // Prevent deleting yourself
    if (userId === session.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' })
    }

    try {
      await prisma.user.delete({
        where: { id: userId }
      })

      return res.json({ message: 'User deleted successfully' })
    } catch (error) {
      console.error('Error deleting user:', error)
      return res.status(500).json({ error: 'Failed to delete user' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}