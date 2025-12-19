import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query

  if (!session || session.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Forbidden' })
  }

  if (req.method === 'GET') {
    try {
      const module = await prisma.module.findUnique({
        where: { id },
        include: {
          lessons: {
            orderBy: { position: 'asc' }
          },
          course: true
        }
      })

      if (!module || module.course.authorId !== session.user.id) {
        return res.status(404).json({ message: 'Module not found' })
      }

      return res.json(module)
    } catch (error) {
      console.error('Error fetching module:', error)
      return res.status(500).json({ error: 'Failed to fetch module' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}