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
      // Get all enrollments with progress
      const enrollments = await prisma.enrollment.findMany({
        where: {
          userId: session.user.id
        },
        include: {
          course: {
            include: {
              modules: {
                include: {
                  lessons: {
                    include: {
                      progress: {
                        where: {
                          userId: session.user.id
                        }
                      }
                    },
                    orderBy: { position: 'asc' }
                  }
                },
                orderBy: { position: 'asc' }
              }
            }
          }
        }
      })

      // Calculate progress for each course
      const coursesWithProgress = enrollments.map(enrollment => {
        let totalLessons = 0
        let completedLessons = 0

        enrollment.course.modules.forEach(module => {
          totalLessons += module.lessons.length
          completedLessons += module.lessons.filter(
            lesson => lesson.progress.length > 0 && lesson.progress[0].completed
          ).length
        })

        const progressPercent = totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0

        return {
          ...enrollment.course,
          totalLessons,
          completedLessons,
          progressPercent
        }
      })

      return res.json(coursesWithProgress)
    } catch (error) {
      console.error('Error fetching progress:', error)
      return res.status(500).json({ error: 'Failed to fetch progress' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}