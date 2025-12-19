import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query

  if (!session || session.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Forbidden' })
  }

  if (req.method === 'GET') {
    try {
      const submission = await prisma.submission.findUnique({
        where: { id },
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
              },
              questions: {
                include: {
                  answers: true
                },
                orderBy: {
                  id: 'asc'
                }
              }
            }
          },
          answers: {
            include: {
              question: {
                include: {
                  answers: true
                }
              }
            }
          }
        }
      })

      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' })
      }

      // Verify teacher owns this course
      if (submission.quiz.lesson.module.course.authorId !== session.user.id) {
        return res.status(403).json({ message: 'Not your course' })
      }

      return res.json(submission)
    } catch (error) {
      console.error('Error fetching submission:', error)
      return res.status(500).json({ error: 'Failed to fetch submission' })
    }
  }

  if (req.method === 'POST') {
    // Grade the submission
    const { answerGrades, overallFeedback } = req.body

    try {
      const submission = await prisma.submission.findUnique({
        where: { id },
        include: {
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
              },
              questions: true
            }
          },
          answers: true
        }
      })

      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' })
      }

      // Verify teacher owns this course
      if (submission.quiz.lesson.module.course.authorId !== session.user.id) {
        return res.status(403).json({ message: 'Not your course' })
      }

      // Update each answer with grades and feedback
      for (const answerGrade of answerGrades) {
        await prisma.submissionAnswer.update({
          where: { id: answerGrade.id },
          data: {
            points: answerGrade.points,
            feedback: answerGrade.feedback || null
          }
        })
      }

      // Calculate total score
      const updatedAnswers = await prisma.submissionAnswer.findMany({
        where: { submissionId: id },
        include: {
          question: true
        }
      })

      let totalPoints = 0
      let earnedPoints = 0

      updatedAnswers.forEach(answer => {
        totalPoints += answer.question.points
        earnedPoints += answer.points || 0
      })

      const finalScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0

      // Update submission
      const gradedSubmission = await prisma.submission.update({
        where: { id },
        data: {
          score: finalScore,
          status: 'GRADED',
          feedback: overallFeedback || null,
          gradedAt: new Date()
        }
      })

      return res.json(gradedSubmission)
    } catch (error) {
      console.error('Error grading submission:', error)
      return res.status(500).json({ error: 'Failed to grade submission' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}