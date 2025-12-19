import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

const uploadDir = path.join(process.cwd(), 'public', 'uploads')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

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

  if (req.method === 'GET') {
    return res.json(lesson)
  }

  if (req.method === 'PUT') {
    try {
      const form = formidable({
        uploadDir,
        keepExtensions: true,
        maxFileSize: 50 * 1024 * 1024,
      })

      const [fields, files] = await form.parse(req)

      const title = fields.title?.[0]
      const content = fields.content?.[0] || ''
      const videoUrl = fields.videoUrl?.[0] || null

      const updateData = {
        title,
        content,
        videoUrl
      }

      // Handle new PDF upload
      if (files.pdf?.[0]) {
        // Delete old PDF if exists
        if (lesson.pdfUrl) {
          const oldPath = path.join(process.cwd(), 'public', lesson.pdfUrl)
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath)
          }
        }
        const filename = path.basename(files.pdf[0].filepath)
        updateData.pdfUrl = `/uploads/${filename}`
      } 

      // Handle new audio upload
      if (files.audio?.[0]) {
        // Delete old audio if exists
        if (lesson.audioUrl) {
          const oldPath = path.join(process.cwd(), 'public', lesson.audioUrl)
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath)
          }
        }
        const filename = path.basename(files.audio[0].filepath)
        updateData.audioUrl = `/uploads/${filename}`
      }

      const updatedLesson = await prisma.lesson.update({
        where: { id },
        data: updateData
      })

      return res.json(updatedLesson)
    } catch (error) {
      console.error('Error updating lesson:', error)
      return res.status(500).json({ error: 'Failed to update lesson' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Delete files
      if (lesson.pdfUrl) {
        const pdfPath = path.join(process.cwd(), 'public', lesson.pdfUrl)
        if (fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath)
        }
      }
      if (lesson.audioUrl) {
        const audioPath = path.join(process.cwd(), 'public', lesson.audioUrl)
        if (fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath)
        }
      }

      await prisma.lesson.delete({
        where: { id }
      })

      return res.json({ message: 'Lesson deleted successfully' })
    } catch (error) {
      console.error('Error deleting lesson:', error)
      return res.status(500).json({ error: 'Failed to delete lesson' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}