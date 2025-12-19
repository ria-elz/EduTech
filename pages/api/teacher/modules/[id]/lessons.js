import prisma from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

const uploadDir = path.join(process.cwd(), 'public', 'uploads')

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query

  if (!session || session.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Forbidden' })
  }

  // Verify module belongs to teacher
  const module = await prisma.module.findUnique({
    where: { id },
    include: { 
      course: true,
      lessons: true
    }
  })

  if (!module || module.course.authorId !== session.user.id) {
    return res.status(404).json({ message: 'Module not found' })
  }

  if (req.method === 'POST') {
    try {
      const form = formidable({
        uploadDir,
        keepExtensions: true,
        maxFileSize: 50 * 1024 * 1024, // 50MB
      })

      const [fields, files] = await form.parse(req)

      const title = fields.title?.[0]
      const content = fields.content?.[0] || ''
      const videoUrl = fields.videoUrl?.[0] || null

      if (!title) {
        return res.status(400).json({ message: 'Title is required' })
      }

      // Get file URLs
      let pdfUrl = null
      let audioUrl = null

      if (files.pdf?.[0]) {
        const filename = path.basename(files.pdf[0].filepath)
        pdfUrl = `/uploads/${filename}`
      }

      if (files.audio?.[0]) {
        const filename = path.basename(files.audio[0].filepath)
        audioUrl = `/uploads/${filename}`
      }

      // Get the next position
      const maxPosition = module.lessons.length > 0 
        ? Math.max(...module.lessons.map(l => l.position))
        : 0

      const lesson = await prisma.lesson.create({
        data: {
          title,
          content,
          videoUrl,
          pdfUrl,
          audioUrl,
          position: maxPosition + 1,
          moduleId: id
        }
      })

      return res.status(201).json(lesson)
    } catch (error) {
      console.error('Error creating lesson:', error)
      return res.status(500).json({ error: 'Failed to create lesson' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}