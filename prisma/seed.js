const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // ⚠️ DELETE IN CORRECT ORDER (children → parents)
  await prisma.submission.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.answer.deleteMany()
  await prisma.question.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.module.deleteMany()
  await prisma.course.deleteMany()
  await prisma.user.deleteMany()

  // Create password
  const password = await bcrypt.hash('password123', 10)

  // Create users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password,
      role: 'ADMIN',
    },
  })

  const teacher = await prisma.user.create({
    data: {
      name: 'Teacher User',
      email: 'teacher@example.com',
      password,
      role: 'TEACHER',
    },
  })

  const student = await prisma.user.create({
    data: {
      name: 'Student User',
      email: 'student@example.com',
      password,
      role: 'STUDENT',
    },
  })

  // Create course with modules & lessons
  const course = await prisma.course.create({
    data: {
      title: 'Intro to JavaScript',
      slug: 'intro-to-javascript',
      description: 'A short course on JavaScript fundamentals.',
      published: true,
      authorId: teacher.id,
      modules: {
        create: [
          {
            title: 'Basics',
            position: 1,
            lessons: {
              create: [
                {
                  title: 'Variables & Types',
                  content: '<p>Variables and types are ...</p>',
                  position: 1,
                },
                {
                  title: 'Functions',
                  content: '<p>Functions are ...</p>',
                  position: 2,
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log('Seed completed successfully')
  console.log({ admin, teacher, student, course })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
