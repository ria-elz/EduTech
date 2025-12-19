import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method === 'POST') {
    const { lessonId } = req.body

    try {
      // Check if already marked
      const existing = await prisma.progress.findUnique({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId
          }
        }
      })

      if (existing) {
        // Toggle completion
        const updated = await prisma.progress.update({
          where: { id: existing.id },
          data: {
            completed: !existing.completed,
            completedAt: !existing.completed ? new Date() : null
          }
        })
        return res.json(updated)
      } else {
        // Create new progress
        const progress = await prisma.progress.create({
          data: {
            userId: session.user.id,
            lessonId,
            completed: true,
            completedAt: new Date()
          }
        })
        return res.json(progress)
      }
    } catch (error) {
      console.error('Error marking progress:', error)
      return res.status(500).json({ error: 'Failed to mark progress' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}