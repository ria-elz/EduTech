import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  console.log('=== QUIZ SUBMIT ===')
  console.log('Session:', session)
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id } = req.query

  try {
    // For now, we'll handle JSON only (files can be added later)
    const { answers } = req.body
    
    console.log('Quiz ID:', id)
    console.log('Answers:', answers)

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: { 
          include: { answers: true },
          orderBy: { id: 'asc' }
        }
      }
    })

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' })
    }

    let autoGradedScore = 0
    let totalAutoGradedPoints = 0
    let totalManualGradingPoints = 0
    const submissionAnswers = []

    // Process each question
    for (const question of quiz.questions) {
      if (question.type === 'MCQ') {
        // Auto-grade MCQ
        const selectedAnswerId = answers[question.id]
        const correctAnswer = question.answers.find(a => a.isCorrect)
        
        const earnedPoints = (correctAnswer && selectedAnswerId === correctAnswer.id) 
          ? question.points 
          : 0
        
        autoGradedScore += earnedPoints
        totalAutoGradedPoints += question.points

        submissionAnswers.push({
          questionId: question.id,
          selectedAnswerId: selectedAnswerId || null,
          points: earnedPoints
        })

      } else if (question.type === 'TEXT') {
        // Store text answer for manual grading
        totalManualGradingPoints += question.points
        
        submissionAnswers.push({
          questionId: question.id,
          answerText: answers[question.id] || '',
          points: null // Will be graded manually
        })

      } else if (question.type === 'FILE_UPLOAD') {
        // For now, just mark as pending (file upload will be enhanced later)
        totalManualGradingPoints += question.points
        
        submissionAnswers.push({
          questionId: question.id,
          answerText: 'File upload pending',
          points: null // Will be graded manually
        })
      }
    }

    // Calculate status and score
    const needsManualGrading = totalManualGradingPoints > 0
    const status = needsManualGrading ? 'PENDING' : 'GRADED'
    
    // Calculate percentage
    let finalScore = null
    const totalPoints = totalAutoGradedPoints + totalManualGradingPoints
    
    if (!needsManualGrading && totalAutoGradedPoints > 0) {
      // All auto-graded
      finalScore = Math.round((autoGradedScore / totalAutoGradedPoints) * 100)
    } else if (needsManualGrading && totalAutoGradedPoints > 0) {
      // Partial auto-graded - score will be null until fully graded
      finalScore = null
    } else if (totalAutoGradedPoints === 0) {
      // All manual grading
      finalScore = null
    }

    console.log('Score calculation:', {
      autoGradedScore,
      totalAutoGradedPoints,
      totalManualGradingPoints,
      finalScore,
      status,
      needsManualGrading
    })

    // Create submission with answers
    const submission = await prisma.submission.create({
      data: {
        quizId: id,
        userId: session.user.id,
        score: finalScore,
        status,
        answers: {
          create: submissionAnswers
        }
      }
    })

    console.log('Submission created:', submission.id)

    return res.json({ 
      score: finalScore,
      status,
      needsManualGrading,
      submissionId: submission.id
    })
    
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return res.status(500).json({ 
      error: 'Failed to submit quiz',
      details: error.message 
    })
  }
}