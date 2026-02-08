import { PrismaClient, Role } from '@prisma/client'
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
    await prisma.user.deleteMany()

    console.log('Seeding core roles...')
    const roles = [
        { email: 'admin@psms.com', name: 'Admin User', role: Role.ADMIN },
        { email: 'director@psms.com', name: 'Director Abebe', role: Role.DIRECTOR },
        { email: 'accountant@psms.com', name: 'Accountant Hana', role: Role.ACCOUNTANT },
        { email: 'registrar@psms.com', name: 'Registrar Sara', role: Role.REGISTRAR },
    ]

    for (const r of roles) {
        const u = await prisma.user.create({
            data: {
                email: r.email,
                name: r.name,
                password: 'password123',
                role: r.role,
                staffProfile: {
                    create: {
                        firstName: r.name.split(' ')[0],
                        lastName: r.name.split(' ')[1] || 'User',
                        role: r.role
                    }
                }
            }
        })
    }

    console.log('Generating subjects for all grades (1-12)...')
    const coreSubjects = ['Mathematics', 'English', 'Amharic', 'Science', 'Social Studies', 'ICT', 'Physical Education']
    const subjectMap: Record<string, string[]> = {}

    for (let grade = 1; grade <= 12; grade++) {
        subjectMap[grade.toString()] = []
        for (const subName of coreSubjects) {
            const sub = await prisma.subject.create({
                data: {
                    name: subName,
                    gradeLevel: grade.toString()
                }
            })
            subjectMap[grade.toString()].push(sub.id)
        }
    }

    console.log('Generating teachers and assignments...')
    const firstNames = ['Abebe', 'Belay', 'Chala', 'Dawit', 'Emebet', 'Fantu', 'Gebre', 'Hanna', 'Ismael', 'Jember', 'Kebede', 'Lemlem', 'Mulu', 'Negash', 'Olani', 'Petros', 'Rahel', 'Samuel', 'Tadesse', 'Worku', 'Yonas', 'Zehara']
    const lastNames = ['Tesfaye', 'Bekele', 'Tessema', 'Ayisheshim', 'Kebede', 'Haile', 'Mariam', 'Kedir', 'Mohammed', 'Gemechu']

    for (let i = 1; i <= 20; i++) {
        const fName = firstNames[i % firstNames.length]
        const lName = lastNames[i % lastNames.length]
        const email = `teacher${i}@psms.com`

        const teacher = await prisma.user.create({
            data: {
                email,
                name: `${fName} ${lName}`,
                password: 'password123',
                role: Role.TEACHER,
                staffProfile: {
                    create: {
                        firstName: fName,
                        lastName: lName,
                        role: Role.TEACHER
                    }
                }
            },
            include: { staffProfile: true }
        })

        if (teacher.staffProfile) {
            // Assign to 2-3 classes and a specific subject
            const assignedGrade = (Math.floor(Math.random() * 12) + 1).toString()
            const sections = ['A', 'B', 'C']
            const subjects = subjectMap[assignedGrade]
            const subId = subjects[Math.floor(Math.random() * subjects.length)]

            for (const section of sections.slice(0, 2)) {
                await prisma.teacherAssignment.create({
                    data: {
                        staffId: teacher.staffProfile.id,
                        grade: assignedGrade,
                        section,
                        subjectId: subId
                    }
                })
            }
        }
    }

    console.log('Generating 1500+ students with grades and histories...')
    const statuses = ['New', 'Returning', 'Transferred']
    const schools = ['Sunshine Academy', 'St. Joseph School', 'Lideta Catholic Cathedral School', 'School of Tomorrow', 'Gibson School Systems']

    for (let gradeNum = 1; gradeNum <= 12; gradeNum++) {
        const grade = gradeNum.toString()
        for (const section of ['A', 'B', 'C']) {
            console.log(`Seeding Grade ${grade} - Section ${section}...`)
            const studentsToCreate = []
            for (let s = 1; s <= 45; s++) {
                const fName = firstNames[(gradeNum * s) % firstNames.length]
                const lName = lastNames[(gradeNum + s) % lastNames.length]
                const status = statuses[Math.floor(Math.random() * statuses.length)]
                const history = status === 'Transferred'
                    ? `Transferred from ${schools[Math.floor(Math.random() * schools.length)]} due to family relocation.`
                    : 'Been with the school since primary levels.'
                const isCandidate = (gradeNum === 8 || gradeNum === 12) && Math.random() > 0.5
                const examId = isCandidate ? `NE-${gradeNum}-${Math.floor(1000 + Math.random() * 9000)}` : null
                const examResult = isCandidate && Math.random() > 0.3 ? Math.floor(Math.random() * 50 + 50) : null

                studentsToCreate.push({
                    firstName: fName,
                    lastName: lName + " Jr.",
                    grade,
                    section,
                    status,
                    enrollmentHistory: history,
                    isNationalExamCandidate: isCandidate,
                    nationalExamId: examId,
                    nationalExamResult: examResult,
                    email: `${fName.toLowerCase()}.${lName.toLowerCase()}.${grade}.${section}.${s}@student.psms.com`,
                    phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`
                })
            }

            // Batch create students for this section
            for (const stdData of studentsToCreate) {
                const student = await prisma.student.create({
                    data: stdData
                })

                // Generate realistic weighted grades for this student
                const subjects = subjectMap[grade]
                for (const subId of subjects) {
                    // CA (40%)
                    await prisma.grade.create({
                        data: {
                            studentId: student.id,
                            subjectId: subId,
                            score: Math.floor(Math.random() * 30 + 10), // 10-40
                            category: "CA",
                            term: 'Semester 1',
                            academicYear: "2017 E.C."
                        }
                    })
                    // Midterm (20%)
                    await prisma.grade.create({
                        data: {
                            studentId: student.id,
                            subjectId: subId,
                            score: Math.floor(Math.random() * 10 + 10), // 10-20
                            category: "Midterm",
                            term: 'Semester 1',
                            academicYear: "2017 E.C."
                        }
                    })
                }
            }
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
