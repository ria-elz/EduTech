import prisma from '../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  console.log('=== MY SUBMISSIONS API ===')
  console.log('Session:', session)

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const submissions = await prisma.submission.findMany({
        where: {
          userId: session.user.id
        },
        include: {
          quiz: {
            include: {
              lesson: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      console.log('Found submissions:', submissions.length)
      console.log('Submissions:', JSON.stringify(submissions, null, 2))

      return res.json(submissions)
    } catch (error) {
      console.error('Error fetching submissions:', error)
      return res.status(500).json({ error: 'Failed to fetch submissions' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}