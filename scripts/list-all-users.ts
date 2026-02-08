import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function listUsers() {
    const users = await prisma.user.findMany({
        select: {
            email: true,
            role: true,
            password: true
        },
        orderBy: { role: 'asc' }
    })

    console.log('\n=== ALL USERS IN DATABASE ===\n')
    users.forEach(u => {
        console.log(`📧 ${u.email.padEnd(25)} | Role: ${u.role.padEnd(12)} | Password: ${u.password}`)
    })
    console.log(`\nTotal: ${users.length} users\n`)

    await prisma.$disconnect()
}

listUsers().catch(console.error)
