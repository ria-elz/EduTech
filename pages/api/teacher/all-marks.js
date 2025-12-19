import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'

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
                        include: {
                          user: {
                            select: {
                              id: true,
                              name: true,
                              email: true
                            }
                          },
                          quiz: true
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

      // Flatten submissions by course
      const coursesWithSubmissions = courses.map((course) => {
        const submissions = []
        
        course.modules.forEach((module) => {
          module.lessons.forEach((lesson) => {
            if (lesson.quiz && lesson.quiz.submissions) {
              submissions.push(...lesson.quiz.submissions)
            }
          })
        })

        return {
          id: course.id,
          title: course.title,
          submissions
        }
      })

      return res.json(coursesWithSubmissions)
    } catch (error) {
      console.error('Error fetching marks:', error)
      return res.status(500).json({ error: 'Failed to fetch marks' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}