import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const { slug } = req.query

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  // Get course by slug first
  const course = await prisma.course.findUnique({
    where: { slug }
  })

  if (!course) {
    return res.status(404).json({ message: 'Course not found' })
  }

  const courseId = course.id

  if (req.method === 'POST') {
    const { rating, comment } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' })
    }

    try {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: session.user.id,
          courseId
        }
      })

      if (!enrollment) {
        return res.status(403).json({ message: 'You must be enrolled to review this course' })
      }

      const review = await prisma.review.upsert({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId
          }
        },
        update: {
          rating,
          comment: comment || null
        },
        create: {
          rating,
          comment: comment || null,
          userId: session.user.id,
          courseId
        }
      })

      return res.json(review)
    } catch (error) {
      console.error('Error submitting review:', error)
      return res.status(500).json({ error: 'Failed to submit review' })
    }
  }

  if (req.method === 'GET') {
    try {
      const reviews = await prisma.review.findMany({
        where: { courseId },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return res.json(reviews)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      return res.status(500).json({ error: 'Failed to fetch reviews' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}