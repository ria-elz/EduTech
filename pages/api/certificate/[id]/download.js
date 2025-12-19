import prisma from '../../../../lib/prisma'
import PDFDocument from 'pdfkit'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const certificate = await prisma.certificate.findUnique({
        where: { id },
        include: {
          user: true,
          course: {
            include: {
              author: true
            }
          }
        }
      })

      if (!certificate) {
        return res.status(404).json({ message: 'Certificate not found' })
      }

      // Create PDF
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      })

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `inline; filename=certificate-${certificate.certificateNo}.pdf`)

      doc.pipe(res)

      // Certificate Design
      // Border
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .lineWidth(3)
        .stroke('#2563eb')

      doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
        .lineWidth(1)
        .stroke('#3b82f6')

      // Title
      doc.fontSize(40)
        .font('Helvetica-Bold')
        .fillColor('#1e40af')
        .text('CERTIFICATE', 0, 100, { align: 'center' })

      doc.fontSize(20)
        .font('Helvetica')
        .fillColor('#64748b')
        .text('OF COMPLETION', 0, 150, { align: 'center' })

      // Presented to
      doc.fontSize(16)
        .fillColor('#475569')
        .text('This certificate is proudly presented to', 0, 220, { align: 'center' })

      // Student Name
      doc.fontSize(36)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text(certificate.studentName, 0, 260, { align: 'center' })

      // For completing
      doc.fontSize(16)
        .font('Helvetica')
        .fillColor('#475569')
        .text('for successfully completing the course', 0, 320, { align: 'center' })

      // Course Name
      doc.fontSize(28)
        .font('Helvetica-Bold')
        .fillColor('#2563eb')
        .text(certificate.courseName, 0, 360, { align: 'center', width: doc.page.width })

      // Date
      doc.fontSize(14)
        .font('Helvetica')
        .fillColor('#64748b')
        .text(
          `Completion Date: ${new Date(certificate.completionDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}`,
          0,
          430,
          { align: 'center' }
        )

      // Certificate Number
      doc.fontSize(10)
        .fillColor('#94a3b8')
        .text(`Certificate No: ${certificate.certificateNo}`, 0, 460, { align: 'center' })

      // Instructor Signature
      doc.fontSize(12)
        .font('Helvetica')
        .fillColor('#1e293b')
        .text('Instructor', 150, 520)

      doc.fontSize(16)
        .font('Helvetica-Bold')
        .text(certificate.course.author.name || 'Instructor', 150, 540)

      doc.moveTo(150, 535)
        .lineTo(300, 535)
        .stroke('#cbd5e1')

      // Platform
      doc.fontSize(12)
        .font('Helvetica')
        .fillColor('#1e293b')
        .text('EduPortal', doc.page.width - 300, 520)

      doc.fontSize(16)
        .font('Helvetica-Bold')
        .text('Learning Platform', doc.page.width - 300, 540)

      doc.moveTo(doc.page.width - 300, 535)
        .lineTo(doc.page.width - 150, 535)
        .stroke('#cbd5e1')

      doc.end()
    } catch (error) {
      console.error('Error generating PDF:', error)
      return res.status(500).json({ error: 'Failed to generate PDF' })
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' })
  }
}