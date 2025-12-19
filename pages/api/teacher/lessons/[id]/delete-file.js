import prisma from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth'
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query

  if (!session || session.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Forbidden' })
  }

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
    const { fileType } = req.body

    try {
      if (fileType === 'pdf' && lesson.pdfUrl) {
        const filePath = path.join(process.cwd(), 'public', lesson.pdfUrl)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
        await prisma.lesson.update({
         where: { id },
          data: { pdfUrl: null }
        })
      } else if (fileType === 'audio' && lesson.audioUrl) {
         const filePath = path.join(process.cwd(), 'public', lesson.audioUrl)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
        await prisma.lesson.update({
          where: { id },
          data: { audioUrl: null }
        })
      }
      
      return res.json({ message: 'File deleted successfully' })
    } catch (error) {
      console.error('Error deleting file:', error)
      return res.status(500).json({ error: 'Failed to delete file' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}