import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const certificates = await prisma.certificate.findMany({
        where: {
          userId: session.user.id
        },
        include: {
          course: {
            select: {
              title: true,
              author: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          issueDate: 'desc'
        }
      })

      return res.json(certificates)
    } catch (error) {
      console.error('Error fetching certificates:', error)
      return res.status(500).json({ error: 'Failed to fetch certificates' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}