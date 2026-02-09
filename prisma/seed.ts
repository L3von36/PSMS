import { PrismaClient, Role } from '../lib/generated-prisma'
const prisma = new PrismaClient()

async function main() {
    console.log('Checking for existing school...')
    let school = await prisma.school.findFirst()

    if (!school) {
        console.log('Creating default school...')
        school = await prisma.school.create({
            data: {
                name: 'Antigravity Academy',
                address: 'Addis Ababa, Ethiopia',
                email: 'info@antigravity.edu.et',
                phone: '+251 112 345 678',
            }
        })
        console.log(`✓ Created school: ${school.name}`)
    } else {
        console.log(`⊘ School already exists: ${school.name}`)
    }

    console.log('Seeding core roles...')
    const roles = [
        { email: 'admin@psms.com', name: 'Admin User', role: Role.ADMIN },
        { email: 'director@psms.com', name: 'Director', role: Role.DIRECTOR },
        { email: 'registrar@psms.com', name: 'Registrar', role: Role.REGISTRAR },
        { email: 'accountant@psms.com', name: 'Accountant', role: Role.ACCOUNTANT },
        { email: 'unitleader@psms.com', name: 'Unit Leader', role: Role.UNIT_LEADER },
        { email: 'teacher@psms.com', name: 'Teacher', role: Role.TEACHER },
    ]

    for (const r of roles) {
        const existingUser = await prisma.user.findUnique({
            where: { email: r.email }
        })

        if (!existingUser) {
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
            console.log(`✓ Created user: ${r.email}`)
        } else {
            console.log(`⊘ User already exists: ${r.email}`)
        }
    }

    console.log('Generating subjects...')
    const coreSubjects = ['Mathematics', 'English', 'Amharic', 'Science']
    const subjectMap: Record<string, string[]> = {}

    const existingSubjects = await prisma.subject.findMany({
        where: { schoolId: school.id }
    })

    if (existingSubjects.length === 0) {
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
        console.log(`✓ Created subjects for all grades`)
    } else {
        console.log(`⊘ Subjects already exist (${existingSubjects.length} found)`)
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
