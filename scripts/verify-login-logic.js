const { PrismaClient } = require('@prisma/client')
const { compare } = require('bcryptjs')
const prisma = new PrismaClient()

async function checkLogin(email, password) {
  console.log(`\nTesting login for: ${email}`)
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    console.log("❌ User not found")
    return
  }

  const isHash = user.password && user.password.startsWith("$2b$")
  let isValid = false

  if (isHash) {
      console.log("Type: Hashed Password")
      isValid = await compare(password, user.password)
  } else {
      console.log("Type: Plain Text Password")
      isValid = password === user.password
  }

  if (isValid) {
      console.log("✅ Login Success!")
  } else {
      console.log("❌ Login Failed (Password mismatch)")
      console.log(`Stored: ${user.password}`)
  }
}

async function main() {
    await checkLogin('teacher@psms.com', 'password123')
    await checkLogin('admin@psms.com', 'password123')
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
