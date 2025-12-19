import prisma from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query

  if (!session || session.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Forbidden' })
  }

  // Verify lesson belongs to teacher
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      module: {
        include: {
          course: true
        }
      }
    }
  })

  if (!lesson || lesson.module.course.authorId !== session.user.id) {
    return res.status(404).json({ message: 'Lesson not found' })
  }

  if (req.method === 'POST') {
    const { title, duration, questions } = req.body

    if (!title) {
      return res.status(400).json({ message: 'Title is required' })
    }

    try {
      const quiz = await prisma.quiz.create({
        data: {
          title,
          duration: duration || null,
          lessonId: id,
          questions: {
            create: questions.map((q, index) => {
              const questionData = {
                text: q.text,
                type: q.type || 'MCQ',
                points: q.points || 1
              }

              // Only add answers for MCQ type
              if (q.type === 'MCQ' && q.options) {
                questionData.answers = {
                  create: q.options.map((opt, oIndex) => ({
                    text: opt,
                    isCorrect: oIndex === q.correctOption
                  }))
                }
              }

              return questionData
            })
          }
        }
      })

      return res.status(201).json(quiz)
    } catch (error) {
      console.error('Error creating quiz:', error)
      return res.status(500).json({ error: 'Failed to create quiz' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}