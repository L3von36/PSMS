export type Grade = {
    id: string
    score: number
    outOf: number
    category: string
    term: string
    academicYear: string
    createdAt: Date
    student: {
        id: string
        firstName: string
        lastName: string
        grade: string
        section: string
    }
    subject: {
        id: string
        name: string
    }
}
