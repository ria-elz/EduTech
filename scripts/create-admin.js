const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@example.com'
  const password = 'admin123'
  const hashedPassword = await bcrypt.hash(password, 10)

  // Check if admin exists
  const existing = await prisma.user.findUnique({
    where: { email }
  })

  if (existing) {
    // Update to admin
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    })
    console.log('✅ User updated to ADMIN role')
  } else {
    // Create new admin
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email,
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    console.log('✅ Admin user created')
  }

  console.log('Email:', email)
  console.log('Password:', password)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())