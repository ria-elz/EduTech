import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden' })
  }

  if (req.method === 'GET') {
    try {
      // Get basic counts
      const [totalEnrollments, totalQuizzes, totalSubmissions] = await Promise.all([
        prisma.enrollment.count(),
        prisma.quiz.count(),
        prisma.submission.count()
      ])

      // Get average score
      const submissions = await prisma.submission.findMany({
        select: { score: true }
      })
      const averageScore = submissions.length > 0
        ? Math.round(submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length)
        : 0

      // Get top courses by enrollments
      const topCourses = await prisma.course.findMany({
        take: 5,
        include: {
          author: {
            select: {
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              enrollments: true
            }
          }
        },
        orderBy: {
          enrollments: {
            _count: 'desc'
          }
        }
      })

      // Get top students by average score
      const studentsWithScores = await prisma.user.findMany({
        where: {
          role: 'STUDENT',
          submissions: {
            some: {}
          }
        },
        include: {
          submissions: {
            select: {
              score: true
            }
          },
          _count: {
            select: {
              submissions: true
            }
          }
        }
      })

      const topStudents = studentsWithScores
        .map(student => ({
          id: student.id,
          name: student.name,
          email: student.email,
          _count: student._count,
          averageScore: student.submissions.length > 0
            ? Math.round(
                student.submissions.reduce((sum, s) => sum + s.score, 0) /
                  student.submissions.length
              )
            : 0
        }))
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 5)

      return res.json({
        totalEnrollments,
        totalQuizzes,
        totalSubmissions,
        averageScore,
        topCourses,
        topStudents
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
      return res.status(500).json({ error: 'Failed to fetch analytics' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}