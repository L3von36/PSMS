const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const password = await hash('password123', 12)

  const users = [
    { email: 'admin@psms.com', name: 'System Admin', role: 'ADMIN' },
    { email: 'director@psms.com', name: 'School Director', role: 'DIRECTOR' },
    { email: 'registrar@psms.com', name: 'School Registrar', role: 'REGISTRAR' },
    { email: 'accountant@psms.com', name: 'School Accountant', role: 'ACCOUNTANT' },
    { email: 'unitleader@psms.com', name: 'Unit Leader', role: 'UNIT_LEADER' },
    // Teacher already done, but no harm ensuring
    { email: 'teacher@psms.com', name: 'Teacher Demo', role: 'TEACHER' },
  ]

  console.log("🌱 Seeding Users...")

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        role: u.role,
        password: password 
      },
      create: {
        email: u.email,
        name: u.name,
        password: password,
        role: u.role,
        staffProfile: {
           create: {
               firstName: u.name.split(' ')[0],
               lastName: u.name.split(' ')[1] || 'User',
               role: u.role
           }
        }
      }
    })
    console.log(`✅ ${u.role}: ${u.email}`)
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect())
