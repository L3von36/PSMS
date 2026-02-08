const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = 'teacher@psms.com'
  const user = await prisma.user.findUnique({
    where: { email },
    include: { staffProfile: true }
  })

  if (user) {
    console.log("✅ User found:", user.email, user.role)
    console.log("Staff Profile:", user.staffProfile)
    console.log("Password Hash:", user.password ? "Present" : "Missing")
  } else {
    console.log("❌ User NOT found in DB")
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect())
