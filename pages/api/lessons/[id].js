import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const lesson = await prisma.lesson.findUnique({
        where: { id },
        include: {
          module: {
            include: {
              course: true
            }
          },
          quiz: true
        }
      })

      if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' })
      }

      return res.json(lesson)
    } catch (error) {
      console.error('Error fetching lesson:', error)
      return res.status(500).json({ error: 'Failed to fetch lesson' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}