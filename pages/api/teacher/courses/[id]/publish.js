import prisma from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query

  if (!session || session.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Forbidden' })
  }

  if (req.method === 'POST') {
    try {
      // Verify the course belongs to this teacher
      const course = await prisma.course.findUnique({
        where: { id }
      })

      if (!course || course.authorId !== session.user.id) {
        return res.status(404).json({ message: 'Course not found' })
      }

      // Toggle published status
      const updatedCourse = await prisma.course.update({
        where: { id },
        data: {
          published: !course.published
        }
      })

      return res.json(updatedCourse)
    } catch (error) {
      console.error('Error publishing course:', error)
      return res.status(500).json({ error: 'Failed to publish course' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}