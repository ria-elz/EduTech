import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method === 'POST') {
    const { courseId } = req.body

    try {
      // Get course with all lessons
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          modules: {
            include: {
              lessons: true
            }
          }
        }
      })

      if (!course) {
        return res.status(404).json({ message: 'Course not found' })
      }

      // Get all lesson IDs
      const lessonIds = []
      course.modules.forEach(module => {
        module.lessons.forEach(lesson => {
          lessonIds.push(lesson.id)
        })
      })

      if (lessonIds.length === 0) {
        return res.status(400).json({ message: 'Course has no lessons' })
      }

      // Check if student completed all lessons
      const completedLessons = await prisma.progress.count({
        where: {
          userId: session.user.id,
          lessonId: { in: lessonIds },
          completed: true
        }
      })

      if (completedLessons < lessonIds.length) {
        return res.status(400).json({ 
          message: 'Course not completed yet',
          completed: completedLessons,
          total: lessonIds.length
        })
      }

      // Check if certificate already exists
      const existing = await prisma.certificate.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId
          }
        }
      })

      if (existing) {
        return res.json(existing)
      }

      // Generate certificate number
      const certificateNo = 'CERT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()

      // Create certificate
      const certificate = await prisma.certificate.create({
        data: {
          certificateNo,
          studentName: session.user.name || session.user.email,
          courseName: course.title,
          completionDate: new Date(),
          userId: session.user.id,
          courseId
        }
      })

      return res.status(201).json(certificate)
    } catch (error) {
      console.error('Error generating certificate:', error)
      return res.status(500).json({ error: 'Failed to generate certificate' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}