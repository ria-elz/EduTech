import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Forbidden' })
  }

  if (req.method === 'GET') {
    try {
      // Get all courses by this teacher
      const courses = await prisma.course.findMany({
        where: {
          authorId: session.user.id
        },
        include: {
          modules: {
            include: {
              lessons: {
                include: {
                  quiz: {
                    include: {
                      submissions: {
                        where: {
                          status: 'PENDING'
                        },
                        include: {
                          user: {
                            select: {
                              id: true,
                              name: true,
                              email: true
                            }
                          },
                          quiz: {
                            include: {
                              lesson: {
                                include: {
                                  module: {
                                    include: {
                                      course: true
                                    }
                                  }
                                }
                              }
                            }
                          }
                        },
                        orderBy: {
                          createdAt: 'desc'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })

      // Flatten all pending submissions
      const pendingSubmissions = []
      courses.forEach(course => {
        course.modules.forEach(module => {
          module.lessons.forEach(lesson => {
            if (lesson.quiz && lesson.quiz.submissions) {
              pendingSubmissions.push(...lesson.quiz.submissions)
            }
          })
        })
      })

      return res.json(pendingSubmissions)
    } catch (error) {
      console.error('Error fetching pending submissions:', error)
      return res.status(500).json({ error: 'Failed to fetch submissions' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}