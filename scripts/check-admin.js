const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@psms.com' }
  })

  if (user) {
    console.log("Admin Password:", user.password)
    const isHash = user.password && user.password.startsWith('$2b$')
    console.log("Is Bcrypt Hash?", isHash)
  } else {
    console.log("Admin user not found")
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
