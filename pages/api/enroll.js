import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import prisma from '../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { courseId } = req.body

    const existing = await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId
      }
    })

    if (existing) {
      return res.status(400).json({ message: 'Already enrolled' })
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId
      }
    })

    return res.status(200).json(enrollment)
  } catch (err) {
    console.error('ENROLL ERROR:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
