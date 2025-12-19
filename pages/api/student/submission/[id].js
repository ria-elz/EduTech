import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const submission = await prisma.submission.findUnique({
        where: { id },
        include: {
          quiz: {
            select: {
              id: true,
              title: true
            }
          },
          answers: {
            include: {
              question: {
                include: {
                  answers: true
                }
              }
            }
          }
        }
      })

      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' })
      }

      // Verify this is the user's submission
      if (submission.userId !== session.user.id) {
        return res.status(403).json({ message: 'Not your submission' })
      }

      return res.json(submission)
    } catch (error) {
      console.error('Error fetching submission:', error)
      return res.status(500).json({ error: 'Failed to fetch submission' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}