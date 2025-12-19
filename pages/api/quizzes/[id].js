import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const quiz = await prisma.quiz.findUnique({
        where: { id },
        include: {
          questions: { include: { answers: true } }
        }
      })

      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' })
      }

      // Don't send correct answers to students
      if (session.user.role !== 'TEACHER') {
        quiz.questions = quiz.questions.map(q => ({
          ...q,
          answers: q.answers.map(a => ({
            id: a.id,
            text: a.text
          }))
        }))
      }

      return res.json(quiz)
    } catch (error) {
      console.error('Error fetching quiz:', error)
      return res.status(500).json({ error: 'Failed to fetch quiz' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}