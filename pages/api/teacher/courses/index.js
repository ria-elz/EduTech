import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import slugify from 'slugify'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Forbidden - Teacher access required' })
  }

  if (req.method === 'GET') {
    try {
      const courses = await prisma.course.findMany({
        where: {
          authorId: session.user.id
        },
        include: {
          modules: {
            include: {
              lessons: {
                orderBy: { position: 'asc' }
              }
            },
            orderBy: { position: 'asc' }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return res.json(courses)
    } catch (error) {
      console.error('Error fetching courses:', error)
      return res.status(500).json({ error: 'Failed to fetch courses' })
    }
  }

  if (req.method === 'POST') {
    const { title, description } = req.body

    if (!title) {
      return res.status(400).json({ message: 'Title is required' })
    }

    try {
      const course = await prisma.course.create({
        data: {
          title,
          description: description || '',
          slug: slugify(title, { lower: true }),
          authorId: session.user.id,
          published: false
        }
      })

      return res.status(201).json(course)
    } catch (error) {
      console.error('Error creating course:', error)
      return res.status(500).json({ error: 'Failed to create course' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}