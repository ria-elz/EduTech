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
      const [totalUsers, totalTeachers, totalStudents, totalCourses, recentSubmissions] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'TEACHER' } }),
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.course.count(),
        prisma.submission.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            quiz: {
              select: {
                id: true,
                title: true
              }
            }
          }
        })
      ])

      return res.json({
        totalUsers,
        totalTeachers,
        totalStudents,
        totalCourses,
        recentSubmissions
      })
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      return res.status(500).json({ error: 'Failed to fetch stats' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}