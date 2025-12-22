import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const { slug } = req.query

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const course = await prisma.course.findUnique({
    where: { slug }
  })

  if (!course) {
    return res.status(404).json({ message: 'Course not found' })
  }

  if (req.method === 'GET') {
    try {
      const announcements = await prisma.announcement.findMany({
        where: { courseId: course.id },
        include: {
          author: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return res.json(announcements)
    } catch (error) {
      console.error('Error fetching announcements:', error)
      return res.status(500).json({ error: 'Failed to fetch announcements' })
    }
  }

  if (req.method === 'POST') {
    if (session.user.role !== 'TEACHER' || course.authorId !== session.user.id) {
      return res.status(403).json({ message: 'Only course teacher can post announcements' })
    }

    const { title, content } = req.body

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' })
    }

    try {
      const announcement = await prisma.announcement.create({
        data: {
          title,
          content,
          courseId: course.id,
          authorId: session.user.id
        },
        include: {
          author: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
 
      return res.status(201).json(announcement)
    } catch (error) {
      console.error('Error creating announcement:', error)
      return res.status(500).json({ error: 'Failed to create announcement' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}

