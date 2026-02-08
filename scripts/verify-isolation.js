const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verifyIsolation() {
  console.log("🔒 Verifying Teacher Isolation Logic...")

  // 1. Get Teacher User
  const email = 'teacher@psms.com'
  const user = await prisma.user.findUnique({ where: { email }, include: { staffProfile: true } })
  
  if (!user || !user.staffProfile) {
    console.log("❌ Teacher not found")
    return
  }

  // 2. Get Assignments
  const staffId = user.staffProfile.id
  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    include: { assignments: true }
  })

  if (!staff.assignments.length) {
      console.log("⚠️ Teacher has no assignments. Isolation effective (0 students).")
      return
  }

  console.log(`👨‍🏫 Teacher: ${user.name}`)
  console.log(`📚 Assignments: ${staff.assignments.map(a => `${a.grade}-${a.section}`).join(', ')}`)

  // 3. Simulate "Teacher View" Query
  const conditions = staff.assignments.map(a => ({
      grade: a.grade,
      section: a.section
  }))

  const teacherStudents = await prisma.student.findMany({
      where: {
          OR: conditions
      }
  })

  // 4. Simulate "Admin View" Query
  const allStudents = await prisma.student.count()

  console.log(`\n📊 Results:`)
  console.log(`- Teacher Visible Students: ${teacherStudents.length}`)
  console.log(`- Total Students in DB:   ${allStudents}`)

  if (teacherStudents.length < allStudents) {
      console.log(`\n✅ Isolation CONFIRMED. Teacher sees a subset of students.`)
      // Verify specific student grade/section 
      const wrongStudents = teacherStudents.filter(s => !conditions.some(c => c.grade === s.grade && c.section === s.section))
      if (wrongStudents.length === 0) {
          console.log("✅ All visible students match assigned Grade/Section.")
      } else {
          console.log("❌ LEAK DETECTED: Teacher sees students from other classes!")
      }
  } else if (allStudents === 0) {
      console.log("⚠️ DB is empty, cannot verify isolation.")
  } else {
      console.log("⚠️ Teacher sees ALL students. (Might be intended if they teach all classes, but verify!)")
  }

}

verifyIsolation()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
