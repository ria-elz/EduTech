import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query

  if (!session || session.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Forbidden' })
  }

  if (req.method === 'GET') {
    try {
      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          modules: {
            include: {
              lessons: true
            }
          }
        }
      })

      if (!course || course.authorId !== session.user.id) {
        return res.status(404).json({ message: 'Course not found' })
      }

      return res.json(course)
    } catch (error) {
      console.error('Error fetching course:', error)
      return res.status(500).json({ error: 'Failed to fetch course' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          modules: {
            include: {
              lessons: true
            }
          }
        }
      })

      if (!course || course.authorId !== session.user.id) {
        return res.status(404).json({ message: 'Course not found' })
      }

      // Delete all uploaded files
      for (const module of course.modules) {
        for (const lesson of module.lessons) {
          // Delete PDF file
          if (lesson.pdfUrl) {
            try {
              const pdfPath = path.join(process.cwd(), 'public', lesson.pdfUrl)
              if (fs.existsSync(pdfPath)) {
                fs.unlinkSync(pdfPath)
              }
            } catch (err) {
              console.error('Error deleting PDF:', err)
            }
          }
          // Delete audio file
          if (lesson.audioUrl) {
            try {
              const audioPath = path.join(process.cwd(), 'public', lesson.audioUrl)
              if (fs.existsSync(audioPath)) {
                fs.unlinkSync(audioPath)
              }
            } catch (err) {
              console.error('Error deleting audio:', err)
            }
          }
        }
      }

      // Delete course (cascade will delete modules, lessons, etc.)
      await prisma.course.delete({
        where: { id }
      })

      return res.json({ message: 'Course deleted successfully' })
    } catch (error) {
      console.error('Error deleting course:', error)
      return res.status(500).json({ error: 'Failed to delete course' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}