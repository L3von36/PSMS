const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'teacher@psms.com'
  const password = await hash('password123', 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password,
      role: 'TEACHER',
    },
    create: {
      email,
      name: 'Teacher Demo',
      password,
      role: 'TEACHER',
      staffProfile: {
        create: {
            firstName: 'Teacher',
            lastName: 'Demo',
            role: 'TEACHER'
        }
      }
    },
  })

  console.log(`User ${email} created/updated with role ${user.role}`)
  
  // Also ensure they have some classes assigned for the dashboard to not be empty
  const staff = await prisma.staff.findUnique({ where: { userId: user.id } })
  
  if (staff) {
      // Check assignments
      const assignments = await prisma.teacherAssignment.findMany({ where: { staffId: staff.id } })
      if (assignments.length === 0) {
          console.log("Assigning some dummy classes...")
          // Create a math subject if needed
          let math = await prisma.subject.findFirst({ where: { name: 'Mathematics' } })
          if (!math) {
             math = await prisma.subject.create({ data: { name: 'Mathematics', gradeLevel: '10' } })
          }
          
          await prisma.teacherAssignment.create({
              data: {
                  staffId: staff.id,
                  subjectId: math.id,
                  grade: '10',
                  section: 'A'
              }
          })
          console.log("Assigned Grade 10-A Math to teacher.")
      }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
