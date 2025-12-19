import prisma from '../../../../lib/prisma'

export default async function handler(req, res) {
  const { slug } = req.query

  if (req.method !== 'GET') return res.status(405).end()

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true } },
      modules: {
        orderBy: { position: 'asc' },
        include: {
          lessons: {
            orderBy: { position: 'asc' }
          }
        }
      }
    }
  })

  if (!course) {
    return res.status(404).json({ message: 'Course not found' })
  }

  res.json(course)
}
