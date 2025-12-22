import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const courses = await prisma.course.findMany({
        where: { published: true },
        include: {
          author: {
            select: {
              name: true,
              email: true
            }
          },
          modules: {
            include: {
              lessons: true
            }
          },
          enrollments: true,
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      const coursesWithStats = courses.map(course => {
        const totalRatings = course.reviews.length
        const avgRating = totalRatings > 0
          ? parseFloat((course.reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1))
          : 0

        const lessonCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)

        return {
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          published: course.published,
          createdAt: course.createdAt,
          author: course.author,
          enrollments: course.enrollments,
          avgRating,
          totalRatings,
          lessonCount
        }
      })

      return res.json(coursesWithStats)
    } catch (error) {
      console.error('Error fetching courses:', error)
      return res.status(500).json({ error: 'Failed to fetch courses' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}