import prisma from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query

  if (!session || session.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Forbidden' })
  }

  // Verify course belongs to teacher
  const course = await prisma.course.findUnique({
    where: { id },
    include: { modules: true }
  })

  if (!course || course.authorId !== session.user.id) {
    return res.status(404).json({ message: 'Course not found' })
  }

  if (req.method === 'POST') {
    const { title } = req.body

    if (!title) {
      return res.status(400).json({ message: 'Title is required' })
    }

    try {
      // Get the next position
      const maxPosition = course.modules.length > 0 
        ? Math.max(...course.modules.map(m => m.position))
        : 0

      const module = await prisma.module.create({
        data: {
          title,
          position: maxPosition + 1,
          courseId: id
        }
      })

      return res.status(201).json(module)
    } catch (error) {
      console.error('Error creating module:', error)
      return res.status(500).json({ error: 'Failed to create module' })
    }
  }

  if (req.method === 'GET') {
    return res.json(course.modules)
  }

  return res.status(405).json({ message: 'Method not allowed' })
}