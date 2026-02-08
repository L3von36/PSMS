import { PrismaClient, Role } from '../lib/generated-prisma'
const prisma = new PrismaClient()

async function main() {
    console.log('Cleaning existing data...')
    await prisma.grade.deleteMany()
    await prisma.teacherAssignment.deleteMany()
    await prisma.question.deleteMany()
    await prisma.exam.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.student.deleteMany()
    await prisma.staff.deleteMany()
    await prisma.parent.deleteMany()
    await prisma.subject.deleteMany()
    await prisma.school.deleteMany()
    await prisma.user.deleteMany()

    console.log('Creating default school...')
    const school = await prisma.school.create({
        data: {
            name: 'Antigravity Academy',
            address: 'Addis Ababa, Ethiopia',
            email: 'info@antigravity.edu.et',
            phone: '+251 112 345 678',
        }
    })

    console.log('Seeding core roles...')
    const roles = [
        { email: 'admin@psms.com', name: 'Admin User', role: Role.ADMIN },
        { email: 'director@psms.com', name: 'Director Abebe', role: Role.DIRECTOR },
        { email: 'accountant@psms.com', name: 'Accountant Hana', role: Role.ACCOUNTANT },
        { email: 'registrar@psms.com', name: 'Registrar Sara', role: Role.REGISTRAR },
    ]

    for (const r of roles) {
        await prisma.user.create({
            data: {
                email: r.email,
                name: r.name,
                password: 'password123',
                role: r.role,
                schoolId: school.id,
                staffProfile: {
                    create: {
                        firstName: r.name.split(' ')[0],
                        lastName: r.name.split(' ')[1] || 'User',
                        role: r.role,
                        schoolId: school.id
                    }
                }
            }
        })
    }

    console.log('Generating subjects...')
    const coreSubjects = ['Mathematics', 'English', 'Amharic', 'Science']
    const subjectMap: Record<string, string[]> = {}

    for (let grade = 1; grade <= 12; grade++) {
        subjectMap[grade.toString()] = []
        for (const subName of coreSubjects) {
            const sub = await prisma.subject.create({
                data: {
                    name: subName,
                    gradeLevel: grade.toString(),
                    schoolId: school.id
                }
            })
            subjectMap[grade.toString()].push(sub.id)
        }
    }

    console.log('Mock data generation complete!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
